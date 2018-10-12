import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import MaterialDesignSpinner from '../components/spinners/MaterialDesignSpinner';

import {
  userGlobalSpinnerBg,
  trusteeGlobalSpinnerBg,
  userGlobalSpinner,
  trusteeGlobalSpinner,
} from '../constants/colors';
import { compose, genStyle, getClass } from '../utils';

const styles = {
  ...genStyle('spinnerContainer', isUser => ({
    position: 'fixed',
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    backgroundColor: isUser ? userGlobalSpinnerBg : trusteeGlobalSpinnerBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  })),
};

const SpinnerOverlay = ({ classes, isUser, loading }) => (
  loading
    ? (
      <div className={getClass(classes, 'spinnerContainer', isUser)}>
        <MaterialDesignSpinner
          size={300}
          margin={10}
          border={30}
          color={isUser ? userGlobalSpinner : trusteeGlobalSpinner}
        />
      </div>
    )
    : null
);

SpinnerOverlay.propTypes = {
  classes: PropTypes.object.isRequired,
  isUser: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
};

const enhance = compose(
  withStyles(styles),
  connect(
    state => ({
      loading: state.wallet.walletLoading
        || state.wallet.balancesLoading
        || state.network.contractsLoading
        || state.network.networkChanging,
      isUser: state.wallet.isUser,
    }),
  ),
);

export default enhance(SpinnerOverlay);
