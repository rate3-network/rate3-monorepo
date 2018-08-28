import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import CheckCircle from '@material-ui/icons/CheckCircle';

import {
  tabIndicator,
  tabIndicatorBg,
  walletUserCardBg,
  walletTrusteeCardBg,
} from '../../constants/colors';
import { userName, trusteeName, bankName } from '../../constants/defaults';
import { compose, genStyle, getClass } from '../../utils';

const styles = theme => ({
  tabButton: {
    borderBottom: `0.5px solid ${tabIndicatorBg}`,
  },
  tabIndicator: {
    backgroundColor: tabIndicator,
  },
  tabContent: {
    width: '100%',
    margin: '2em 0',
    letterSpacing: 0,
  },
  ...genStyle('paperRoot', isUser => ({
    padding: '2em',
    textAlign: 'center',
    backgroundColor: isUser ? walletUserCardBg : walletTrusteeCardBg,
  })),
  paperRounded: {
    borderRadius: '1em',
  },
  paperTitle: {
    fontSize: '1.2em',
    fontWeight: 'bold',
    marginBottom: '1em',
    letterSpacing: '0.02em',
  },
  paperPara: {
    fontWeight: 300,
    marginBottom: '2em',
    wordBreak: 'break-word',
  },
  paperFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

class Wallet extends React.Component {
  state = {
    currentTab: 0,
  };

  componentWillReceiveProps(nextProps) {
    const { isUser } = this.props;
    if (nextProps.isUser !== isUser) {
      this.setState({ currentTab: 0 });
    }
  }

  handleChange = (event, tabIndex) => {
    this.setState({ currentTab: tabIndex });
  };

  renderTabs(tabs) {
    const {
      classes,
    } = this.props;
    const { currentTab } = this.state;

    return (
      <React.Fragment>
        <Tabs
          value={currentTab}
          textColor="inherit"
          onChange={this.handleChange}
          classes={{
            indicator: classes.tabIndicator,
          }}
        >
          {
            tabs.map(tab => (
              <Tab
                key={tab.value}
                label={tab.label}
                value={tab.value}
                classes={{ root: classes.tabButton }}
              />
            ))
          }
        </Tabs>
      </React.Fragment>
    );
  }

  render() {
    const {
      classes,
      t,
      isUser,
      userDefaultAccount,
      trusteeDefaultAccount,
      userAccounts,
      trusteeAccounts,
    } = this.props;
    const { currentTab } = this.state;

    const tabs = {
      [true]: [
        {
          label: t('bankAccountTab'),
          value: 0,
          content: [
            {
              key: bankName,
              title: bankName,
              paragraph: t('linkBankAccount'),
              footer: (
                <React.Fragment>
                  <CheckCircle />&nbsp;<strong>{t('verified')}</strong>
                </React.Fragment>
              ),
            },
          ],
        },
        {
          label: t('ethWalletTab'),
          value: 1,
          content: userAccounts.map(acc => ({
            key: acc,
            title: userName,
            paragraph: acc,
            footer: acc === userDefaultAccount && (
              <React.Fragment>
                <CheckCircle />&nbsp;<strong>{t('inUse')}</strong>
              </React.Fragment>
            ),
          })),
        },
      ],
      [false]: [
        {
          label: t('ethWalletTab'),
          value: 0,
          content: trusteeAccounts.map(acc => ({
            key: acc,
            title: trusteeName,
            paragraph: acc,
            footer: acc === trusteeDefaultAccount && (
              <React.Fragment>
                <CheckCircle />&nbsp;<strong>{t('inUse')}</strong>
              </React.Fragment>
            ),
          })),
        },
      ],
    };

    return (
      <React.Fragment>
        {this.renderTabs(tabs[isUser])}
        <div className={classes.tabContent}>
          <Grid container spacing={24}>
            {
              tabs[isUser][currentTab].content.map(content => (
                <Grid key={content.key} item xs={12} sm={6} lg={3}>
                  <Paper
                    elevation={0}
                    square={false}
                    classes={{
                      root: getClass(classes, 'paperRoot', isUser),
                      rounded: classes.paperRounded,
                    }}
                  >
                    <h1 className={classes.paperTitle}>
                      {content.title}
                    </h1>
                    <p className={classes.paperPara}>
                      {content.paragraph}
                    </p>
                    <div className={classes.paperFooter}>
                      {content.footer}
                    </div>
                  </Paper>
                </Grid>
              ))
            }
          </Grid>
        </div>
      </React.Fragment>
    );
  }
}

Wallet.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  isUser: PropTypes.bool.isRequired,
  userDefaultAccount: PropTypes.string.isRequired,
  trusteeDefaultAccount: PropTypes.string.isRequired,
  userAccounts: PropTypes.arrayOf(PropTypes.string).isRequired,
  trusteeAccounts: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  isUser: state.wallet.isUser,

  userDefaultAccount: state.wallet.userDefaultAccount,
  trusteeDefaultAccount: state.wallet.trusteeDefaultAccount,

  userAccounts: state.wallet.userAccounts,
  trusteeAccounts: state.wallet.trusteeAccounts,
});

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  translate('wallet'),
  connect(
    mapStateToProps,
  ),
);

export default enhance(Wallet);
