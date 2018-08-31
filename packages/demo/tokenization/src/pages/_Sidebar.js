import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Link,
  withRouter,
} from 'react-router-dom';
import { Trans, translate } from 'react-i18next';

import blockies from 'ethereum-blockies';
import Decimal from 'decimal.js-light';

import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';

import LanguageDropdown from './LanguageDropdown';
import AccountBalance from '../components/sidebar/AccountBalance';
import AccountsSummary from '../components/sidebar/AccountsSummary';
import Switch from '../components/sidebar/Switch';
import ListLinkItem from '../components/sidebar/ListLinkItem';

import {
  sgdColor,
  sgdrColor,
  trusteeNavEmphasisPrimary,
  trusteeNavFooterBg,
  trusteeNavFooterText,
  userNavEmphasisPrimary,
  userNavFooterBg,
  userNavFooterText,
} from '../constants/colors';
import {
  approvePath,
  faqPath,
  finalizePath,
  tokenizePath,
  transactionsPath,
  walletSettingsPath,
  withdrawPath,
} from '../constants/urls';
import { ethDecimalPlaces, userBlockie, trusteeBlockie } from '../constants/defaults';

import { compose, genStyle, getClass } from '../utils';

export const drawerWidth = 300;

const styles = theme => ({
  drawerHeader: {
    padding: theme.spacing.unit * 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',

  },
  drawerLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  drawerPadding: {
    flexGrow: 1,
  },
  ...genStyle('drawerCircularProfile', isUser => ({
    width: `${drawerWidth / 3}px`,
    height: `${drawerWidth / 3}px`,
    borderRadius: `${drawerWidth / 3}px`,
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: isUser ? userNavEmphasisPrimary : trusteeNavEmphasisPrimary,
  })),
  ...genStyle('drawerRole', isUser => ({
    textTransform: 'uppercase',
    fontSize: '2em',
    fontWeight: 'bold',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
  })),
  ...genStyle('drawerBalance', isUser => ({
    fontSize: '0.9em',
    marginBottom: '1.5rem',
  })),
  ...genStyle('drawerFooter', isUser => ({
    width: '100%',
    boxSizing: 'border-box',
    padding: theme.spacing.unit * 2,
    textAlign: 'left',
    textTransform: 'uppercase',
    fontSize: '0.8em',
    color: isUser ? userNavFooterText : trusteeNavFooterText,
    backgroundColor: isUser ? userNavFooterBg : trusteeNavFooterBg,
  })),
  sgdCurrency: {
    color: sgdColor,
  },
  sgdrCurrency: {
    color: sgdrColor,
  },
});

class Sidebar extends React.Component {
  handleRoleSwitch = () => {
    const {
      switchToTrustee,
      switchToUser,
      isUser,
    } = this.props;

    if (isUser) {
      switchToTrustee();
    } else {
      switchToUser();
    }
  };

  renderPendingValue = value => (
    <Trans i18nKey="pendingAmount">
      {''}
      {{ value }}
      pending
    </Trans>
  )

  render() {
    const {
      classes,
      t,
      isUser,
      currentDefaultAccount,
      currentEthBalance,
      currentTokenBalance,
      currentBankBalance,
      currentPendingTokenization,
      currentPendingWithdrawal,
    } = this.props;

    return (
      <React.Fragment>
        <div className={classes.drawerHeader}>
          <Link to={faqPath} className={classes.drawerLink}>
            {t('faq')}
          </Link>
          <LanguageDropdown />
        </div>
        <div>
          <img
            className={getClass(classes, 'drawerCircularProfile', isUser)}
            src={
              blockies.create({
                seed: currentDefaultAccount,
                ...(isUser ? userBlockie : trusteeBlockie),
                scale: Math.ceil(drawerWidth / (3 * 8)),
              }).toDataURL()
            }
            alt=""
          />
        </div>
        <h1 className={getClass(classes, 'drawerRole', isUser)}>
          {isUser ? t('user') : t('trustee')}
        </h1>
        <div className={getClass(classes, 'drawerBalance', isUser)}>
          {t('ethWallet')}:{' '}
          <strong>
            {
              (new Decimal(currentEthBalance))
                .todp(ethDecimalPlaces, Decimal.ROUND_DOWN)
                .toString()
            }
            <small>&nbsp;ETH</small>
          </strong>
        </div>
        <Switch
          onChange={this.handleRoleSwitch}
          isUser={isUser}
          leftText={t('user')}
          rightText={t('trustee')}
        />
        <AccountsSummary>
          <AccountBalance
            currency="SGDR"
            name={isUser ? t('ethWallet') : t('circulatingTokens')}
            amount={currentTokenBalance}
            pendingAmount={(new Decimal(currentPendingTokenization)).isZero()
              ? null
              : currentPendingTokenization
            }
            renderPending={this.renderPendingValue}
            classes={{
              currency: classes.sgdrCurrency,
            }}
          />
          <AccountBalance
            currencySymbol="$"
            currency="SGD"
            name={isUser ? t('bankAccount') : t('trustBalance')}
            amount={currentBankBalance}
            pendingAmount={(new Decimal(currentPendingWithdrawal)).isZero()
              ? null
              : currentPendingWithdrawal
            }
            renderPending={this.renderPendingValue}
            classes={{
              currency: classes.sgdCurrency,
            }}
          />
        </AccountsSummary>
        <List component="div">
          {isUser && (
            <ListLinkItem
              to={{ pathname: tokenizePath, state: { isUser: true } }}
              primary={t('tokenize')}
              isUser
            />
          )}
          {isUser && (
            <ListLinkItem
              to={{ pathname: withdrawPath, state: { isUser: true } }}
              primary={t('withdraw')}
              isUser
            />
          )}
          {!isUser && (
            <ListLinkItem
              to={{ pathname: approvePath, state: { isUser: false } }}
              primary={t('approval')}
              isUser={false}
            />
          )}
          {!isUser && (
            <ListLinkItem
              to={{ pathname: finalizePath, state: { isUser: false } }}
              primary={t('finalizationOrRevocation')}
              isUser={false}
            />
          )}
          <ListLinkItem
            to={{ pathname: transactionsPath, state: { isUser } }}
            primary={t('transactions')}
            isUser={isUser}
          />
        </List>
        <div className={classes.drawerPadding} />
        <div className={getClass(classes, 'drawerFooter', isUser)}>
          <Link to={walletSettingsPath} className={classes.drawerLink}>
            {t('walletSettings')}
          </Link>
        </div>
      </React.Fragment>
    );
  }
}

Sidebar.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  isUser: PropTypes.bool.isRequired,
  currentDefaultAccount: PropTypes.string.isRequired,
  currentEthBalance: PropTypes.string.isRequired,
  currentTokenBalance: PropTypes.string.isRequired,
  currentBankBalance: PropTypes.string.isRequired,
  currentPendingTokenization: PropTypes.string.isRequired,
  currentPendingWithdrawal: PropTypes.string.isRequired,
  switchToUser: PropTypes.func.isRequired,
  switchToTrustee: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isUser: state.wallet.isUser,
  currentDefaultAccount: state.wallet.currentDefaultAccount,
  currentEthBalance: state.wallet.currentEthBalance,
  currentTokenBalance: state.wallet.currentTokenBalance,
  currentBankBalance: state.wallet.currentBankBalance,
  currentPendingTokenization: state.wallet.currentPendingTokenization,
  currentPendingWithdrawal: state.wallet.currentPendingWithdrawal,
});

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  withRouter,
  translate('navigator'),
  connect(
    mapStateToProps,
  ),
);

export default enhance(Sidebar);
