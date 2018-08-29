import React from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import { ClipLoader } from 'react-spinners';
import Decimal from 'decimal.js-light';

import Amount from '../_common/Amount';
import Gas from '../_common/Gas';
import Confirmation from '../_common/Confirmation';
import Completion from '../_common/Completion';

import Stepper from '../../components/Stepper';
import Button from '../../components/Button';
import { SgdPill, SgdrPill } from '../../components/CurrencyPill';

import {
  buttonTextPrimary,
  sgdrColor,
  withdrawalInfoText,
} from '../../constants/colors';
import { ethDecimalPlaces, sgdDecimalPlaces } from '../../constants/defaults';

import {
  nextStep as nextStepAction,
  prevStep as prevStepAction,
  reset as resetAction,
  setField as setFieldAction,
  submitWithdrawRequest as submitWithdrawRequestAction,
  withdrawFields,
} from '../../actions/Withdraw';
import { compose, genStyle, getClass } from '../../utils';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 3,
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
  willReceiveAmount: {
    marginTop: '0.5em',
    color: withdrawalInfoText,
    letterSpacing: 0,
    wordBreak: 'break-word',
  },
});

class Withdrawal extends React.Component {
  state = {
    errors: {},
  }

  componentWillReceiveProps(nextProps) {
    const errors = this.validateFields(nextProps);
    this.setState({ errors });
  }

