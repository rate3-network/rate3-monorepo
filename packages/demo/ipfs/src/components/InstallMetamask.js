import React from 'react';
import logo from '../assets/metamask.png';

const InstallMetamask = () => (
  <React.Fragment>
    <header className="App-header text-center">
      <img src={logo} className="App-logo" alt="logo" />
    </header>
    <p className="App-intro text-center mt-3">
      Please install metamask to continue.
    </p>
  </React.Fragment>
);

export default InstallMetamask;
