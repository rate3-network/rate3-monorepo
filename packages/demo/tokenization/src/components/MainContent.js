import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { mainText } from '../constants/colors';

const styles = {
  root: {
    color: mainText,
  },
  header: {
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
};

const MainContent = ({
  classes,
  title,
  component: Component,
}) => (
  <div className={classes.root}>
    { title && <h1 className={classes.header}>{title}</h1> }
    <Component />
  </div>
);

MainContent.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string,
  component: PropTypes.func.isRequired,
};

MainContent.defaultProps = {
  title: '',
};

export default withStyles(styles)(MainContent);
