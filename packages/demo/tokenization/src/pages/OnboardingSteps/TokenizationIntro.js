import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import { withStyles } from '@material-ui/core/styles';

import rate3layers from '../../assets/rate3-layers.png';
import Button from '../../components/Button';
import {
  onboardIntroHeaderText,
  onboardIntroDescriptionText,
} from '../../constants/colors';
import { compose } from '../../utils';

const styles = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  contentContainer: {
    flex: '1 0 calc(50% - 20px)',
    boxSizing: 'border-box',
    minWidth: '280px',
  },
  image: {
    width: '100%',
  },
  header: {
    fontWeight: 900,
    fontSize: '3em',
    color: onboardIntroHeaderText,
  },
  description: {
    marginRight: '2em',
    color: onboardIntroDescriptionText,
  },
  buttonContainer: {
    textAlign: 'right',
  },
});

const TokenizationIntro = ({
  classes,
  t,
  handleNextStep,
}) => (
  <div className={classes.root}>
    <div className={classes.contentContainer}>
      <img className={classes.image} src={rate3layers} alt="layers" />
    </div>
    <div className={classes.contentContainer}>
      <h1 className={classes.header}>
        {t('onboarding:tokenizationHeader')}
      </h1>
      <p className={classes.description}>
        {t('onboarding:tokenizationDescription')}
      </p>
      <div className={classes.buttonContainer}>
        <Button
          onClick={handleNextStep}
          color="primary"
          isUser
        >
          {t('startDemo')}
        </Button>
      </div>
    </div>
  </div>
);

TokenizationIntro.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  handleNextStep: PropTypes.func.isRequired,
};

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  translate(['navigator', 'onboarding']),
);

export default enhance(TokenizationIntro);
