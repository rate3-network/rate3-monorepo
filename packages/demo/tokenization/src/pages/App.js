import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import {
  approvePath,
  finalizePath,
  rootPath,
} from '../constants/urls';

import Main from './_Main';
import Onboard from './Onboard';
import withTracker from './withTracker';

import {
  switchRole as switchRoleAction,
} from '../actions/Wallet';
import {
  init as networkInitAction,
} from '../actions/Network';

import { compose } from '../utils';


class App extends React.Component {
  componentDidMount() {
    const {
      networkInit,
      location: { pathname },
    } = this.props;
    const isTrusteePath = [
      approvePath,
      finalizePath,
    ].reduce((isTrustee, path) => (isTrustee || path === pathname), false);
    networkInit(!isTrusteePath);
  }

  componentDidUpdate(prevProps) {
    const {
      location,
      isUser,
      switchRole,
    } = this.props;

    if (location !== prevProps.location
      && location.state && location.state.isUser !== isUser) {
      switchRole();
    }
  }

  render() {
    const {
      location: { pathname },
    } = this.props;

    if (pathname === rootPath) {
      return <Onboard />;
    }

    return <Main />;
  }
}

App.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    state: PropTypes.object,
  }).isRequired,
  isUser: PropTypes.bool.isRequired,
  networkInit: PropTypes.func.isRequired,
  switchRole: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isUser: state.wallet.isUser,
});

const enhance = compose(
  withTracker,
  withRouter,
  connect(
    mapStateToProps,
    {
      networkInit: networkInitAction,
      switchRole: switchRoleAction,
    },
  ),
);

export default enhance(App);
