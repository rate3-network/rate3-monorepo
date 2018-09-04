import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { withStyles } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';

import OnboardSideBar from './../components/OnboardSideBar';
import OnboardStepper from './../components/OnboardStepper';
import { identityBlue } from './../constants/colors';

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: '100vh',
    zIndex: 1,
    // overflow: 'hidden',
    display: 'flex',
  },
  content: {
    width: '100%',
    padding: '2% 3% 5% 7%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  dropdownContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    color: identityBlue,
  },
  demoDropdown: {
    fontSize: '1.4rem',
    paddingRight: '0.8em',
    top: '0px',
    right: '0px',
  },
  onboardDetailContainer: {
    alignSelf: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    width: '80%',
    paddingTop: '10vh',
  },
  icon: {
    fontWeight: 'bold',
    fontSize: '2rem',
  },
  stepper: {
    position: 'static',
    backgroundColor: 'white',
  },
});
const Onboard = (props) => {
  const { classes } = props;
  return (
    <div className={classes.root}>

      <OnboardSideBar />

      <div className={classes.content}>
        <div className={classes.dropdownContainer}>
          <div className={classes.demoDropdown}>CROSS-CHAIN IDENTITY DEMO</div>
          <ExpandMore className={classes.icon} />
        </div>
        {/* <OnboardStepper className={classes.onboardDetailContainer} /> */}
        <div className={classes.onboardDetailContainer}>
          <OnboardStepper />
          {/* <div className={classes.header}>Cross-Chain Identity.</div>
          <div className={classes.text}>
            A unified cross-chain identity framework for real-world entities to share identity information.
          </div>
          <Button size="large" className={classes.button}>
            Begin
          </Button> */}
        </div>
      </div>
    </div>
  );
};

Onboard.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default withStyles(styles)(Onboard);
