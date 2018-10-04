import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { observer, inject } from 'mobx-react';

import { pendingTextColor,identityBlue, disabledGrey, actionRequiredBoxBg } from '../constants/colors';
import identityIcon from '../assets/identityIcon.svg';
import SubPanel from './SubPanel';
import NameIcon from '../assets/Name.svg';
import AddressIcon from '../assets/Address.svg';
import SocialIdIcon from '../assets/SocialID.svg';
import { VERIFIED, PENDING_ADD, PENDING_REVIEW } from '../constants/general';

const styles = theme => ({
  root: {
    width: '130%',
    maxWidth: '40em',
  },
  paper: {
    marginTop: '0.1em',
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.19)',
    borderRadius: '2px !important',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  icon: {
    // verticalAlign: 'bottom',
    color: 'black',
    height: '1.5em',
    width: '1.5em',
  },
  details: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    // flexBasis: '33.33%',
  },
  image: {
    width: '4.5em',
  },
  textGroup: {
    height: '60%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: '1em 0 1em 1em',
    // alignItems: 'center',
  },
  titleInOneRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  title: {
    fontWeight: 'bold',
    fontSize: '1em',
  },
  verificationStatus: {
    color: identityBlue,
    fontWeight: 'bold',
    whiteSpace: 'pre',
  },
  disabledVerificationStatus: {
    color: pendingTextColor,
    fontWeight: 'bold',
    whiteSpace: 'pre',
  },
  iconButton: {
    // width: '200px',
    marginRight: '2em',
  },
  actionRequiredBox: {
    marginLeft: 'auto',
    marginRight: '8%',
    padding: '0 0.8em 0 0.8em',
    borderRadius: '0.3em',
    backgroundColor: actionRequiredBoxBg,
    fontSize: '0.8em',
    fontStyle: 'italic',
  },
});

const ArrowIcon = withStyles(styles)((props) => {
  const { classes } = props;
  return <ExpandMoreIcon className={classes.icon} />;
});
@inject('RootStore') @observer
class DetailedExpansionPanel extends React.Component {
  state = {
    publishClicked: false,
  };

  render() {
    const { classes } = this.props;
    const noVerified = this.props.items.filter(item => item.status === VERIFIED).length;
    const noPending = this.props.items.filter(item => item.status === PENDING_REVIEW).length;
    const noPendingAdd = this.props.items.filter(item => item.status === PENDING_ADD).length;
    const needAction = this.props.items.filter(item => item.status === PENDING_ADD).length > 0;
    let shouldShowAction;
    let icon;
    if (this.props.title === 'Name') icon = NameIcon;
    if (this.props.title === 'Address') icon = AddressIcon;
    if (this.props.title === 'Social ID') icon = SocialIdIcon;
    if (this.props.title === 'Name' && this.props.isUser) {
      shouldShowAction = needAction && !this.props.RootStore.panelButtonsStore.userPublishNameButtonConfirmed;
    }
    if (this.props.title === 'Address' && this.props.isUser) {
      shouldShowAction = needAction && !this.props.RootStore.panelButtonsStore.userPublishAddressButtonConfirmed;
    }
    if (this.props.title === 'Social ID' && this.props.isUser) {
      shouldShowAction = needAction && !this.props.RootStore.panelButtonsStore.userPublishSocialIdButtonConfirmed;
    }

    return (
      <div className={classes.root}>
        <ExpansionPanel className={classes.paper}>
          <ExpansionPanelSummary classes={{ expandIcon: classes.iconButton }} expandIcon={<ArrowIcon />}>
            <div className={classes.header}>
              <img src={icon} className={classes.image} alt="Identity Icon" />
              <div className={classes.textGroup}>
                <Typography className={classes.title}>{this.props.title}</Typography>
                <div className={classes.titleInOneRow}>
                  {noVerified > 0 && <Typography className={classes.verificationStatus}>{noVerified} Verification </Typography>}
                  {noPending > 0 && <Typography className={classes.disabledVerificationStatus}>{noPending} Pending</Typography>}
                  {noPendingAdd > 0 && <Typography className={classes.disabledVerificationStatus}>{noPendingAdd} Pending</Typography>}
                </div>
              </div>
              {/* for verifier  */}
              {(!this.props.isUser && noPending > 0) && <div className={classes.actionRequiredBox}>Action Required</div>}
              {/* for user  */}
              {this.props.isUser && shouldShowAction && <div className={classes.actionRequiredBox}>Action Required</div>}
            </div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.details}>
            {this.props.items.map((item) => {
              return (<SubPanel isUser={this.props.isUser} key={JSON.stringify(item)} item={item} />);
            })}
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  }
}

DetailedExpansionPanel.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DetailedExpansionPanel);
