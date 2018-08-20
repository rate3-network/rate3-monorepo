import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { translate } from 'react-i18next';

import Grid from '@material-ui/core/Grid';

import { SgdrPill, SgdPill } from '../../components/CurrencyPill';
import styles from '../_common/confirmationStyles';
import { compose } from '../../utils';

const Confirmation = ({
  classes,
  t,
  amount,
  gasLimit,
  gasPrice,
}) => (
  <React.Fragment>
    <Grid container className={classes.root}>
      {
        [
          {
            label: t('amountToWithdrawLabel'),
            value: amount && (
              <React.Fragment>
                {amount} <SgdrPill />
              </React.Fragment>
            ),
          },
          {
            label: t('amountToReceiveLabel'),
            value: amount && (
              <React.Fragment>
                {amount} <SgdPill />
              </React.Fragment>
            ),
          },
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
  gasLimit: PropTypes.string.isRequired,
  gasPrice: PropTypes.string.isRequired,
};

export default compose(
  withStyles(styles, { withTheme: true }),
  translate('withdrawal'),
)(Confirmation);
