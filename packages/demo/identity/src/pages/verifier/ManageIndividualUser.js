import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { inject, observer } from 'mobx-react';
import ChevronLeft from '@material-ui/icons/ChevronLeftRounded';
import IconButton from '@material-ui/core/IconButton';
import { translate } from 'react-i18next';

import ProfilePic from '../../components/ProfilePic';
import ExpandablePanel from '../../components/ExpandablePanel';
import FixedPanel from '../../components/FixedPanel';
import VerifyModal from '../../components/verifier/VerifyModal';
import SuccessModal from '../../components/SuccessModal';

const styles = (theme) => {
  return ({
    title: {
      letterSpacing: '0.02em',
      display: 'flex',
      alignItems: 'center',
      left: '-1.5em',
      position: 'relative',
      justifyContent: 'flex-start',
    },
    userAddr: {
      paddingLeft: '0.5em',
    },
    label: {
      fontSize: '1.5em',
      lineHeight: '1.5em',
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
class ManageIndividualUser extends Component {
  componentDidMount() {
    // use backbutton
    window.onpopstate = this.props.RootStore.verifierStore.resetUserSelected.bind(
      this.props.RootStore.verifierStore);
  }
  render() {
    const { classes, RootStore, t } = this.props;
    console.log('selected user names',RootStore.verifierStore.selectedUserNames);
    return (
      <div>
        <VerifyModal open={RootStore.verifierStore.verifyModalIsShowing} onClose={RootStore.verifierStore.closeVerificationModal.bind(RootStore.verifierStore)} />
        <SuccessModal
          open={RootStore.verifierStore.verifySuccessModalIsShowing}
          onClose={RootStore.verifierStore.closeVerifySuccessModal.bind(RootStore.verifierStore)}
          title={t('verifySuccessTitle')}
          content={t('verifySuccessContent')}
        />
        <h1 className={classes.title}>
          {/* Back Button */}
          <IconButton 
            onClick={RootStore.verifierStore.resetUserSelected.bind(RootStore.verifierStore)}>
            <ChevronLeft className={classes.label} />
          </IconButton>
          <div><ProfilePic size={7} seed={RootStore.verifierStore.getUserSelected()} /></div>
          <div className={classes.userAddr}>{RootStore.verifierStore.getUserSelected()}</div>
        </h1>
        <div className={classes.descriptionBox}>
          <p>You can approve this user’s verifications if he/she has registered.</p>
        
          {RootStore.verifierStore.selectedUserNames.length > 0 ?
            <ExpandablePanel isUser={this.props.RootStore.commonStore.getIsUser()} title="Name" items={RootStore.verifierStore.selectedUserNames} /> :
            <FixedPanel isUser={this.props.RootStore.commonStore.getIsUser()} title="Name" />
          }
          {RootStore.verifierStore.selectedUserAddresses.length > 0 ?
            <ExpandablePanel isUser={this.props.RootStore.commonStore.getIsUser()} title="Address" items={RootStore.verifierStore.selectedUserAddresses} /> :
            <FixedPanel isUser={this.props.RootStore.commonStore.getIsUser()} title="Address" />
          }
          {RootStore.verifierStore.selectedUserSocialIds.length > 0 ?
            <ExpandablePanel isUser={this.props.RootStore.commonStore.getIsUser()} title="Social ID" items={RootStore.verifierStore.selectedUserSocialIds} /> :
            <FixedPanel isUser={this.props.RootStore.commonStore.getIsUser()} title="Social ID" />
          }
        </div>
      </div>
    );
  }
}

ManageIndividualUser.propTypes = {

};

export default translate('general')(withStyles(styles)(ManageIndividualUser));
