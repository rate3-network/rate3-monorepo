import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { translate, Trans } from 'react-i18next';
import MobileStepper from '@material-ui/core/MobileStepper';
import SwipeableViews from 'react-swipeable-views';
import { identityBlue, dotActiveBgColor, dotBgColor } from '../../constants/colors';

import userInstruction1 from '../../assets/userInstruction1.svg';
import userInstruction2 from '../../assets/userInstruction2.svg';
import userInstruction3 from '../../assets/userInstruction3.svg';

const styles = theme => ({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    // justifyContent: 'space-between',
    overflow: 'hidden',
  },
  swiper: {
    height: '100%',
    width: '100%',
  },
  mobileStepper: {
    width: '100%',
    backgroundColor: identityBlue,
    display: 'flex',
    justifyContent: 'center',
    padding: 0,
  },
  contentWrapper: {
    minHeight: '20em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWithImage: {
    height: '100%',
    width: '80%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    fontSize: '1.2em',
    letterSpacing: '0.04em',
  },
  content: {
    height: '100%',
    width: '80%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',

    fontSize: '1.2em',
    letterSpacing: '0.04em',
  },
  contentTitle: {
    fontSize: '2em',
    fontWeight: '400',
    marginBlockStart: '0',
    marginBlockEnd: '0.5em',
  },
  dot: {
    backgroundColor: dotBgColor,
  },
  dotActive: {
    backgroundColor: dotActiveBgColor,
  },
  stepBox: {
    width: '13em',
    marginBlockStart: 0,
  },
  contentStepTitle: {
    display: 'flex',
    flexDirection: 'row',
  },
  image: {
    width: '80%',
  },
});
const BoldItalic = (props) => {
  return (<b><i>{props.children}</i></b>);
};

/* eslint react/prefer-stateless-function: off */
class UserInstructions extends React.Component {
  render() {
    const { classes, theme } = this.props;
    const MAX_STEP = 4;
    return (
      <div className={classes.root}>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          // index={this.state.activeStep}
          index={this.props.activeStep}
          onChangeIndex={this.props.onChangeIndex}
          enableMouseEvents
          className={classes.swiper}
        >
          <div className={classes.contentWrapper}>
            <div className={classes.content}>
              <p className={classes.contentTitle}><Trans i18nKey="userInstruction1_1" /></p>
              <p><Trans i18nKey="userInstruction1_2"><BoldItalic>user</BoldItalic></Trans></p>
              <p><Trans i18nKey="userInstruction1_3"><BoldItalic>verifications</BoldItalic></Trans></p>
            </div>
          </div>
          <div className={classes.contentWrapper}>
            <div className={classes.contentWithImage}>
              <div className={classes.contentStepTitle}>
                <span>1. </span>
                <p className={classes.stepBox}><Trans i18nKey='userInstruction2'><BoldItalic>registering</BoldItalic></Trans></p>
              </div>
              <img className={classes.image} src={userInstruction1} alt="" />
            </div>
          </div>
          <div className={classes.contentWrapper}>
            <div className={classes.contentWithImage}>
              <div className={classes.contentStepTitle}>
                <span>2. </span>
                <p className={classes.stepBox}><Trans i18nKey='userInstruction3'><BoldItalic>wait</BoldItalic></Trans></p>
              </div>
              <img className={classes.image} src={userInstruction2} alt="" />
            </div>
          </div>
          <div className={classes.contentWrapper}>
            <div className={classes.contentWithImage}>
              <div className={classes.contentStepTitle}>
                <span>3. </span>
                <p className={classes.stepBox}><Trans i18nKey='userInstruction4'><BoldItalic>Add</BoldItalic></Trans></p>
              </div>
              <img className={classes.image} src={userInstruction3} alt="" />
            </div>
          </div>
        </SwipeableViews>
        <MobileStepper
          steps={MAX_STEP}
          position="static"
          activeStep={this.props.activeStep}
          className={classes.mobileStepper}
          classes={{
            dot: classes.dot,
            dotActive: classes.dotActive,
          }}
        />
      </div>
    );
  }
}

UserInstructions.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default translate('instructions')(withStyles(styles, { withTheme: true })(UserInstructions));
