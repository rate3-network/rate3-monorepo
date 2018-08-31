import React from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Decimal from 'decimal.js-light';
import Countdown from 'react-countdown-now';

import Gas from '../_common/Gas';
import Confirmation from '../_common/Confirmation';
import Completion from '../_common/Completion';

import Stepper from '../../components/Stepper';
import Button from '../../components/Button';
import Table from '../../components/transactions/Table';
import { SgdPill, SgdrPill } from '../../components/CurrencyPill';
import MaterialDesignSpinner from '../../components/spinners/MaterialDesignSpinner';
import { EtherscanTxnLink } from '../../components/EtherscanLink';

import {
  renderTxHash,
  renderFromAddr,
  renderDate,
  renderAmount,
} from '../Transactions';
import { buttonTextPrimary } from '../../constants/colors';
import { ethDecimalPlaces } from '../../constants/defaults';
import { transactionsPath } from '../../constants/urls';

import {
  nextStep as nextStepAction,
  prevStep as prevStepAction,
  reset as resetAction,
  setField as setFieldAction,
  selectTransactionToFinalize as selectTransactionToFinalizeAction,
  selectTransactionToRevoke as selectTransactionToRevokeAction,
  submitRequest as submitRequestAction,
  finalizeFields,
} from '../../actions/Finalize';
import {
  setPendingFinalizePage as setPendingFinalizePageAction,
  setPendingFinalizeRowsPerPage as setPendingFinalizeRowsPerPageAction,
} from '../../actions/Transactions';
import { compose } from '../../utils';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 3,
  },
  selectTableRoot: {
    marginTop: theme.spacing.unit * 5,
  },
  forms: {
    paddingLeft: theme.spacing.unit * 8,
    paddingRight: theme.spacing.unit * 8,
    maxWidth: '600px',
    margin: '3em auto',
    boxSizing: 'border-box',
  },
  '@media (max-width: 959.95px)': {
    root: {
      padding: 0,
    },
    forms: {
      padding: 0,
    },
  },
  description: {
    fontWeight: 'bold',
    maxWidth: '600px',
  },
  descriptionNote: {
    fontSize: '0.8em',
    maxWidth: '600px',
  },
  buttons: {
    maxWidth: '600px',
    margin: 'auto',
  },
  backButton: {
    display: 'inline-block',
  },
  nextButton: {
    display: 'inline-block',
  },
});

class Finalize extends React.Component {
  getSteps() {
    const { t } = this.props;

    return [
      t('stepper:gasLimitAndPrice'),
      t('stepper:confirmation'),
    ];
  }

  handleFormSubmit = (e) => {
    e.preventDefault();
    this.handleNextStep();
  }

  handleNextStep = () => {
    const {
      selectedTransaction,
      gasLimit,
      gasPrice,
      currentStep,
      nextStep,
      submitRequest,
    } = this.props;
    if (!this.canProceedNextStep(currentStep)) {
      return;
    }
    if (currentStep >= this.getSteps().length + 1) {
      return;
    }
    if (currentStep === 2) {
      submitRequest(
        selectedTransaction.index,
        selectedTransaction.from,
        gasLimit,
        gasPrice,
      );
      return;
    }
    nextStep();
  }

  handlePrevStep = () => {
    const { currentStep, prevStep } = this.props;
    if (currentStep === 0) {
      return;
    }
    prevStep();
  }

  handleReset = () => {
    const { reset } = this.props;
    reset();
  }

  handleFieldChange = field => (newValue) => {
    const { setField } = this.props;
    setField(field, newValue);
  }

  handleFinalizeClick = txn => () => {
    const { selectTransactionToFinalize } = this.props;
    selectTransactionToFinalize(txn);
  }

  handleRevokeClick = txn => () => {
    const { selectTransactionToRevoke } = this.props;
    selectTransactionToRevoke(txn);
  }

  handleChangePage = (e, page) => {
    const { setPendingFinalizePage } = this.props;
    setPendingFinalizePage(page);
  };

  handleChangeRowsPerPage = (e) => {
    const { setPendingFinalizeRowsPerPage } = this.props;
    setPendingFinalizeRowsPerPage(e.target.value);
  }

