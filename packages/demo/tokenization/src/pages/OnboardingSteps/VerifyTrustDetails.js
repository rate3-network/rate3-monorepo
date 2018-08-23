import React from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';

import { withStyles } from '@material-ui/core/styles';

import List from '../../components/onboarding/List';
import Button from '../../components/Button';
import { verifyStepStyles } from './_styles';
import { compose } from '../../utils';

class VerifyTrustDetails extends React.Component {
  renderHeader() {
    const { classes, t, isModal } = this.props;

    if (isModal) {
      return (
        <h1 className={classes.modalHeader}>
          {t('onboarding:verifyTrustDetails')}
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
        {t('onboarding:verifyTrustDetails')}
      </h1>
    );
  }

  renderDescription() {
    const { isModal } = this.props;

    if (isModal) {
      return (
        <List>
          <Trans
            key="verifyTrustDetailsDesc1"
            i18nKey="onboarding:verifyTrustDetailsDesc1Short"
          >
            {''}<strong>Receives SGD</strong> from users
            during <strong>tokenization</strong>.
          </Trans>
          <Trans
            key="verifyTrustDetailsDesc2"
            i18nKey="onboarding:verifyTrustDetailsDesc2Short"
          >
            {''}<strong>Transfers SGD</strong> to users
            during <strong>withdrawal</strong>.
          </Trans>
        </List>
      );
    }

    return (
      <List>
        <Trans
          key="verifyTrustDetailsDesc1"
          i18nKey="onboarding:verifyTrustDetailsDesc1"
        >
          The Trust <strong>receives SGD</strong> from users
          during <strong>tokenization</strong> requests.
        </Trans>
        <Trans
          key="verifyTrustDetailsDesc2"
          i18nKey="onboarding:verifyTrustDetailsDesc2"
        >
          The Trust <strong>transfers SGD</strong> to users
          during <strong>withdrawal</strong> requests.
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

    return (
      <div className={classes.root}>
        {this.renderHeader()}
        <div className={isModal ? classes.modalContent : classes.content}>
          {this.renderDescription()}
          <h2 className={classes.subheader}>{t('onboarding:trustAccount')}</h2>

          <div className={classes.radioGroup}>
            <div className={classes.labelRoot}>
              <div>Trusted Bank Acc</div>
              <div>123-45678-0</div>
            </div>
          </div>
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
            >
              {t('verify')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

VerifyTrustDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  isModal: PropTypes.bool,
  handlePrevStep: PropTypes.func.isRequired,
  handleNextStep: PropTypes.func.isRequired,
};

VerifyTrustDetails.defaultProps = {
  isModal: false,
};

const enhance = compose(
  withStyles(verifyStepStyles, { withTheme: true }),
  translate(['navigator', 'onboarding']),
);

export default enhance(VerifyTrustDetails);
