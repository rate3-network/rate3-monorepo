import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import Lens from '@material-ui/icons/Lens';

import { networkBoxBg, identityBlueLight } from '../constants/colors';

const styles = theme => ({
  box: {
    backgroundColor: networkBoxBg,
    height: '2.5em',
    width: '15em',
    fontWeight: '500',
    fontSize: '0.7em',
    borderRadius: '9px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '0.5em',
  },
  icon: {
    height: '0.4em',
    color: identityBlueLight,
  },
});
const NetworkBox = (props) => {
  const { classes } = props;
  return (
    <div className={classes.box}>
      <Lens className={classes.icon} /> {props.RootStore.commonStore.getCurrentNetwork()}
    </div>
  );
};

NetworkBox.propTypes = {
  
};

export default inject('RootStore')(observer((withStyles(styles)(NetworkBox))));
