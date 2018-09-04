import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import { observer, inject } from 'mobx-react';

import LanguageDropdown from './LanguageDropdown';
import { identityBlue } from './../constants/colors';
import Rate3Logo from './../assets/rate3Logo.svg';

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
    backgroundColor: identityBlue,
    position: 'relative',
    color: 'white',
    width: '45vw',
    boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.15)',
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    minWidth: 0, // So the Typography noWrap works
  },
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '4vh 2vh 2vh 4vh',
  },
  logo: {
    alignSelf: 'flex-start',
    width: '23%',
  },
  image: {
    alignSelf: 'center',
    width: '60%',
  },
  toolbar: theme.mixins.toolbar,
});

const OnboardSideBar = (props) => {
  const { classes } = props;
  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.container}>
        <img className={classes.logo} src={Rate3Logo} alt="rate3 logo" />
        <img className={classes.image} src={props.imageSrc} alt="Onboard 1" />
        <LanguageDropdown />
      </div>
    </Drawer>
  );
};

OnboardSideBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default inject('RootStore')(observer((withStyles(styles)(OnboardSideBar))));
