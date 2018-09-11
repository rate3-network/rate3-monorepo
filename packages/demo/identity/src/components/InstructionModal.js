import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';

import { identityBlue, backdropColor, modalShadow } from './../constants/colors';

const styles = (theme) => {
  return ({
    modal: {
      position: 'absolute',
      top: 'calc(50% - 12em)',
      left: 'calc(50% - 17.5em)',
      width: '35rem',
      height: '25rem',
      '&:focus': {
        outline: 'none',
      },
    },
    paper: {
      width: '100%',
      height: '100%',
      backgroundColor: identityBlue,
      boxShadow: modalShadow,
      borderRadius: '0.5em 0.5em 0 0',
    },
    content: {
      color: 'white',
      width: '80%',
      height: '80%',
      padding: '3em 0 3em 5em',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'space-around',
    },
    footer: {
      backgroundColor: 'white',
      width: '35rem',
      height: '2rem',
      borderRadius: '0 0 0.5em 0.5em',
    },
    backdrop: {
      backgroundColor: backdropColor,
    }
  });
};

const InstructionModal = (props) => {
  const { classes } = props;
  return (
    <div>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={props.open}
        onClose={props.onClose}
        BackdropProps={{
          classes: {
            root: classes.backdrop,
          },
        }}
        // onClose={this.handleClose}
      >
        <div className={classes.modal}>
          <div className={classes.paper}>
            <div className={classes.content}>
              <div>
                Text in a modal
              </div>
              <div>
                Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
              </div>
            </div>
          </div>
          <div className={classes.footer}>
            test
          </div>
        </div>
      </Modal>
    </div>
  );
};

Modal.propTypes = {
  
};

export default withStyles(styles)(InstructionModal);
