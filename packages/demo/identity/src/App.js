import { I18nextProvider } from 'react-i18next';
import React from 'react';
import { Provider, observer } from 'mobx-react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import logo from './logo.svg';
import './App.css';

import Onboard from './pages/Onboard';
import Home from './pages/Home';
/* Translation */
import TranslationHandler from './translation/TranslationHandler';

/* Stores */
import RootStore from './stores/RootStore';

import { identityBlue, identityBlueLight, identityBlueDark } from './constants/colors';

const i18next = TranslationHandler.init();

const theme = createMuiTheme({
  palette: {
    primary: {
      light: identityBlue,
      main: identityBlue,
      dark: identityBlue,
    },
  },
});
const stores = {
  RootStore,
};
@observer
class App extends React.Component {
  componentDidMount() {
    console.log('mounted');
  }
  render() {
    return (
      <I18nextProvider i18n={i18next}>
        <Provider {...stores}>
          <MuiThemeProvider theme={theme}>
            <BrowserRouter basename="/#/">
              <Switch>
                <Route
                  exact
                  path="/"
                  render={() => {
                    return !RootStore.commonStore.getIsOnboardDone()
                    ? <Redirect to="/onboard" />
                    : <Home />;
                  }}
                />
                <Route exact path="/onboard" component={Onboard} />
              </Switch>
            </BrowserRouter>
          </MuiThemeProvider>
        </Provider>
      </I18nextProvider>
    );
  }
}

export default App;