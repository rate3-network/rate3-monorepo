import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { disabledGrey } from '../constants/colors';
import BlueButton from './BlueButton';
import identityIcon from '../assets/identityIcon.svg';
import { PENDING, VERIFIED } from '../constants/general';
import Rate3LogoSmall from '../assets/Rate3LogoSmall.svg';
import addedIcon from '../assets/addedIcon.svg';
import pendingIcon from '../assets/pendingIcon.svg';

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
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '40%',
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
  },
  smallLogo: {
    height: '0.8em',
  },
  status: {
    fontSize: '0.8em',
    fontWeight: '500',
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
  },
  data: {
    paddingLeft: '3em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '10em',
  },
  pending: {
    paddingLeft: '3em',
  },
});

const ArrowIcon = withStyles(styles)((props) => {
  const { classes } = props;
  return <ExpandMoreIcon className={classes.icon} />;
});


const DetailedExpansionPanel = (props) => {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <ExpansionPanel
        className={classes.paper}
      >
        <ExpansionPanelSummary classes={{ expandIcon: classes.iconButton }} expandIcon={<ArrowIcon />}>
          <div className={classes.paperContainer}>
            <div className={classes.title}>
              {props.item.value} <img className={classes.smallLogo} src={Rate3LogoSmall} alt="Rate3 Logo Small" />
            </div>
            <div className={classes.status}>
              {props.item.status === VERIFIED ?
                <div><img className={classes.smallLogo} src={selectedIcon} alt="icon" />Added</div> :
                <div><img className={classes.smallLogo} src={pendingIcon} alt="icon" />Pending Review</div>
              }
            </div>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.details}>
          <div className={classes.content}>
            <div className={classes.contentCol}>
              {props.item.status === VERIFIED && <div>TxHsh</div>}
              <div>Data</div>
              <div>Signature</div>
            </div>
            <div className={classes.contentCol}>
              {props.item.status === VERIFIED && <div className={classes.data}>{props.item.txHash}</div>}
              <div className={classes.data}>{props.item.value}</div>
              {props.item.status === VERIFIED ?
                <div className={classes.data}>{props.item.signature}</div> :
                <div className={classes.pending}>Pending</div>
              }
            </div>
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
};

DetailedExpansionPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
};

export default withStyles(styles)(DetailedExpansionPanel);
