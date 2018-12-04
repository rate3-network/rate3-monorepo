import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import { Provider } from 'react-redux';
import Main from './Main';
import Counter from './components/Counter';
import Sidebar from './components/Sidebar';
import { Hidden } from '@material-ui/core';
// import OnboardingPage from './pages/OnboardingPage';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage'));
import HomePage from './pages/HomePage';
import DirectSwapPage from './pages/DirectSwapPage';
import { store } from './store';
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';
import RoleContext from './components/common/RoleContext';
import RoleSwitch from './components/common/RoleSwitch';

interface IRoute {
  path: string;
  component: React.ComponentType;
}
const routes: IRoute[] = [
  { path: '/counter', component: Counter },
  { path: '/main', component: Main },
  { path: '/user', component: Main },
  { path: '/issuer', component: Main },
  { path: '/:role/home', component: HomePage },
  { path: '/:role/direct-swap', component: DirectSwapPage },
  { path: '/home', component: HomePage },
  { path: '/direct-swap', component: DirectSwapPage },
  // { path: '/:role/home', component: HomePage },
];
const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
});
const OnboardingSuspended = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}><OnboardingPage /></React.Suspense>
  );
};
const Routes = () => {
  return (
    <React.Fragment>
      <Route exact path="/" render={() => <Redirect to="/onboarding/1" />} />
      <Route exact path="/home" render={() => <Redirect to="/user/home" />} />
      <Route exact path="/onboarding" render={() => <Redirect to="/onboarding/1" />} />
      {routes.map(route =>
        <Route exact key={route.path} path={route.path} component={route.component} />
      )}
    </React.Fragment>
  );
};
enum ROLES {
  USER,
  ISSUER,
}
interface IState  {
  theme: ROLES;
  setTheme: () => void;
}
class RoutesResponsive extends React.Component {
  setThemeBound: () => void;
  state: IState;
  setTheme;
  constructor(props) {
    super(props);
    this.setTheme = (value: ROLES): void => {
      console.log(value);
      this.setState({
        theme: value,
      });
    };
    this.setThemeBound = this.setTheme.bind(this);
    this.state = {
      theme: ROLES.USER,
      setTheme: this.setThemeBound,
    };
  }

  render() {
    return (
      <>

          {/* {routes.map(route =>
            <Route exact key={route.path} path={route.path} component={Sidebar} />)
          } */}
          <RoleSwitch />
          {/* <RoleContext.Provider value={this.state} > */}
          <Switch><>
              <Hidden mdUp>
                <div style={{ width: '100vw', marginLeft: 0 }}>
                  <Routes />
                  <Route exact path="/onboarding/:pageNumber" component={OnboardingSuspended} />
                </div>
              </Hidden>
              <Hidden smDown>
                <div style={{ width: '80vw', marginLeft: '20vw' }}>
                  <Routes />
                </div>
                <div style={{ width: '100vw', marginLeft: 0 }}>
                  <Route exact path="/onboarding/:pageNumber" component={OnboardingSuspended} />
                </div>
              </Hidden>

          </></Switch>
          {/* </RoleContext.Provider> */}
      </>

    );
  }
}

ReactDOM.render(
  <Provider store={store}>
    <HashRouter basename="/" >
      <MuiThemeProvider theme={theme}>
        <RoutesResponsive />
      </MuiThemeProvider>
    </HashRouter>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
