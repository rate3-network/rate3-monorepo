import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    backgroundColor: 'inherit',
  },
});

const AccountsSummary = ({
  classes,
  children,
}) => (
  <div className={classes.root}>
    <Grid container>
      {children.map((child, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <Grid item xs={4} key={idx}>
          <Paper className={classes.paper} elevation={0}>
            {child}
          </Paper>
        </Grid>
      ))}
    </Grid>
  </div>
);

AccountsSummary.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default withStyles(styles, { withTheme: true })(AccountsSummary);
