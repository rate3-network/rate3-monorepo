import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import Lens from '@material-ui/icons/Lens';

import { networkBoxBg, identityBlueLight, materialGrey } from '../constants/colors';

const styles = theme => ({
  box: {
    backgroundColor: networkBoxBg,
    color: materialGrey,
    height: '2.6em',
    width: '14.5em',
    fontWeight: '500',
    fontSize: '0.9em',
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
const NetworkBox = inject('RootStore')(observer((props) => {
  const { classes } = props;
  return (
    <div className={classes.box}>
      <Lens className={classes.icon} /> {props.RootStore.commonStore.currentNetwork}
    </div>
  );
}));

NetworkBox.propTypes = {
  
};

export default withStyles(styles)(NetworkBox);