  canProceedNextStep = (currentStep) => {
    const {
      gasLimit,
      gasPrice,
      loadingNextStep,
    } = this.props;

    if (loadingNextStep) return false;

    switch (currentStep) {
      case 1:
        return gasLimit !== '' && !isNaN(gasLimit)
          && gasPrice !== '' && !isNaN(gasPrice);
      default:
        return true;
    }
  }

  redirectToTransactions = () => {
    const { history, isUser } = this.props;
    history.push({
      pathname: transactionsPath,
      state: { isUser },
    });
  }

  showStepper() {
    const { currentStep } = this.props;
    return currentStep > 0 && currentStep < this.getSteps().length + 1;
  }

  renderSteps() {
    const {
      t,
      networkId,
      currentDefaultAddress,
      operationsContractAddress,
      currentStep,
      selectedTransaction,
      gasLimit,
      gasPrice,
      currentTransactionHash,
      toRevoke,
      submissionConfirmed,
      networkConfirmed,
      tokensIssued,
      tokenizationRevoked,
      transactionError,
    } = this.props;

    switch (currentStep) {
      case 1: {
        return (
          <Gas
            isUser={false}
            networkId={networkId}
            fromAddr={currentDefaultAddress}
            toAddr={operationsContractAddress}
            gasLimit={gasLimit}
            gasLimitLabel={t('fields:gasLimitFieldLabel')}
            onGasLimitChange={this.handleFieldChange(finalizeFields.gasLimit)}
            gasPrice={gasPrice}
            gasPriceLabel={t('fields:gasPriceFieldLabel')}
            onGasPriceChange={this.handleFieldChange(finalizeFields.gasPrice)}
            onSubmit={this.handleFormSubmit}
          />
        );
      }
      case 2: {
        const maxFee = (new Decimal(gasLimit))
          .mul(new Decimal(gasPrice))
          .div(new Decimal('1000000000')) // Because price is in GWEI
          .toFixed(ethDecimalPlaces);

        return (
          <Confirmation
            fields={[
              {
                label: t('fields:addressLabel'),
                value: selectedTransaction.from,
              },
              {
                label: t('fields:txHashLabel'),
                value: selectedTransaction.tx_hash,
              },
              {
                label: t('fields:amountToTokenizeLabel'),
                value: selectedTransaction && (
                  <React.Fragment>
                    {selectedTransaction.amount} <SgdPill />
                  </React.Fragment>
                ),
              },
              toRevoke ? null : ({
                label: t('fields:amountToIssueLabel'),
                value: selectedTransaction && (
                  <React.Fragment>
                    {selectedTransaction.amount} <SgdrPill />
                  </React.Fragment>
                ),
              }),
              {
                label: t('fields:gasLimitLabel'),
                value: gasLimit && `${gasLimit} UNITS`,
              },
              {
                label: t('fields:gasPriceLabel'),
                value: gasPrice && `${gasPrice} GWEI`,
              },
              {
                label: t('fields:maxFeeLabel'),
                value: (
                  <React.Fragment>
                    ♦&nbsp;{maxFee}
                  </React.Fragment>
                ),
              },
            ].filter(Boolean)}
            onSubmit={this.handleFormSubmit}
          />
        );
      }
      case 3: {
        const headerSuccess = toRevoke
          ? t('completion:revokeSubmittedHeader')
          : t('completion:finalizeSubmittedHeader');
        const headerError = toRevoke
          ? t('completion:revokeFailedHeader')
          : t('completion:finalizeFailedHeader');
        return (
          <Completion
            header={transactionError ? headerError : headerSuccess}
            subheader={transactionError
              ? t('completion:pleaseTryAgainLater')
              : (
                <React.Fragment>
                  {t('completion:txHashLabel')}
                  &nbsp;
                  <EtherscanTxnLink
                    networkId={networkId}
                    hash={currentTransactionHash}
                  />
                </React.Fragment>
              )
            }
            progressSteps={[
              {
                text: t('completion:approvalSubmission'),
                completed: submissionConfirmed,
                error: transactionError,
              },
              {
                text: t('completion:networkConfirmation'),
                completed: networkConfirmed,
                error: transactionError,
              },
              {
                text: toRevoke
                  ? t('completion:tokenizationRevoked')
                  : t('completion:tokensIssued'),
                completed: toRevoke ? tokenizationRevoked : tokensIssued,
                error: transactionError,
              },
            ]}
          />
        );
      }
      default: {
        return null;
      }
    }
  }

