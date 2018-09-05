import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';

import {
  userConfirmationLabel,
  userConfirmationValue,
} from '../../constants/colors';

const styles = ({
  root: {
    letterSpacing: 0,
  },
  label: {
    color: userConfirmationLabel,
    marginBottom: '0.5em',
  },
  value: {
    color: userConfirmationValue,
    fontWeight: 'bold',
    marginBottom: '0.5em',
    wordBreak: 'break-word',
  },
});

const Confirmation = ({
  classes,
  fields,
}) => (
  <React.Fragment>
    <Grid container className={classes.root}>
      {
        fields.map(row => (
          <React.Fragment key={row.label}>
            <Grid item xs={6} classes={{ item: classes.label }}>
              {row.label}
            </Grid>
            <Grid item xs={6} classes={{ item: classes.value }}>
              {row.value}
            </Grid>
          </React.Fragment>
        ))
      }
    </Grid>
  </React.Fragment>
);

Confirmation.propTypes = {
  classes: PropTypes.object.isRequired,
  fields: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.node.isRequired,
    value: PropTypes.node.isRequired,
  })).isRequired,
};

export default withStyles(styles, { withTheme: true })(Confirmation);
