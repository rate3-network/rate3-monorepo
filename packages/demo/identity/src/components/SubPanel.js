import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { observer, inject } from 'mobx-react';

import { identityHeavyGrey, pendingTextColor } from '../constants/colors';
import BlueButton from './BlueButton';
import { PENDING_REVIEW, PENDING_ADD, VERIFIED } from '../constants/general';
import Rate3LogoSmall from '../assets/Rate3LogoSmall.svg';
import addedIcon from '../assets/addedIcon.svg';
import pendingIcon from '../assets/pendingIcon.svg';
import ether from '../assets/ether.svg';

const styles = theme => ({
  root: {
    width: '92%',
    paddingLeft: '4%',
    marginTop: '0.2em',
  },
  paper: {
    borderRadius: '10px !important',
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.19)',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  paperContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: '4.5em',
  },
  textGroup: {
    height: '60%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: '1em 0 1em 1em',
  },
  title: {
    fontWeight: '500',
    fontSize: '1em',
    color: 'black',
    whiteSpace: 'pre',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallLogo: {
    height: '0.8em',
  },
  pendingText: {
    color: pendingTextColor,
  },
  status: {
    fontSize: '0.8em',
    fontWeight: '500',
    whiteSpace: 'pre',
  },
  icon: {
    color: 'black',
    height: '1.5em',
    width: '1.5em',
  },
  iconButton: {
    marginRight: '2em',
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: '3em',
  },
  contentCol: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '0.8em',
    fontWeight: '500',
  },
  contentHeaderCol: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '0.8em',
  },
  data: {
    paddingLeft: '3em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '10em',
    color: identityHeavyGrey,
  },
  pending: {
    paddingLeft: '3em',
  },
  addButton: {
    marginLeft: 'auto',
    paddingRight: '4em',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '4em',
    height: '1.3em',
    marginRight: '1em',
  },
  titleText: {
    maxWidth: '12em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
});

@inject('RootStore') @observer
class SubPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  handleAdd() {
    console.log(this.props.item);
    this.props.RootStore.userStore.addClaim(this.props.item);
  }

  handleVerify() {
    console.log(this.props.item);
    this.props.RootStore.verifierStore.setCurrentVerification(this.props.item.user, this.props.item.value, this.props.item.type);
    this.props.RootStore.verifierStore.openVerificationModal();
  }

  handleExpand() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  render() {
    const { classes } = this.props;

    const ArrowIcon = withStyles(styles)((props) => {
      return <ExpandMoreIcon onClick={this.handleExpand.bind(this)} className={classes.icon} />;
    });
    
    const AddButton = withStyles(styles)((props) => {
      return (
      <div>
        <BlueButton 
          className={classes.buttonContainer}
          fontSize="0.7em"
          lineHeight="1em"
          fontWeight={500}
          buttonText="add"
          buttonIcon={ether}
          iconHeight="0.8em"
        />
      </div>);
    });

    const VerifyButton = withStyles(styles)((props) => {
      return (
      <div>
        <BlueButton 
          className={classes.buttonContainer}
          fontSize="0.7em"
          lineHeight="1em"
          fontWeight={500}
          buttonText="verify"
          iconHeight="0.8em"
        />
      </div>);
    });
    

    return (
      <div className={classes.root}>
        <ExpansionPanel
          className={classes.paper}
          expanded={this.state.expanded}
        >
          <ExpansionPanelSummary classes={{ expandIcon: classes.iconButton }} expandIcon={<ArrowIcon />}>
            <div className={classes.paperContainer}>
              <div>
                <div className={classes.title}>
                  <div className={classes.titleText}>{this.props.item.value}</div><p> </p><img className={classes.smallLogo} src={Rate3LogoSmall} alt="Rate3 Logo Small" />
                </div>
                <div className={classes.status}>
                  {this.props.item.status === VERIFIED &&
                    <div  className={classes.pendingText}><img className={classes.smallLogo} src={addedIcon} alt="icon" /> Added</div>
                  }
                  {this.props.item.status === PENDING_REVIEW &&
                    <div className={classes.pendingText}><img className={classes.smallLogo} src={pendingIcon} alt="icon" /> Pending Review</div>
                  }
                  {this.props.item.status === PENDING_ADD &&
                    <div className={classes.pendingText}><img className={classes.smallLogo} src={pendingIcon} alt="icon" /> Ready to Add</div>
                  }
                </div>
              </div>
              {this.props.isUser && this.props.item.status === PENDING_ADD &&
                <div onClick={this.handleAdd.bind(this)} className={classes.addButton}><AddButton /></div>
              }
              {!this.props.isUser && this.props.item.status === PENDING_REVIEW &&
                <div onClick={this.handleVerify.bind(this)} className={classes.addButton}><VerifyButton /></div>
              }
            </div>
            
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.details}>
            <div className={classes.content}>
              <div className={classes.contentHeaderCol}>
                {this.props.item.status === VERIFIED ?
                  <React.Fragment><div>TxHsh</div><div>Data</div><div>Signature</div></React.Fragment> :
                  <React.Fragment> <div>Data</div><div>Signature</div></React.Fragment>
                }
              </div>
              <div className={classes.contentCol}>
                {this.props.item.status === VERIFIED && <div className={classes.data}>{'this.props.item.txHash'}</div>}
                <div className={classes.data}>{this.props.item.value}</div><div className={classes.data}>{'this.props.item.signature'}</div>
                {this.props.item.status === PENDING_REVIEW &&
                  <div className={classes.pending}>Pending</div>
                }
                {this.props.item.status === PENDING_ADD &&
                  <div className={classes.data}>{this.props.item.signature}</div>
                }
              </div>
            </div>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  }
}

SubPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
};

export default withStyles(styles)(SubPanel);
