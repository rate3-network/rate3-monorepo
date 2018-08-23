import React from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';

import { withStyles } from '@material-ui/core/styles';

import List from '../../components/onboarding/List';
import RadioGroup from '../../components/onboarding/RadioGroup';
import Button from '../../components/Button';
import { setUpStepStyles } from './_styles';
import { compose } from '../../utils';


class SetUpTrusteeWallet extends React.Component {
  state = {
    trusteeEthWallet: null,
  }

  handleWalletChange = (e) => {
    const newValue = e.target.value;
    const { setContext } = this.props;

    this.setState({ trusteeEthWallet: newValue }, () => {
      setContext(ctx => ({ ...ctx, trusteeEthWallet: newValue }));
    });
  }

  render() {
    const {
      classes,
      t,
      handlePrevStep,
      handleNextStep,
    } = this.props;
    const { trusteeEthWallet } = this.state;

    return (
      <div className={classes.root}>
        <h1>
          <Trans i18nKey="onboarding:stepNumber">
            Step
            {{ stepNumber: 3 }}
            :
          </Trans>
          &nbsp;
          {t('onboarding:setUpTrusteeWallet')}
        </h1>
        <List>
          <Trans key="trusteeSetUpWalletDesc1" i18nKey="onboarding:trusteeSetUpWalletDesc1">
            ETH wallet address is the trustee&apos;s <strong>unique identifier</strong>.
          </Trans>
          <Trans key="trusteeSetUpWalletDesc2" i18nKey="onboarding:trusteeSetUpWalletDesc2">
            ETH wallet is used to approve tokenization and withdrawal requests.
          </Trans>
        </List>
        <h2 className={classes.subheader}>{t('onboarding:selectETHWallet')}</h2>

        <RadioGroup
          aria-label="Ethereum Wallet"
          name="trusteeEthWallet"
          className={classes.radioGroup}
          value={trusteeEthWallet}
          onChange={this.handleWalletChange}
          classes={{
            radio: classes.radioRoot,
            label: classes.labelRoot,
          }}
          items={[
            {
              key: '0x590F39c5dadD62a3e4Ad6E323632cA2B3Ed371ab',
              value: '0x590F39c5dadD62a3e4Ad6E323632cA2B3Ed371ab',
              label: (
                <div>
                  <div><strong>Trust X</strong></div>
                  <div>0x590F39c5dadD62a3e4Ad6E323632cA2B3Ed371ab</div>
                </div>
              ),
            },
          ]}
        />
        <div className={classes.buttonsGroup}>
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
            disabled={!trusteeEthWallet}
          >
            {t('finish')}
          </Button>
        </div>
      </div>
    );
  }
}

SetUpTrusteeWallet.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  handlePrevStep: PropTypes.func.isRequired,
  handleNextStep: PropTypes.func.isRequired,
  setContext: PropTypes.func.isRequired,
};

const enhance = compose(
  withStyles(setUpStepStyles, { withTheme: true }),
  translate(['navigator', 'onboarding']),
);

export default enhance(SetUpTrusteeWallet);
