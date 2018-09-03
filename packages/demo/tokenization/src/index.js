import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route, BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import App from './pages/App';
import store from './Store';
import './index.css';
import TranslationHandler from './translations';

const i18next = TranslationHandler.init();

// Using BrowserRouter instead of HashRouter for hashed routing because
// HashRouter doesn't support state.
// See https://github.com/ReactTraining/history/issues/435
ReactDOM.render(
  <I18nextProvider i18n={i18next}>
    <Provider store={store}>
      <BrowserRouter basename="#">
        <Route component={App} />
      </BrowserRouter>
    </Provider>
  </I18nextProvider>,
  document.getElementById('root'),
);
