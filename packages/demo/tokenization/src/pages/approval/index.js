import React from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import { ClipLoader } from 'react-spinners';

import Gas from '../_common/Gas';
import Confirmation from '../_common/Confirmation';
import Completion from '../_common/Completion';

import Stepper from '../../components/Stepper';
import Button from '../../components/Button';
import Table from '../../components/transactions/Table';
import { SgdPill, SgdrPill } from '../../components/CurrencyPill';

import {
  renderTxHash,
  renderFromAddr,
  renderDate,
  renderAmount,
  renderType,
} from '../transactions';
import { txType } from '../../constants/enums';
import { buttonTextPrimary } from '../../constants/colors';

import {
  nextStep as nextStepAction,
  prevStep as prevStepAction,
  reset as resetAction,
  setField as setFieldAction,
  selectTransactionToApprove as selectTransactionToApproveAction,
  submitApproveRequest as submitApproveRequestAction,
  approveFields,
} from '../../actions/Approve';
import {
  setPendingApprovalPage as setPendingApprovalPageAction,
  setPendingApprovalRowsPerPage as setPendingApprovalRowsPerPageAction,
} from '../../actions/Transactions';
import { compose, genStyle, getClass } from '../../utils';

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
  buttons: {
    maxWidth: '600px',
    margin: 'auto',
  },
  ...genStyle('backButton', isUser => ({
    display: 'inline-block',
  })),
  ...genStyle('nextButton', isUser => ({
    display: 'inline-block',
  })),
  ...genStyle('transactionsButton', isUser => ({
  })),
  ...genStyle('resetButton', isUser => ({
  })),
});

