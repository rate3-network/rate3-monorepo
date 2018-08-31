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
  networkInit: PropTypes.func.isRequired,
};

const enhance = compose(
  withRouter,
  connect(
    null,
    {
      networkInit: networkInitAction,
    },
  ),
);

export default enhance(App);
