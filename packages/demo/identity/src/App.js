import { I18nextProvider } from 'react-i18next';
import React, { Component } from 'react';
import { Provider, observer } from 'mobx-react';

import logo from './logo.svg';
import './App.css';

import SideBar from './components/SideBar';

/* Translation */
import TranslationHandler from './translation/TranslationHandler';

/* Stores */
import RootStore from './stores/RootStore';

const i18next = TranslationHandler.init();
class App extends Component {
  componentDidMount() {
    console.log('mounted');
  }
  render() {
    return (
      <I18nextProvider i18n={i18next}>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <SideBar />
          {RootStore.commonStore.getIsUser ? 'is user' : 'is verifier'}
          {' '}
          To get started, edit <code>src/App.js</code> and save to reload.
        </div>
      </I18nextProvider>
    );
  }
}

export default App;
