import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { translate } from 'react-i18next';

import Grid from '@material-ui/core/Grid';

import { compose } from '../../utils';
import {
  userConfirmationLabel,
  userConfirmationValue,
} from '../../constants/colors';
import { SgdPill } from '../../components/CurrencyPill';


const styles = theme => ({
  root: {
    letterSpacing: 0,
  },
  label: {
    color: userConfirmationLabel,
    marginBottom: '0.5em',
  },
  currencyPillAmount: {
    display: 'table-cell',
    paddingRight: '5px',
  },
  value: {
    color: userConfirmationValue,
    fontWeight: 'bold',
    marginBottom: '0.5em',
  },
});

const Confirmation = ({
  classes,
  t,
  amount,
  trustBank,
  trustSwiftCode,
  trustAccount,
  gasLimit,
  gasPrice,
}) => (
  <React.Fragment>
    <Grid container className={classes.root}>
      {
        [
          {
            label: t('amountLabel'),
            value: amount && (
              <React.Fragment>
                <div className={classes.currencyPillAmount}>{amount}</div>
                <SgdPill />
              </React.Fragment>
            ),
          },
          { label: t('trustBankLabel'), value: trustBank },
          { label: t('trustSwiftCodeLabel'), value: trustSwiftCode },
          { label: t('trustAccountLabel'), value: trustAccount },
          { label: t('gasLimitLabel'), value: gasLimit && `${gasLimit} UNITS` },
          { label: t('gasPriceLabel'), value: gasPrice && `${gasPrice} GWEI` },
        ].map(row => (
          <React.Fragment key={row.label}>
            <Grid item xs={6} classes={{ item: classes.label }}>
              {row.label}
            </Grid>
            <Grid item xs={6} classes={{ item: classes.value }}>
              {row.value}
            </Grid>
          </React.Fragment>
        ))
      }
    </Grid>
  </React.Fragment>
);

Confirmation.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  amount: PropTypes.string.isRequired,
  trustBank: PropTypes.string.isRequired,
  trustSwiftCode: PropTypes.string.isRequired,
  trustAccount: PropTypes.string.isRequired,
  gasLimit: PropTypes.string.isRequired,
  gasPrice: PropTypes.string.isRequired,
};

export default compose(
  withStyles(styles, { withTheme: true }),
  translate('tokenization'),
)(Confirmation);
