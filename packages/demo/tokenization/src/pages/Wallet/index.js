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

import NetworkDropdown from '../../components/NetworkDropdown';
import { EtherscanAddrLink } from '../../components/EtherscanLink';

import {
  tabIndicator,
  tabIndicatorBg,
  walletUserCardBg,
  walletTrusteeCardBg,
  networkRopstenBullet,
  networkRopstenBg,
  networkRinkebyBullet,
  networkRinkebyBg,
  networkKovanBullet,
  networkKovanBg,
  networkLocalhostBullet,
  networkLocalhostBg,
} from '../../constants/colors';
import { userName, trusteeName, bankName } from '../../constants/defaults';
import { ropsten, rinkeby, kovan } from '../../constants/addresses';

import {
  change as networkChangeAction,
} from '../../actions/Network';
import {
  switchSettingsTab as switchSettingsTabAction,
} from '../../actions/Wallet';
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
  networkDropdownContainer: {
    marginBottom: '2em',
  },
  ropstenBullet: {
    backgroundColor: networkRopstenBullet,
  },
  ropstenBg: {
    backgroundColor: networkRopstenBg,
  },
  rinkebyBullet: {
    backgroundColor: networkRinkebyBullet,
  },
  rinkebyBg: {
    backgroundColor: networkRinkebyBg,
  },
  kovanBullet: {
    backgroundColor: networkKovanBullet,
  },
  kovanBg: {
    backgroundColor: networkKovanBg,
  },
  localhostBullet: {
    backgroundColor: networkLocalhostBullet,
  },
  localhostBg: {
    backgroundColor: networkLocalhostBg,
  },
});

class Wallet extends React.Component {
  handleChange = (event, tabIndex) => {
    const { switchSettingsTab } = this.props;
    switchSettingsTab(tabIndex);
  };

  renderTabs(tabs) {
    const {
      classes,
      currentTab,
    } = this.props;

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

  renderNetworkSelection() {
    const {
      classes,
      t,
      networkId,
      changeNetwork,
    } = this.props;

    let currentNetworkName;
    let currentNetworkId = networkId;
    let bulletClass;
    let buttonClass;
    switch (networkId) {
      case ropsten.id:
        currentNetworkName = t('ropsten');
        buttonClass = classes.ropstenBg;
        bulletClass = classes.ropstenBullet;
        break;
      case rinkeby.id:
        currentNetworkName = t('rinkeby');
        buttonClass = classes.rinkebyBg;
        bulletClass = classes.rinkebyBullet;
        break;
      case kovan.id:
        currentNetworkName = t('kovan');
        buttonClass = classes.kovanBg;
        bulletClass = classes.kovanBullet;
        break;
      default:
        currentNetworkName = t('ropsten');
        buttonClass = classes.ropstenBg;
        bulletClass = classes.ropstenBullet;
        // currentNetworkId = -1;
        // currentNetworkName = t('localhost');
        // buttonClass = classes.localhostBg;
        // bulletClass = classes.localhostBullet;
    }

    const choices = [
      { label: t('ropsten'), value: ropsten.id },
      { label: t('rinkeby'), value: rinkeby.id },
      { label: t('kovan'), value: kovan.id },
      // { label: t('localhost'), value: -1 },
    ];

    return (
      <div className={classes.networkDropdownContainer}>
        <NetworkDropdown
          buttonText={currentNetworkName}
          currentNetwork={currentNetworkId}
          networks={choices}
          onChange={(newNetworkId) => {
            if (currentNetworkId !== newNetworkId) {
              changeNetwork(newNetworkId);
            }
          }}
          classes={{
            networkButtonContainer: buttonClass,
            networkBullet: bulletClass,
          }}
        />
      </div>
    );
  }

  renderSelections(selections) {
    const { classes, isUser } = this.props;

    return (
      <Grid container spacing={24}>
        {selections.map(content => (
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
        ))}
      </Grid>
    );
  }

  render() {
    const {
      classes,
      t,
      isUser,
      networkId,
      userDefaultAccount,
      trusteeDefaultAccount,
      userAccounts,
      trusteeAccounts,
      currentTab,
    } = this.props;

    const tabs = {
      [true]: [
        {
          label: t('bankAccountTab'),
          value: 0,
          content: (
            <React.Fragment>
              {this.renderSelections([
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
              ])}
            </React.Fragment>
          ),
        },
        {
          label: t('ethWalletTab'),
          value: 1,
          content: (
            <React.Fragment>
              {this.renderNetworkSelection()}
              {this.renderSelections(userAccounts.map(acc => ({
                key: acc,
                title: userName,
                paragraph: (
                  <EtherscanAddrLink
                    networkId={networkId}
                    addr={acc}
                  />
                ),
                footer: acc === userDefaultAccount && (
                  <React.Fragment>
                    <CheckCircle />&nbsp;<strong>{t('inUse')}</strong>
                  </React.Fragment>
                ),
              })))}
            </React.Fragment>
          ),
        },
      ],
      [false]: [
        {
          label: t('ethWalletTab'),
          value: 0,
          content: (
            <React.Fragment>
              {this.renderNetworkSelection()}
              {this.renderSelections(trusteeAccounts.map(acc => ({
                key: acc,
                title: trusteeName,
                paragraph: (
                  <EtherscanAddrLink
                    networkId={networkId}
                    addr={acc}
                  />
                ),
                footer: acc === trusteeDefaultAccount && (
                  <React.Fragment>
                    <CheckCircle />&nbsp;<strong>{t('inUse')}</strong>
                  </React.Fragment>
                ),
              })))}
            </React.Fragment>
          ),
        },
      ],
    };

    return (
      <React.Fragment>
        {this.renderTabs(tabs[isUser])}
        <div className={classes.tabContent}>
          {tabs[isUser][currentTab].content}
        </div>
      </React.Fragment>
    );
  }
}

Wallet.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  networkId: PropTypes.number.isRequired,
  isUser: PropTypes.bool.isRequired,
  userDefaultAccount: PropTypes.string.isRequired,
  trusteeDefaultAccount: PropTypes.string.isRequired,
  userAccounts: PropTypes.arrayOf(PropTypes.string).isRequired,
  trusteeAccounts: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentTab: PropTypes.number.isRequired,
  changeNetwork: PropTypes.func.isRequired,
  switchSettingsTab: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  networkId: state.network.id,
  isUser: state.wallet.isUser,

  userDefaultAccount: state.wallet.userDefaultAccount,
  trusteeDefaultAccount: state.wallet.trusteeDefaultAccount,

  userAccounts: state.wallet.userAccounts,
  trusteeAccounts: state.wallet.trusteeAccounts,

  currentTab: state.wallet.settingsTab,
});

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  translate('wallet'),
  connect(
    mapStateToProps,
    {
      changeNetwork: networkChangeAction,
      switchSettingsTab: switchSettingsTabAction,
    },
  ),
);

export default enhance(Wallet);
