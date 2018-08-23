import React from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';

import { withStyles } from '@material-ui/core/styles';

import List from '../../components/onboarding/List';
import RadioGroup from '../../components/onboarding/RadioGroup';
import Button from '../../components/Button';
import { verifyStepStyles } from './_styles';
import { compose } from '../../utils';


class VerifyUserBankAccount extends React.Component {
  state = {
    bankAccount: null,
  }

  handleBankAccountChange = (e) => {
    const newValue = e.target.value;
    const { setContext } = this.props;

    this.setState({ bankAccount: newValue }, () => {
      setContext(ctx => ({ ...ctx, bankAccount: newValue }));
    });
  }

  renderHeader() {
    const { classes, t, isModal } = this.props;

    if (isModal) {
      return (
        <h1 className={classes.modalHeader}>
          {t('onboarding:verifyBankAccount')}
        </h1>
      );
    }

    return (
      <h1 className={classes.header}>
        <Trans i18nKey="onboarding:stepNumber">
          Step
          {{ stepNumber: 2 }}
          :
        </Trans>
        &nbsp;
        {t('onboarding:verifyBankAccount')}
      </h1>
    );
  }

  renderDescription() {
    const { isModal } = this.props;

    if (isModal) {
      return (
        <List>
          <Trans
            key="verifyBankAccountDesc1"
            i18nKey="onboarding:verifyBankAccountDesc1Short"
          >
            {''}<strong>Wire SGD</strong> to the Trust
            during <strong>tokenization</strong>.
          </Trans>
          <Trans
            key="verifyBankAccountDesc2"
            i18nKey="onboarding:verifyBankAccountDesc2Short"
          >
            {''}<strong>Receive SGD</strong> from the Trust
            during <strong>withdrawal</strong>.
          </Trans>
        </List>
      );
    }

    return (
      <List>
        <Trans
          key="verifyBankAccountDesc1"
          i18nKey="onboarding:verifyBankAccountDesc1"
        >
          Your bank account is used to <strong>wire SGD</strong> to the Trust
          during <strong>tokenization</strong>.
        </Trans>
        <Trans
          key="verifyBankAccountDesc2"
          i18nKey="onboarding:verifyBankAccountDesc2"
        >
          Your bank account is used to <strong>receive SGD</strong> from the Trust
          during <strong>withdrawal</strong>.
        </Trans>
      </List>
    );
  }

  render() {
    const {
      classes,
      t,
      isModal,
      handlePrevStep,
      handleNextStep,
    } = this.props;
    const { bankAccount } = this.state;

    return (
      <div className={classes.root}>
        {this.renderHeader()}
        <div className={isModal ? classes.modalContent : classes.content}>
          {this.renderDescription()}
          <h2 className={classes.subheader}>{t('onboarding:selectBankAccount')}</h2>

          <RadioGroup
            aria-label="Bank Account"
            name="bankAccount"
            className={classes.radioGroup}
            value={bankAccount}
            onChange={this.handleBankAccountChange}
            classes={{
              radio: classes.radioRoot,
              label: classes.labelRoot,
            }}
            items={[
              {
                key: 'DEUTSGSG',
                value: '0',
                label: (
                  <div>
                    <div>DEUTSCHE BANK</div>
                    <div>123-123456-1</div>
                  </div>
                ),
              },
            ]}
          />
          <div className={classes.buttonsGroup}>
            <div className={classes.flexGrow} />
            <Button
              onClick={handlePrevStep}
              isUser
            >
              {t('back')}
            </Button>
            <Button
              onClick={handleNextStep}
              color="primary"
              isUser
              disabled={!bankAccount}
            >
              {t('verify')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

VerifyUserBankAccount.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  isModal: PropTypes.bool,
  handlePrevStep: PropTypes.func.isRequired,
  handleNextStep: PropTypes.func.isRequired,
  setContext: PropTypes.func.isRequired,
};

VerifyUserBankAccount.defaultProps = {
  isModal: false,
};

const enhance = compose(
  withStyles(verifyStepStyles, { withTheme: true }),
  translate(['navigator', 'onboarding']),
);

export default enhance(VerifyUserBankAccount);
