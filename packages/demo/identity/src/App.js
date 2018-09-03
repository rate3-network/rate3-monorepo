import { I18nextProvider } from 'react-i18next';
import React, { Component } from 'react';
import { Provider, observer } from 'mobx-react';

import logo from './logo.svg';
import './App.css';

import Onboard from './pages/Onboard';
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
        <Onboard />
      </I18nextProvider>
    );
  }
}

export default App;
