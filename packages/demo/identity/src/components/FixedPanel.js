import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { disabledGrey } from '../constants/colors';
import BlueButton from './BlueButton';
import identityIcon from '../assets/identityIcon.svg';

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
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '40%',
    // flexBasis: '33.33%',
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
    // alignItems: 'center',
  },
  icon: {
    // verticalAlign: 'bottom',
    color: 'black',
    height: '1.5em',
    width: '1.5em',
  },
  title: {
    fontWeight: 'bold',
    fontSize: '1em',
  },
  verificationStatus: {
    color: disabledGrey,
    fontWeight: 'bold',
    whiteSpace: 'pre',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '3em',
    height: '1.3em',
    // minHeight: '2em',
    marginRight: '1em',
  },
  iconButton: {
    // width: '200px',
    marginRight: '2em',
  },

});

const ArrowIcon = withStyles(styles)((props) => {
  const { classes } = props;
  return <ExpandMoreIcon className={classes.icon} />;
});

const RegisterButton = withStyles(styles)((props) => {
  const { classes } = props;
  return <BlueButton handleClick={props.handleClick} className={classes.buttonContainer} fontSize={'0.6em'} lineHeight={'1em'} fontWeight={300} buttonText="Register" />;
});


const FixedPanel = (props) => {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <ExpansionPanel className={classes.paper} expanded={false}>
        <ExpansionPanelSummary classes={{ expandIcon: classes.iconButton }} expandIcon={props.isUser ? <RegisterButton {...props} /> : <React.Fragment /> }>
          <div className={classes.header}>
            <img src={identityIcon} className={classes.image} alt="Identity Icon" />
            <div className={classes.textGroup}>
              <Typography className={classes.title}>{props.title}</Typography>
              <Typography className={classes.verificationStatus}>
                0 Verification
              </Typography>
            </div>
          </div>
        </ExpansionPanelSummary>
      </ExpansionPanel>
    </div>
  );
};

FixedPanel.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FixedPanel);