class Approval extends React.Component {
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
      transactionToApprove,
      gasLimit,
      gasPrice,
      currentStep,
      nextStep,
      submitApproveRequest,
    } = this.props;
    if (!this.canProceedNextStep(currentStep)) {
      return;
    }
    if (currentStep >= this.getSteps().length + 1) {
      return;
    }
    if (currentStep === 2) {
      submitApproveRequest(
        '',
        transactionToApprove.tx_hash,
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

  handleApproveClick = txn => () => {
    const { selectTransactionToApprove } = this.props;
    selectTransactionToApprove(txn);
  }

  handleChangePage = (e, page) => {
    const { setPendingApprovalPage } = this.props;
    setPendingApprovalPage(page);
  };

  handleChangeRowsPerPage = (e) => {
    const { setPendingApprovalRowsPerPage } = this.props;
    setPendingApprovalRowsPerPage(e.target.value);
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

  showStepper() {
    const { currentStep } = this.props;
    return currentStep > 0 && currentStep < this.getSteps().length + 1;
  }

  renderSteps() {
    const {
      t,
      currentStep,
      transactionToApprove,
      gasLimit,
      gasPrice,
      currentTransactionHash,
      submissionConfirmed,
      networkConfirmed,
      tokensIssued,
      transactionError,
    } = this.props;

    switch (currentStep) {
      case 1: {
        return (
          <Gas
            isUser={false}
            gasLimit={gasLimit}
            gasLimitLabel={t('fields:gasLimitFieldLabel')}
            onGasLimitChange={this.handleFieldChange(approveFields.gasLimit)}
            gasPrice={gasPrice}
            gasPriceLabel={t('fields:gasPriceFieldLabel')}
            onGasPriceChange={this.handleFieldChange(approveFields.gasPrice)}
            onSubmit={this.handleFormSubmit}
          />
        );
      }
      case 2: {
        return (
          <Confirmation
            fields={[
              {
                label: t('fields:addressLabel'),
                value: transactionToApprove.from,
              },
              {
                label: t('fields:txHashLabel'),
                value: transactionToApprove.tx_hash,
              },
              {
                label: t('fields:amountToTokenizeLabel'),
                value: transactionToApprove && (
                  <React.Fragment>
                    {transactionToApprove.amount} <SgdPill />
                  </React.Fragment>
                ),
              },
              {
                label: t('fields:amountToIssueLabel'),
                value: transactionToApprove && (
                  <React.Fragment>
                    {transactionToApprove.amount} <SgdrPill />
                  </React.Fragment>
                ),
              },
              {
                label: t('fields:gasLimitLabel'),
                value: gasLimit && `${gasLimit} UNITS`,
              },
              {
                label: t('fields:gasPriceLabel'),
                value: gasPrice && `${gasPrice} GWEI`,
              },
            ]}
            onSubmit={this.handleFormSubmit}
          />
        );
      }
      case 3: {
        return (
          <Completion
            header={transactionError
              ? t('completion:approvalSubmittedHeader')
              : t('completion:approvalSubmittedHeader')
            }
            subheader={transactionError
              ? t('completion:pleaseTryAgainLater')
              : (
                <React.Fragment>
                  {t('completion:txHashLabel')} <span className="hash">{currentTransactionHash}</span>
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
                text: t('completion:tokensIssued'),
                completed: tokensIssued,
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
      isUser,
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
            <div className={getClass(classes, 'backButton', isUser)}>
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
            <div className={getClass(classes, 'nextButton', isUser)}>
              <Button
                key={`next-${currentStep}`}
                isUser={false}
                color="primary"
                onClick={this.handleNextStep}
                disabled={!this.canProceedNextStep(currentStep)}
              >
                {loadingNextStep && (
                  <ClipLoader
                    sizeUnit="em"
                    size={1}
                    color={buttonTextPrimary}
                    loading
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
            <div className={getClass(classes, 'transactionsButton', isUser)}>
              <Button
                key="transactions"
                isUser={false}
                color="primary"
              >
                {t('completion:seeTransactions')}
              </Button>
            </div>
            <div className={getClass(classes, 'resetButton', isUser)}>
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

  renderSelectButton = buttonText => txn => (
    <div style={{ zoom: 0.75 }}>
      <Button
        key="approve"
        isUser={false}
        color="primary"
        onClick={this.handleApproveClick(txn)}
      >
        {buttonText}
      </Button>
    </div>
  )

  render() {
    const {
      classes,
      t,
      isUser,
      currentStep,
      transactions,
      currentPage,
      rowsPerPage,
    } = this.props;

    if (currentStep === 0) {
      const columns = [
        {
          head: t('transactions:txHash'),
          renderCell: renderTxHash,
        },
        {
          head: t('transactions:from'),
          renderCell: renderFromAddr,
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
          head: t('transactions:type'),
          renderCell: renderType({
            [txType.TOKENIZE]: t('transactions:typeTokenize'),
            [txType.WITHDRAWAL]: t('transactions:typeWithdraw'),
          }),
        },
        {
          head: '',
          renderCell: this.renderSelectButton(t('approve')),
        },
      ];
      return (
        <div className={classes.selectTableRoot}>
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

Approval.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC

  // State
  isUser: PropTypes.bool.isRequired,
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentPage: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  currentStep: PropTypes.number.isRequired,
  loadingNextStep: PropTypes.bool.isRequired,
  transactionToApprove: PropTypes.object,
  gasLimit: PropTypes.string.isRequired,
  gasPrice: PropTypes.string.isRequired,
  currentTransactionHash: PropTypes.string.isRequired,
  submissionConfirmed: PropTypes.bool.isRequired,
  networkConfirmed: PropTypes.bool.isRequired,
  tokensIssued: PropTypes.bool.isRequired,
  transactionError: PropTypes.bool.isRequired,

  // Actions
  nextStep: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  setField: PropTypes.func.isRequired,
  selectTransactionToApprove: PropTypes.func.isRequired,
  submitApproveRequest: PropTypes.func.isRequired,
  setPendingApprovalPage: PropTypes.func.isRequired,
  setPendingApprovalRowsPerPage: PropTypes.func.isRequired,
};

Approval.defaultProps = {
  transactionToApprove: null,
};

const mapStateToProps = state => ({
  isUser: state.wallet.isUser,

  transactions: state.transactions.pendingApproval,
  currentPage: state.transactions.pendingApprovalPage,
  rowsPerPage: state.transactions.pendingApprovalRowsPerPage,

  currentStep: state.approve.step,
  loadingNextStep: state.approve.loadingNextStep,
  transactionToApprove: state.approve.transactionToApprove,
  gasLimit: state.approve[approveFields.gasLimit],
  gasPrice: state.approve[approveFields.gasPrice],
  currentTransactionHash: state.approve.currentTransactionHash,
  submissionConfirmed: state.approve.submissionConfirmed,
  networkConfirmed: state.approve.networkConfirmed,
  tokensIssued: state.approve.tokensIssued,
  transactionError: state.approve.transactionError,
});

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  translate(['navigator', 'transactions', 'fields', 'completion']),
  connect(
    mapStateToProps,
    {
      nextStep: nextStepAction,
      prevStep: prevStepAction,
      reset: resetAction,
      setField: setFieldAction,
      selectTransactionToApprove: selectTransactionToApproveAction,
      submitApproveRequest: submitApproveRequestAction,
      setPendingApprovalPage: setPendingApprovalPageAction,
      setPendingApprovalRowsPerPage: setPendingApprovalRowsPerPageAction,
    },
  ),
);

export default enhance(Approval);
