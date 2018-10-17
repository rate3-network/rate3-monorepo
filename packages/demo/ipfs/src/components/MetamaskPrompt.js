import React from 'react';
import PropTypes from 'prop-types';
import logo from '../assets/metamask.png';
import web3jsState from '../constants/web3jsState';

const messageFor = (availability) => {
  switch (availability) {
    case web3jsState.NOT_APPROVED:
      return 'Please approve this app on metamask to continue.';
    case web3jsState.NOT_INSTALLED:
      return 'Please install metamask to continue.';
    case web3jsState.UNKNOWN:
      return 'Connecting to metamask.';
    default:
      return null;
  }
};

const MetamaskPrompt = ({ availability }) => (
  <React.Fragment>
    <header className="App-header text-center">
      <img style={{ maxWidth: '200px' }} src={logo} className="App-logo" alt="logo" />
    </header>
    <p className="App-intro text-center mt-3">
      {messageFor(availability)}
    </p>
  </React.Fragment>
);

MetamaskPrompt.propTypes = {
  availability: PropTypes.number.isRequired,
};

export default MetamaskPrompt;
