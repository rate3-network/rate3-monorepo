import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import HomeSidebar from '../components/HomeSidebar';
import { homeBg } from '../constants/colors';

const styles = theme => ({
  root: {
    backgroundColor: homeBg,
  },
});

const Home = (props) => {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <HomeSidebar />
    </div>
  );
};

Home.propTypes = {
  
};

export default withStyles(styles)(Home);
