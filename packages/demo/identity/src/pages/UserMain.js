import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import { translate } from 'react-i18next';
import { Route, Switch, withRouter } from 'react-router-dom';

import ExpandablePanel from '../components/ExpandablePanel';
import FixedPanel from '../components/FixedPanel';
import InstructionModal from '../components/InstructionModal';
import UserInstructions from '../components/user/UserInstructions';
import RegistrationModal from '../components/user/RegistrationModal';

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
  constructor(props) {
    super(props);
    if (!this.props.RootStore.commonStore.getIsUser()) {
      this.props.history.push('/verifier');
    }
  }
  componentDidMount() {
  }
  render() {
    const { classes, t, RootStore } = this.props;
    const { userStore } = RootStore;
    const instructionLength = 4;
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
        <RegistrationModal
          open={userStore.getRegisterModalIsShowing()}
          onClose={userStore.closeRegisterModal.bind(userStore)}
          handleClick={(e) => { userStore.setVerifierSelected(e.target.value); }}
          textInputValue={userStore.getFormTextInputValue()}
          handleChange={(e) => { userStore.setFormTextInputValue(e.target.value); }}
          verifierList={userStore.getVerifierList()}
          verifier={userStore.getVerifierSelected()}
        />

        <h1 className={classes.title}>My Identity</h1>
        <div className={classes.descriptionBox}>
          <p>This is your reusuable identity that is improved by verifications which authenticates a part of your identity.</p>
          {userStore.getIdentityNames().length > 0 ?
            <ExpandablePanel title="Name" items={userStore.getIdentityNames()} /> :
            <FixedPanel handleClick={userStore.openRegisterModal.bind(userStore)} title="Name" />
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
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};
UserMain.wrappedComponent.propTypes = {
  RootStore: PropTypes.object.isRequired,
};

export default withStyles(styles)(translate('general')(withRouter(UserMain)));
