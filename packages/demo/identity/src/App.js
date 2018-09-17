import { I18nextProvider } from 'react-i18next';
import React from 'react';
import { Provider, observer, autorun } from 'mobx-react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Web3 from 'web3';
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
    // const web3 = new Web3(Web3.givenProvider);
    // web3.eth.net.getNetworkType((err, network) => {
    //   RootStore.commonStore.setCurrentNetwork(network);
    //   console.log(RootStore.commonStore.getCurrentNetwork());
    // });
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
              <BrowserRouter basename="#">
                <Switch>
                  <Route
                    path="/"
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
              </BrowserRouter>
            </MuiThemeProvider>
          </Provider>
        </I18nextProvider>
      </div>
    );
  }
}

export default withStyles(styles)(App);
