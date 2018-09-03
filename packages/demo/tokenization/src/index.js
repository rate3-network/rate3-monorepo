import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route, HashRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import App from './pages/App';
import store from './Store';
import './index.css';
import TranslationHandler from './translations';

const i18next = TranslationHandler.init();

ReactDOM.render(
  <I18nextProvider i18n={i18next}>
    <Provider store={store}>
      <HashRouter>
        <Route component={App} />
      </HashRouter>
    </Provider>
  </I18nextProvider>,
  document.getElementById('root'),
);