  renderButtons() {
    const {
      classes,
      t,
      currentStep,
      loadingNextStep,
    } = this.props;

    switch (currentStep) {
      case 0: {
        return null;
      }
      case 1:
      case 2: {
        return (
          <React.Fragment>
            <div className={classes.backButton}>
              {
                currentStep > 0 && (
                  <Button
                    key={`back-${currentStep}`}
                    isUser={false}
                    onClick={this.handlePrevStep}
                  >
                    {t('back')}
                  </Button>
                )
              }
            </div>
            <div className={classes.nextButton}>
              <Button
                key={`next-${currentStep}`}
                isUser={false}
                color="primary"
                onClick={this.handleNextStep}
                disabled={!this.canProceedNextStep(currentStep)}
              >
                {loadingNextStep && (
                  <MaterialDesignSpinner
                    sizeUnit="em"
                    size={1}
                    margin={0}
                    border={2}
                    color={buttonTextPrimary}
                  />
                )}
                {!loadingNextStep && (currentStep === 2 ? t('submit') : t('next'))}
              </Button>
            </div>
          </React.Fragment>
        );
      }
      case 3: {
        return (
          <React.Fragment>
            <div>
              <Button
                key="transactions"
                isUser={false}
                color="primary"
                onClick={this.redirectToTransactions}
              >
                {t('completion:seeTransactions')}
              </Button>
            </div>
            <div>
              <Button
                key="reset"
                isUser={false}
                onClick={this.handleReset}
              >
                {t('completion:backToMainPage')}
              </Button>
            </div>
          </React.Fragment>
        );
      }
      default:
        return null;
    }
  }

  renderTableRowButtons = (finalizeButtonText, revokeButtonText) => (txn) => {
    const renderer = ({
      hours,
      minutes,
      seconds,
      completed,
    }) => {
      if (completed) {
        return (
          <Button
            key="finalize"
            isUser={false}
            color="primary"
            onClick={this.handleFinalizeClick(txn)}
          >
            {finalizeButtonText}
          </Button>
        );
      }
      return (
        <Button
          key="finalize"
          isUser={false}
          color="primary"
          disabled
        >
          {hours}:{minutes}:{seconds}
        </Button>
      );
    };

    return (
      <div style={{ zoom: 0.75, whiteSpace: 'nowrap' }}>
        <Countdown
          date={new Date(txn.finalizeDate)}
          renderer={renderer}
        />
        <Button
          key="revoke"
          isUser={false}
          onClick={this.handleRevokeClick(txn)}
        >
          {revokeButtonText}
        </Button>
      </div>
    );
  }

  render() {
    const {
      classes,
      t,
      isUser,
      networkId,
      currentStep,
      transactions,
      currentPage,
      rowsPerPage,
    } = this.props;

    if (currentStep === 0) {
      const columns = [
        {
          head: t('transactions:txHash'),
          renderCell: renderTxHash(networkId),
        },
        {
          head: t('transactions:from'),
          renderCell: renderFromAddr(networkId),
        },
        {
          head: t('transactions:date/time'),
          renderCell: renderDate,
        },
        {
          head: t('transactions:amount'),
          renderCell: renderAmount,
        },
        {
          head: '',
          renderCell: this.renderTableRowButtons(t('finalize'), t('revoke')),
        },
      ];
      return (
        <div className={classes.selectTableRoot}>
          <p className={classes.description}>
            {t('transactions:finalizeOrRevokeDesc')}
          </p>
          <p className={classes.descriptionNote}>
            {t('transactions:finalizeOrRevokeDescNote')}
          </p>
          <Table
            columns={columns}
            rows={transactions.slice().reverse()}
            currentPage={currentPage}
            labelDisplayedRows={({ from, to, count }) => (
              <Trans i18nKey="transactions:tableDisplayedRows">
                {{ from }}
                -
                {{ to }}
                &nbsp;of&nbsp;
                {{ count }}
              </Trans>
            )}
            rowsPerPage={rowsPerPage}
            labelRowsPerPage={t('transactions:rowsPerPage')}
            onChangePage={this.handleChangePage}
            onChangeRowsPerPage={this.handleChangeRowsPerPage}
          />
        </div>
      );
    }

    return (
      <div className={classes.root}>
        {this.showStepper() && (
          <Stepper
            isUser={isUser}
            currentStep={currentStep - 1} // -1 because step 0 is the table
            steps={this.getSteps()}
          />
        )}
        <div className={classes.forms}>
          {this.renderSteps()}
        </div>
        <div
          className={classes.buttons}
          style={{
            textAlign: currentStep === 3 ? 'center' : 'right',
          }}
        >
          {this.renderButtons()}
        </div>
      </div>
    );
  }
}

