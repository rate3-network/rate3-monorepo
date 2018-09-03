import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';

import OnboardImg1 from './../assets/OnboardImg1.svg';

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: '100vh',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },
  drawerPaper: {
    backgroundColor: '#4392F1',
    position: 'relative',
    width: '45vw',
    boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.15)',
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    minWidth: 0, // So the Typography noWrap works
  },
  toolbar: theme.mixins.toolbar,
});

function OnboardSideBar(props) {
  const { classes } = props;

  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <img src={OnboardImg1} alt="Onboard 1" />
    </Drawer>
  );
}

OnboardSideBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(OnboardSideBar);