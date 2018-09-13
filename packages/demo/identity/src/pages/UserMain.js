import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import { translate } from 'react-i18next';
import { Route, Switch, withRouter } from 'react-router-dom';

import ExpandablePanel from '../components/ExpandablePanel';
import FixedPanel from '../components/FixedPanel';
import InstructionModal from '../components/InstructionModal';
import UserInstructions from '../components/UserInstructions';

const styles = (theme) => {
  return ({
    container: {
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      letterSpacing: '0.02em',
    },
    descriptionBox: {
      width: '65%',
      fontSize: '1.2em',
      lineHeight: '1.55em',
      fontWeight: '400',
      marginBottom: '5em',
    },
  });
};

@inject('RootStore') @observer
class UserMain extends React.Component {
  componentDidMount() {
    if (this.props.RootStore.commonStore.getIsUser()) {
      this.props.history.push('/user');
    } else {
      this.props.history.push('/verifier');
    }
  }
  render() {
    const { classes, t, RootStore } = this.props;
    const { userStore } = RootStore;
    const instructionLength = 4;
    console.log('user main');
    return (
      <div className={classes.container}>
        <InstructionModal
          open={userStore.getUserModalIsShowing()}
          onClose={userStore.closeModal.bind(userStore)}
          handleNext={userStore.handleModalNext.bind(userStore)}
          handleBack={userStore.handleModalBack.bind(userStore)}
          activeStep={userStore.getModalPage()}
          maxSteps={instructionLength}
        >
          <UserInstructions
            activeStep={userStore.getModalPage()}
            onChangeIndex={userStore.handleModalIndexChange.bind(userStore)}
          />
        </InstructionModal>
        <h1 className={classes.title}>My Identity</h1>
        <div className={classes.descriptionBox}>
          <p>This is your reusuable identity that is improved by verifications which authenticates a part of your identity.</p>
          {userStore.getIdentityNames().length > 0 ?
            <ExpandablePanel title="Name" items={userStore.getIdentityNames()} /> :
            <FixedPanel title="Name" />
          }
          {userStore.getIdentityAddresses().length > 0 ?
            <ExpandablePanel title="Address" items={userStore.getIdentityAddresses()} /> :
            <FixedPanel title="Address" />
          }
          {userStore.getIdentitySocialIds().length > 0 ?
            <ExpandablePanel title="Social ID" items={userStore.getIdentitySocialIds()} /> :
            <FixedPanel title="Social ID" />
          }
        </div>
      </div>
    );
  }
}


UserMain.propTypes = {
  
};

export default withStyles(styles)(translate('general')(withRouter(UserMain)));
