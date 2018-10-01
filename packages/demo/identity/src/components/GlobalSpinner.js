import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Modal from '@material-ui/core/Modal';
import { inject, observer } from 'mobx-react';

const styles = (theme) => {
  return ({
    modal: {
      '& :focus': {
        outline: 'none',
      },
    },
    spinner: {
      position: 'absolute',
      color: 'white',
      left: 'calc(100vw / 2 - 100px)',
      top: 'calc(100vh / 2 - 100px)',
    },
  });
};
const GlobalSpinner = inject('RootStore')(observer((props) => {
  const { classes } = props;
  return (
    <Modal
      className={classes.modal}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={props.RootStore.startInitNetwork && !props.RootStore.finishInitNetwork}
    >
      <CircularProgress className={classes.spinner} size={200} />
    </Modal>
  );
}));

GlobalSpinner.propTypes = {
  
};

export default withStyles(styles)(GlobalSpinner);