  getSteps() {
    const { t } = this.props;

    return [
      t('stepper:amountToWithdraw'),
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
      amount,
      gasLimit,
      gasPrice,
      currentStep,
      nextStep,
      submitWithdrawRequest,
    } = this.props;
    if (!this.canProceedNextStep(currentStep)) {
      return;
    }
    if (currentStep >= this.getSteps().length) {
      return;
    }
    if (currentStep === 2) {
      submitWithdrawRequest(amount, gasLimit, gasPrice);
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

  canProceedNextStep = (currentStep) => {
    const {
      amount,
      gasLimit,
      gasPrice,
      loadingNextStep,
    } = this.props;
    const { errors } = this.state;

    if (loadingNextStep) return false;
    if (Object.keys(errors).length > 0) return false;

    switch (currentStep) {
      case 0:
        return amount !== '' && !isNaN(amount);
      case 1:
        return gasLimit !== '' && !isNaN(gasLimit)
          && gasPrice !== '' && !isNaN(gasPrice);
      default:
        return true;
    }
  }

  showStepper() {
    const { currentStep } = this.props;
    return currentStep < this.getSteps().length;
  }

  validateFields(props) {
    const {
      t,
      currentStep,
    } = props;

    const error = {};

    switch (currentStep) {
      case 0: {
        const {
          currentTokenBalance,
          amount,
        } = props;

        if (!amount) {
          return error;
        }

        if ((new Decimal(amount)).gt(new Decimal(currentTokenBalance))) {
          error[withdrawFields.amount] = t('fields:withdrawAmountOverLimitError');
        }

        return error;
      }
      default: {
        return error;
      }
    }
  }

  renderSteps() {
    const {
      classes,
      t,
      currentStep,
      amount,
      gasLimit,
      gasPrice,
      currentTransactionHash,
      submissionConfirmed,
      networkConfirmed,
      wireTransferred,
      transactionError,
    } = this.props;
    const { errors } = this.state;

    switch (currentStep) {
      case 0: {
        return (
          <Amount
            amount={amount}
            amountLabel={t('fields:amountToWithdrawFieldLabel')}
            amountAdornment={
              <span style={{ color: sgdrColor }}>SGDR</span>
            }
            message={(
              <div className={classes.willReceiveAmount}>
                <Trans i18nKey="fields:receiveInReturn">
                  You will receive
                  {{
                    amount: (new Decimal(amount || '0'))
                      .todp(sgdDecimalPlaces)
                      .toString(),
                  }}
                  <SgdPill />
                  in return.
                </Trans>
              </div>
            )}
            onAmountChange={this.handleFieldChange(withdrawFields.amount)}
            amountError={errors[withdrawFields.amount] || null}
            onSubmit={this.handleFormSubmit}
          />
        );
      }
      case 1: {
        return (
          <Gas
            isUser
            gasLimit={gasLimit}
            gasLimitLabel={t('fields:gasLimitFieldLabel')}
            onGasLimitChange={this.handleFieldChange(withdrawFields.gasLimit)}
            gasPrice={gasPrice}
            gasPriceLabel={t('fields:gasPriceFieldLabel')}
            onGasPriceChange={this.handleFieldChange(withdrawFields.gasPrice)}
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
                label: t('fields:amountToWithdrawLabel'),
                value: amount && (
                  <React.Fragment>
                    {amount} <SgdrPill />
                  </React.Fragment>
                ),
              },
              {
                label: t('fields:amountToReceiveLabel'),
                value: amount && (
                  <React.Fragment>
                    {amount} <SgdPill />
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
              {
                label: t('fields:maxFeeLabel'),
                value: (
                  <React.Fragment>
                    ♦&nbsp;{maxFee}
                  </React.Fragment>
                ),
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
              ? t('completion:withdrawFailedHeader')
              : t('completion:withdrawSubmittedHeader')
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
                text: t('completion:withdrawSubmission'),
                completed: submissionConfirmed,
                error: transactionError,
              },
              {
                text: t('completion:networkConfirmation'),
                completed: networkConfirmed,
                error: transactionError,
              },
              {
                text: t('completion:wireTransferCompleted'),
                completed: wireTransferred,
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
      case 0:
      case 1:
      case 2: {
        return (
          <React.Fragment>
            <div className={getClass(classes, 'backButton', isUser)}>
              {
                currentStep > 0 && (
                  <Button
                    key={`back-${currentStep}`}
                    isUser={isUser}
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
                isUser={isUser}
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
                isUser={isUser}
                color="primary"
              >
                {t('completion:seeTransactions')}
              </Button>
            </div>
            <div className={getClass(classes, 'resetButton', isUser)}>
              <Button
                key="reset"
                isUser={isUser}
                onClick={this.handleReset}
              >
                {t('completion:backToWithdraw')}
              </Button>
            </div>
          </React.Fragment>
        );
      }
      default:
        return null;
    }
  }

  render() {
    const { classes, isUser, currentStep } = this.props;

    return (
      <div className={classes.root}>
        {this.showStepper() && (
          <Stepper
            isUser={isUser}
            currentStep={currentStep}
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

Withdrawal.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC

  // State
  isUser: PropTypes.bool.isRequired,
  currentStep: PropTypes.number.isRequired,
  loadingNextStep: PropTypes.bool.isRequired,
  amount: PropTypes.string.isRequired,
  gasLimit: PropTypes.string.isRequired,
  gasPrice: PropTypes.string.isRequired,
  currentTransactionHash: PropTypes.string.isRequired,
  submissionConfirmed: PropTypes.bool.isRequired,
  networkConfirmed: PropTypes.bool.isRequired,
  wireTransferred: PropTypes.bool.isRequired,
  transactionError: PropTypes.bool.isRequired,

  // Actions
  nextStep: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  setField: PropTypes.func.isRequired,
  submitWithdrawRequest: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isUser: state.wallet.isUser,
  currentTokenBalance: state.wallet.currentTokenBalance,
  currentStep: state.withdraw.step,
  loadingNextStep: state.withdraw.loadingNextStep,
  amount: state.withdraw[withdrawFields.amount],
  gasLimit: state.withdraw[withdrawFields.gasLimit],
  gasPrice: state.withdraw[withdrawFields.gasPrice],
  currentTransactionHash: state.withdraw.currentTransactionHash,
  submissionConfirmed: state.withdraw.submissionConfirmed,
  networkConfirmed: state.withdraw.networkConfirmed,
  wireTransferred: state.withdraw.wireTransferred,
  transactionError: state.withdraw.transactionError,
});

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  translate(['navigator', 'fields', 'completion']),
  connect(
    mapStateToProps,
    {
      nextStep: nextStepAction,
      prevStep: prevStepAction,
      reset: resetAction,
      setField: setFieldAction,
      submitWithdrawRequest: submitWithdrawRequestAction,
    },
  ),
);

export default enhance(Withdrawal);
