import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import { ClipLoader } from 'react-spinners';

import Amount from './Amount';
import Trust from './Trust';
import Gas from './Gas';
import Confirmation from './Confirmation';
import Completion from './Completion';

import Stepper from '../../components/Stepper';
import Button from '../../components/Button';

import { buttonTextPrimary } from '../../constants/colors';

import {
  nextStep as nextStepAction,
  prevStep as prevStepAction,
  reset as resetAction,
  setField as setFieldAction,
  submitTokenizeRequest as submitTokenizeRequestAction,
  tokenizeFields,
} from '../../actions/Tokenize';
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
});

class Tokenization extends React.Component {
  getSteps() {
    const { t } = this.props;

    return [
      t('amountToTokenize'),
      t('wireTransferDetails'),
      t('gasLimitAndPrice'),
      t('confirmation'),
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
      submitTokenizeRequest,
    } = this.props;
    if (!this.canProceedNextStep(currentStep)) {
      return;
    }
    if (currentStep >= this.getSteps().length) {
      return;
    }
    if (currentStep === 3) {
      submitTokenizeRequest(amount, gasLimit, gasPrice);
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

  canProceedNextStep = (currentStep) => {
    const {
      amount,
      trustBank,
      trustSwiftCode,
      trustAccount,
      gasLimit,
      gasPrice,
      loadingNextStep,
    } = this.props;

    if (loadingNextStep) return false;

    switch (currentStep) {
      case 0:
        return amount !== '' && !isNaN(amount);
      case 1:
        return trustBank !== '' && trustSwiftCode !== '' && trustAccount !== '';
      case 2:
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

  renderSteps() {
    const {
      currentStep,
      amount,
      trustBank,
      trustSwiftCode,
      trustAccount,
      gasLimit,
      gasPrice,
      setField,
      currentTransactionHash,
      submissionConfirmed,
      networkConfirmed,
      trusteeApproved,
      transactionError,
    } = this.props;

    switch (currentStep) {
      case 0: {
        return (
          <Amount
            amount={amount}
            setField={setField}
            onSubmit={this.handleFormSubmit}
          />
        );
      }
      case 1: {
        return (
          <Trust
            amount={amount}
            trustBank={trustBank}
            trustSwiftCode={trustSwiftCode}
            trustAccount={trustAccount}
            setField={setField}
            onSubmit={this.handleFormSubmit}
          />
        );
      }
      case 2: {
        return (
          <Gas
            gasLimit={gasLimit}
            gasPrice={gasPrice}
            setField={setField}
            onSubmit={this.handleFormSubmit}
          />
        );
      }
      case 3: {
        return (
          <Confirmation
            amount={amount}
            trustBank={trustBank}
            trustSwiftCode={trustSwiftCode}
            trustAccount={trustSwiftCode}
            gasLimit={gasLimit}
            gasPrice={gasPrice}
            onSubmit={this.handleFormSubmit}
          />
        );
      }
      case 4: {
        return (
          <Completion
            txHash={currentTransactionHash}
            submissionConfirmed={submissionConfirmed}
            networkConfirmed={networkConfirmed}
            trusteeApproved={trusteeApproved}
            transactionError={transactionError}
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
      case 2:
      case 3: {
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
                {!loadingNextStep && (currentStep === 3 ? t('submit') : t('next'))}
              </Button>
            </div>
          </React.Fragment>
        );
      }
      case 4: {
        return (
          <React.Fragment>
            <div className={getClass(classes, 'transactionsButton', isUser)}>
              <Button
                key="transactions"
                isUser={isUser}
                color="primary"
              >
                {t('seeTransactions')}
              </Button>
            </div>
            <div className={getClass(classes, 'resetButton', isUser)}>
              <Button
                key="reset"
                isUser={isUser}
                onClick={this.handleReset}
              >
                {t('backToTokenize')}
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
            textAlign: currentStep === 4 ? 'center' : 'right',
          }}
        >
          {this.renderButtons()}
        </div>
      </div>
    );
  }
}

Tokenization.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC

  // State
  isUser: PropTypes.bool.isRequired,
  currentStep: PropTypes.number.isRequired,
  loadingNextStep: PropTypes.bool.isRequired,
  amount: PropTypes.string.isRequired,
  trustBank: PropTypes.string.isRequired,
  trustSwiftCode: PropTypes.string.isRequired,
  trustAccount: PropTypes.string.isRequired,
  gasLimit: PropTypes.string.isRequired,
  gasPrice: PropTypes.string.isRequired,
  currentTransactionHash: PropTypes.string.isRequired,
  submissionConfirmed: PropTypes.bool.isRequired,
  networkConfirmed: PropTypes.bool.isRequired,
  trusteeApproved: PropTypes.bool.isRequired,
  transactionError: PropTypes.bool.isRequired,

  // Actions
  nextStep: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  setField: PropTypes.func.isRequired,
  submitTokenizeRequest: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isUser: state.wallet.isUser,
  currentStep: state.tokenize.step,
  loadingNextStep: state.tokenize.loadingNextStep,
  amount: state.tokenize[tokenizeFields.amount],
  trustBank: state.tokenize[tokenizeFields.trustBank],
  trustSwiftCode: state.tokenize[tokenizeFields.trustSwiftCode],
  trustAccount: state.tokenize[tokenizeFields.trustAccount],
  gasLimit: state.tokenize[tokenizeFields.gasLimit],
  gasPrice: state.tokenize[tokenizeFields.gasPrice],
  currentTransactionHash: state.tokenize.currentTransactionHash,
  submissionConfirmed: state.tokenize.submissionConfirmed,
  networkConfirmed: state.tokenize.networkConfirmed,
  trusteeApproved: state.tokenize.trusteeApproved,
  transactionError: state.tokenize.transactionError,
});

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  translate('tokenization'),
  connect(
    mapStateToProps,
    {
      nextStep: nextStepAction,
      prevStep: prevStepAction,
      reset: resetAction,
      setField: setFieldAction,
      submitTokenizeRequest: submitTokenizeRequestAction,
    },
  ),
);

export default enhance(Tokenization);
