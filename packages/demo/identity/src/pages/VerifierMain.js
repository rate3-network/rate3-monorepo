import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';

import SearchBar from '../components/verifier/SearchBar';
import ManagementTabs from '../components/verifier/ManagementTabs';
import ManageIndividualUser from './verifier/ManageIndividualUser';
import InstructionModal from '../components/InstructionModal';
import VerifierInstructions from '../components/VerifierInstructions';

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
class VerifierMain extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.RootStore.commonStore.getIsUser()) {
      this.props.history.push('/user');
    }
  }
  componentDidMount() {
  }
  // onUserItemClick(value) {
  //   console.log('clicked');
    
  //   this.props.RootStore.verifierStore.setUserSelected(value);
  //   console.log(this.props.RootStore.verifierStore.getUserSelected());
  // }
  render() {
    const { classes, t, RootStore } = this.props;
    const { verifierStore } = RootStore;
    const instructionLength = 4;
    return (
      <div className={classes.container}>
        <InstructionModal
          open={verifierStore.getVerifierModalIsShowing()}
          onClose={verifierStore.closeModal.bind(verifierStore)}
          handleNext={verifierStore.handleModalNext.bind(verifierStore)}
          handleBack={verifierStore.handleModalBack.bind(verifierStore)}
          activeStep={verifierStore.getModalPage()}
          maxSteps={instructionLength}
        >
          <VerifierInstructions
            activeStep={verifierStore.getModalPage()}
            onChangeIndex={verifierStore.handleModalIndexChange.bind(verifierStore)}
          />
        </InstructionModal>
        {this.props.RootStore.verifierStore.getUserSelected() !== null ?
          <ManageIndividualUser />
          :
          <div>
            <h1 className={classes.title}>Manage Users</h1>
            <div className={classes.descriptionBox}>
              <p>This is your reusuable identity that is improved by verifications which authenticates a part of your identity.</p>
              <SearchBar />
              <ManagementTabs onUserItemClick={this.onUserItemClick} />
            </div>
          </div>
        }
      </div>
    );
  }
}


VerifierMain.propTypes = {
  
};

export default withStyles(styles)(VerifierMain);