Finalize.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,

  // State
  isUser: PropTypes.bool.isRequired,
  networkId: PropTypes.number.isRequired,
  currentDefaultAddress: PropTypes.string,
  operationsContractAddress: PropTypes.string,
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentPage: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  currentStep: PropTypes.number.isRequired,
  loadingNextStep: PropTypes.bool.isRequired,
  selectedTransaction: PropTypes.object,
  gasLimit: PropTypes.string.isRequired,
  gasPrice: PropTypes.string.isRequired,
  currentTransactionHash: PropTypes.string.isRequired,
  toRevoke: PropTypes.bool.isRequired,
  submissionConfirmed: PropTypes.bool.isRequired,
  networkConfirmed: PropTypes.bool.isRequired,
  tokensIssued: PropTypes.bool.isRequired,
  tokenizationRevoked: PropTypes.bool.isRequired,
  transactionError: PropTypes.bool.isRequired,

  // Actions
  nextStep: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  setField: PropTypes.func.isRequired,
  selectTransactionToFinalize: PropTypes.func.isRequired,
  selectTransactionToRevoke: PropTypes.func.isRequired,
  submitRequest: PropTypes.func.isRequired,
  setPendingFinalizePage: PropTypes.func.isRequired,
  setPendingFinalizeRowsPerPage: PropTypes.func.isRequired,
};

Finalize.defaultProps = {
  selectedTransaction: null,
  currentDefaultAddress: '',
  operationsContractAddress: '',
};

const mapStateToProps = state => ({
  isUser: state.wallet.isUser,
  networkId: state.network.id,
  currentDefaultAddress: state.wallet.currentDefaultAccount,
  operationsContractAddress: (contract => (
    contract ? contract.options.address : ''
  ))(state.network.operationsContract),

  transactions: state.transactions.pendingFinalize,
  currentPage: state.transactions.pendingFinalizePage,
  rowsPerPage: state.transactions.pendingFinalizeRowsPerPage,

  currentStep: state.finalize.step,
  loadingNextStep: state.finalize.loadingNextStep,
  selectedTransaction: state.finalize.selectedTransaction,
  gasLimit: state.finalize[finalizeFields.gasLimit],
  gasPrice: state.finalize[finalizeFields.gasPrice],
  currentTransactionHash: state.finalize.currentTransactionHash,
  toRevoke: state.finalize.toRevoke,
  submissionConfirmed: state.finalize.submissionConfirmed,
  networkConfirmed: state.finalize.networkConfirmed,
  tokensIssued: state.finalize.tokensIssued,
  tokenizationRevoked: state.finalize.tokenizationRevoked,
  transactionError: state.finalize.transactionError,
});

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  translate(['navigator', 'transactions', 'fields', 'completion']),
  withRouter,
  connect(
    mapStateToProps,
    {
      nextStep: nextStepAction,
      prevStep: prevStepAction,
      reset: resetAction,
      setField: setFieldAction,
      selectTransactionToFinalize: selectTransactionToFinalizeAction,
      selectTransactionToRevoke: selectTransactionToRevokeAction,
      submitRequest: submitRequestAction,
      setPendingFinalizePage: setPendingFinalizePageAction,
      setPendingFinalizeRowsPerPage: setPendingFinalizeRowsPerPageAction,
    },
  ),
);

export default enhance(Finalize);
