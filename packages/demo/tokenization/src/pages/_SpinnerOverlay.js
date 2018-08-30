import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import MaterialDesignSpinner from '../components/spinners/MaterialDesignSpinner';

import {
  globalSpinnerBg,
  globalSpinner,
} from '../constants/colors';
import { compose } from '../utils';

const styles = {
  spinnerContainer: {
    position: 'fixed',
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    backgroundColor: globalSpinnerBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

const SpinnerOverlay = ({ classes, loading }) => (
  loading
    ? (
      <div className={classes.spinnerContainer}>
        <MaterialDesignSpinner
          size={300}
          margin={10}
          border={30}
          color={globalSpinner}
        />
      </div>
    )
    : null
);

SpinnerOverlay.propTypes = {
  classes: PropTypes.object.isRequired,
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
    }),
  ),
);

export default enhance(SpinnerOverlay);
