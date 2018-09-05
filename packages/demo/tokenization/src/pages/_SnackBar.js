import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import ErrorIcon from '@material-ui/icons/Error';

import {
  dismissError as dismissErrorAction,
  closeErrorSnackbar as closeErrorSnackbarAction,
} from '../actions/Errors';

import { compose } from '../utils';

const styles = theme => ({
  close: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 4,
  },
  contentRoot: {
    padding: theme.spacing.unit * 2,
  },
  messageContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: 0,
    paddingTop: theme.spacing.unit,
  },
  errorIcon: {
    marginRight: theme.spacing.unit,
  },
});

class ConsecutiveSnackbars extends React.Component {
  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    const { closeErrorSnackbar } = this.props;
    closeErrorSnackbar();
  };

  handleExited = () => {
    const { dismissError } = this.props;
    dismissError();
  };

  render() {
    const { classes, errorQueue, open } = this.props;

    return (
      <div>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={open}
          autoHideDuration={6000}
          onClose={this.handleClose}
          onExited={this.handleExited}
          ContentProps={{
            'aria-describedby': 'message-id',
            classes: {
              root: classes.contentRoot,
              message: classes.messageContainer,
            },
          }}
          message={(
            <React.Fragment>
              <ErrorIcon classes={{ root: classes.errorIcon }} />
              <span>{errorQueue[0]}</span>
            </React.Fragment>
          )}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              className={classes.close}
              onClick={this.handleClose}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </div>
    );
  }
}

ConsecutiveSnackbars.propTypes = {
  classes: PropTypes.object.isRequired,
  errorQueue: PropTypes.arrayOf(PropTypes.string).isRequired,
  open: PropTypes.bool.isRequired,
  dismissError: PropTypes.func.isRequired,
  closeErrorSnackbar: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  errorQueue: state.errors.errorQueue,
  open: state.errors.showErrorSnackbar,
});

const enhance = compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    {
      dismissError: dismissErrorAction,
      closeErrorSnackbar: closeErrorSnackbarAction,
    },
  ),
);

export default enhance(ConsecutiveSnackbars);
