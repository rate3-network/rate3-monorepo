import React from 'react';
import PropTypes from 'prop-types';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';

import OnboardRoleSwitch from './../components/OnboardRoleSwitch';
import OnboardSideBar from './../components/OnboardSideBar';
import OnboardStepper from './../components/OnboardStepper';
import { identityBlue } from './../constants/colors';
import OnboardImg1 from './../assets/OnboardImg1.svg';
import OnboardImg2 from './../assets/OnboardImg2.svg';
import OnboardImg3 from './../assets/OnboardImg3.svg';

const onboardImgs = [OnboardImg1, OnboardImg2, OnboardImg3];

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: '100vh',
    zIndex: 1,
    display: 'flex',
  },
  content: {
    width: '100%',
    padding: '2% 3% 8% 7%',
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
const Onboard = inject('RootStore')(observer((props) => {
  const { classes } = props;
  const activeOnboardStep = props.RootStore.commonStore.getActiveOnboardStep();
  // if (activeOnboardStep > 3) {
  //   props.history.push('/');
  // }
  return (
    <div className={classes.root}>
      <OnboardSideBar imageSrc={onboardImgs[props.RootStore.commonStore.getActiveOnboardStep() - 1]} />
      <div className={classes.content}>
        
        <div className={classes.dropdownContainer}>
          <div className={classes.demoDropdown}>CROSS-CHAIN IDENTITY DEMO</div>
          <ExpandMore className={classes.icon} />
        </div>
        <div className={classes.onboardDetailContainer}>
          {/* <OnboardRoleSwitch
            leftText="test"
            rightText="test2"
            isUser={true}
          /> */}
          <OnboardStepper />
        </div>
      </div>
    </div>
  );
}));

Onboard.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default withRouter(withStyles(styles)(Onboard));
