import { I18nextProvider } from 'react-i18next';
import React from 'react';
import { Provider, observer, autorun } from 'mobx-react';
import { BrowserRouter, HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import './App.css';

import Onboard from './pages/Onboard';
import Home from './pages/Home';

import GlobalSpinner from './components/GlobalSpinner';
/* Translation */
import TranslationHandler from './translation/TranslationHandler';

/* Stores */
import RootStore from './stores/RootStore';

import { identityBlue, homeTextGreyUser, homeTextGreyVerifier } from './constants/colors';
import { userPrivKey, verifierPrivKey } from './constants/defaults';

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

const styles = themes => ({
  userRootStyle: {
    fontFamily: 'Roboto',
    overflow: 'hidden',
    color: homeTextGreyUser,
    height: '100vh',
  },
  verifierRootStyle: {
    fontFamily: 'Roboto',
    overflow: 'hidden',
    color: homeTextGreyVerifier,
    height: '100vh',
  },
});

const stores = {
  RootStore,
};
const history = createBrowserHistory();

@observer
class App extends React.Component {
  constructor(props) {
    super(props);
    if (window.localStorage.isUserOnboardDone === true.toString()) {
      RootStore.commonStore.finishUserOnboard();
    }
    if (window.localStorage.isVerifierOnboardDone === true.toString()) {
      RootStore.commonStore.finishVerifierOnboard();
    }
    if (localStorage.isUser === true.toString()) {
      RootStore.commonStore.changeToUser();
    }
    if (localStorage.isUser === false.toString()) {
      RootStore.commonStore.changeToVerifier();
    }
  }
  componentDidMount() {
    // RootStore.initNetwork();
    
    
  }
  render() {
    const { classes } = this.props;
    return (
      <div className={classNames(
        { [classes.userRootStyle]: RootStore.commonStore.getIsUser() },
        { [classes.verifierRootStyle]: !RootStore.commonStore.getIsUser() },
      )}
      >
        <I18nextProvider i18n={i18next}>
          <Provider {...stores}>
            <MuiThemeProvider theme={theme}>
              <GlobalSpinner />
              <HashRouter basename="/" >
                <Switch>
                  <Route
                    exact
                    render={() => {
                      if (RootStore.commonStore.getIsUser() && RootStore.commonStore.getIsUserOnboardDone()) {
                        return <Home />;
                      }
                      if (!RootStore.commonStore.getIsUser() && RootStore.commonStore.getIsVerifierOnboardDone()) {
                        return <Home />;
                      }
                      return <Onboard />;
                    }}
                  />
                </Switch>
              </HashRouter>
            </MuiThemeProvider>
          </Provider>
        </I18nextProvider>
      </div>
    );
  }
}

export default withStyles(styles)(App);
