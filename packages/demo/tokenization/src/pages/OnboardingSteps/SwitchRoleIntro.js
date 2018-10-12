import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import { withStyles } from '@material-ui/core/styles';

import Button from '../../components/Button';

import {
  onboardText,
  onboardingModalHeaderBg,
  onboardingModalBg,
  onboardingModalTextSecondary,
  onboardingModalBackToPrevText,
} from '../../constants/colors';
import { compose } from '../../utils';

const styles = theme => ({
  root: {
    flexGrow: 1,
    color: onboardText,
  },
  pseudoModalHeader: {
    backgroundColor: onboardingModalHeaderBg,
    height: '10px',
  },
  modalContent: {
    backgroundColor: onboardingModalBg,
    padding: '2em',
    textAlign: 'center',
  },
  switchRoleHeader: {
    fontSize: '2em',
    marginBottom: '3rem',
  },
  switchMessage: {
    width: '90%',
    margin: 'auto',
    fontSize: '1.1em',
    marginBottom: '0.5rem',
    whiteSpace: 'pre-line',
  },
  switchSubMissage: {
    color: onboardingModalTextSecondary,
    width: '90%',
    margin: 'auto',
    marginBottom: '3rem',
  },
  buttonsGroup: {
    display: 'flex',
  },
  flexGrow: {
    flexGrow: 1,
  },
  backToPrevRoleText: {
    textDecoration: 'underline',
    color: onboardingModalBackToPrevText,
  },
});

class SwitchRole extends React.Component {
  renderHeader() {
    const { classes } = this.props;
    return (
      <div className={classes.pseudoModalHeader} />
    );
  }

  renderDescription() {
    const { classes, t, isUser } = this.props;

    return (
      <React.Fragment>
        <h1 className={classes.switchRoleHeader}>
          {isUser
            ? t('onboarding:switchingToUser')
            : t('onboarding:switchingToTrustee')
          }
        </h1>
        <p className={classes.switchMessage}>
          {isUser
            ? t('onboarding:switchToUserMessage')
            : t('onboarding:switchToTrusteeMessage')
          }
        </p>
        <p className={classes.switchSubMissage}>
          {t('onboarding:switchSubMessage')}
        </p>
      </React.Fragment>
    );
  }

  render() {
    const {
      classes,
      t,
      isUser,
      handleNextStep,
      handleBackToPrevRole,
    } = this.props;

    return (
      <div className={classes.root}>
        {this.renderHeader()}
        <div className={classes.modalContent}>
          {this.renderDescription()}

          <div className={classes.buttonsGroup}>
            <Button
              onClick={handleBackToPrevRole}
              isUser
            >
              <span className={classes.backToPrevRoleText}>
                {isUser
                  ? t('backToTrustee')
                  : t('backToUser')
                }
              </span>
            </Button>
            <div className={classes.flexGrow} />
            <Button
              onClick={handleNextStep}
              color="primary"
              isUser
            >
              {t('setUp')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

SwitchRole.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  isUser: PropTypes.bool.isRequired,
  handleBackToPrevRole: PropTypes.func.isRequired,
  handleNextStep: PropTypes.func.isRequired,
};

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  translate(['navigator', 'onboarding']),
);

export default enhance(SwitchRole);
