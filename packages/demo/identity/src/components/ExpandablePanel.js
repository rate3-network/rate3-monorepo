import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import SelectedBox from '../assets/selectedBox.svg';
import UnselectedBox from '../assets/unselectedBox.svg';
import { identityBlue, disabledGrey } from '../constants/colors';
import BlueButton from './BlueButton';
import identityIcon from '../assets/identityIcon.svg';

const styles = theme => ({
  root: {
    width: '130%',
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
    alignItems: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
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
    color: disabledGrey,
    fontWeight: 'bold',
    whiteSpace: 'pre',
  },
  iconButton: {
    // width: '200px',
    marginRight: '2em',
  },
  selectIcon: {
    height: '1em',
  },
});

const ArrowIcon = withStyles(styles)((props) => {
  const { classes } = props;
  return <ExpandMoreIcon className={classes.icon} />;
});

const RegisterButton = withStyles(styles)((props) => {
  const { classes } = props;
  return <BlueButton className={classes.icon} />;
}); 

const DetailedExpansionPanel = (props) => {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <ExpansionPanel className={classes.paper}>
        <ExpansionPanelSummary classes={{ expandIcon: classes.iconButton }} expandIcon={<ArrowIcon />}>
          <div className={classes.header}>
            <img src={identityIcon} className={classes.image} alt="Identity Icon" />
            <div className={classes.textGroup}>
              <Typography className={classes.title}>Name</Typography>
              <Typography className={classes.verificationStatus}>
                <img className={classes.selectIcon} src={SelectedBox} alt="Unselected Icon" />  1 Verification
              </Typography>
              {/* <Typography className={classes.disabledVerificationStatus}>
                <img className={classes.selectIcon} src={UnselectedBox} alt="Unselected Icon" />  0 Verification
              </Typography> */}
            </div>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.details}>
          {props.children}
        </ExpansionPanelDetails>
      
      </ExpansionPanel>
    </div>
  );
};

DetailedExpansionPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.any.isRequired,

};

export default withStyles(styles)(DetailedExpansionPanel);
