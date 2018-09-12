import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import SwipeableViews from 'react-swipeable-views';
import { identityBlue, dotActiveBgColor, dotBgColor } from '../constants/colors';

import userInstruction1 from '../assets/userInstruction1.svg';
import userInstruction2 from '../assets/userInstruction2.svg';
import userInstruction3 from '../assets/userInstruction3.svg';

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

class SwipeableTextMobileStepper extends React.Component {
  state = {
    activeStep: 0,
  };

  handleNext = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1,
    }));
  };

  handleBack = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep - 1,
    }));
  };

  handleStepChange = (activeStep) => {
    this.setState({ activeStep });
  };

  render() {
    const { classes, theme } = this.props;
    const { activeStep } = this.state;

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
              <p className={classes.contentTitle}>Hello,</p>
              <p>You are currently a <b><i>user</i></b>.</p>
              <p>Build up your reusable identity by registering for <b><i>verifications</i></b>...</p>
            </div>
          </div>
          <div className={classes.contentWrapper}>
            <div className={classes.contentWithImage}>
              <div className={classes.contentStepTitle}><span>1. </span><p className={classes.stepBox}>Start by <b><i>registering</i></b> for a verification</p></div>
              <img className={classes.image} src={userInstruction1} alt="" />
            </div>
          </div>
          <div className={classes.contentWrapper}>
            <div className={classes.contentWithImage}>
              <div className={classes.contentStepTitle}><span>2. </span><p className={classes.stepBox}><b><i>Wait</i></b> for the verification to be sent back to you</p></div>
              <img className={classes.image} src={userInstruction2} alt="" />
            </div>
          </div>
          <div className={classes.contentWrapper}>
            <div className={classes.contentWithImage}>
              <div className={classes.contentStepTitle}><span>3. </span><p className={classes.stepBox}><b><i>Add</i></b> your verification to the blockchain</p></div>
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

SwipeableTextMobileStepper.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(SwipeableTextMobileStepper);