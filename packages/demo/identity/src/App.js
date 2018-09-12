import { I18nextProvider } from 'react-i18next';
import React from 'react';
import { Provider, observer } from 'mobx-react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

import './App.css';

import Onboard from './pages/Onboard';
import Home from './pages/Home';
/* Translation */
import TranslationHandler from './translation/TranslationHandler';

/* Stores */
import RootStore from './stores/RootStore';

import { identityBlue, homeTextGreyUser, homeTextGreyVerifier } from './constants/colors';

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

@observer
class App extends React.Component {
  componentDidMount() {
    // if (!window.localStorage.isUser) {
    //   RootStore.commonStore.changeToUser();
    // }
    // console.log('isUser');
    // console.log(window.localStorage.isUser);
    // if (window.localStorage.isUser.toString() === true.toString()) {
    //   console.log('fire at true');
    //   RootStore.commonStore.changeToUser();
    // } 
    // if (window.localStorage.isUser.toString() === false.toString()) {
    //   console.log('fire at false');
    //   RootStore.commonStore.changeToVerifier();
    // }
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
      </div>
    );
  }
}

export default withStyles(styles)(App);
