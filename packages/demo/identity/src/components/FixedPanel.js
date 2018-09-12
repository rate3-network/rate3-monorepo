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
  return <ExpandMoreIcon />;
});

const RegisterButton = withStyles(styles)((props) => {
  const { classes } = props;
  return <div><BlueButton className={classes.buttonContainer} fontSize={'0.7em'} lineHeight={'1em'} fontWeight={500} buttonText="Register" /></div>;
});


const DetailedExpansionPanel = (props) => {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <ExpansionPanel className={classes.paper} expanded={false}>
        <ExpansionPanelSummary classes={{ expandIcon: classes.iconButton }} expandIcon={<RegisterButton />}>
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

DetailedExpansionPanel.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DetailedExpansionPanel);
