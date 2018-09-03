import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import OnboardSideBar from './../components/OnboardSideBar';

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: '100vh',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    minWidth: 0, // So the Typography noWrap works
  },
});
const Onboard = (props) => {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <OnboardSideBar />
      <main className="blue-text">
        <h1>You think water moves fast? You shosdfsdulsd see ice.</h1>
      </main>
    </div>
  );
};

Onboard.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default withStyles(styles)(Onboard);
