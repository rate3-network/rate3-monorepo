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

const styles = theme => ({
  root: {
    width: '130%',
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
  icon: {
    color: 'black',
    height: '1.5em',
    width: '1.5em',
  },
  iconButton: {
    // width: '200px',
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
  },
  signature: {
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
              Rand
            </div>
            <div className={classes.status}>
              Pending Review
            </div>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.details}>
          <div className={classes.content}>
            <div className={classes.contentCol}>
              <div>Data</div>
              <div>Signature</div>
            </div>
            <div className={classes.contentCol}>
              <div className={classes.data}>123 Seasame Street, 235123</div>
              <div className={classes.signature}>Pending</div>
            </div>
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
};

DetailedExpansionPanel.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DetailedExpansionPanel);
