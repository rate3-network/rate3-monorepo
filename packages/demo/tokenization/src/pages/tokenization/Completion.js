import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { translate } from 'react-i18next';

import TransactionProgressStepper from '../../components/TransactionProgressStepper';
import styles from '../_common/completionStyles';
import { compose } from '../../utils';

const Completion = ({
  classes,
  t,
  txHash,
  submissionConfirmed,
  networkConfirmed,
  trusteeApproved,
  transactionError,
}) => (
  <React.Fragment>
    <h1 className={classes.header}>
      {transactionError ? t('transactionFailed') : t('transactionSubmitted')}
    </h1>
    {
      transactionError
        ? (
          <div className={classes.subheader}>
            {t('pleaseTryAgainLater')}
          </div>
        )
        : (
          <div className={classes.subheader}>
            {t('txHash')} <span className={classes.hash}>{txHash}</span>
          </div>
        )
    }
    <div className={classes.stepper}>
      <TransactionProgressStepper
        steps={[
          {
            text: t('transactionSubmission'),
            completed: submissionConfirmed,
            error: transactionError,
          },
          {
            text: t('networkConfirmation'),
            completed: networkConfirmed,
            error: transactionError,
          },
          {
            text: t('trusteeApproval'),
            completed: trusteeApproved,
            error: transactionError,
          },
        ]}
      />
    </div>
  </React.Fragment>
);

Completion.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  txHash: PropTypes.string.isRequired,
  submissionConfirmed: PropTypes.bool.isRequired,
  networkConfirmed: PropTypes.bool.isRequired,
  trusteeApproved: PropTypes.bool.isRequired,
  transactionError: PropTypes.bool.isRequired,
};

export default compose(
  withStyles(styles, { withTheme: true }),
  translate('tokenization'),
)(Completion);
