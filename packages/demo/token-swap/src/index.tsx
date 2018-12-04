import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import { Provider } from 'react-redux';
import Main from './Main';
import Counter from './components/Counter';
import Sidebar from './components/Sidebar';
import { Hidden } from '@material-ui/core';
// import OnboardingPage from './pages/OnboardingPage';
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage'));
import HomePage from './pages/HomePage';
import DirectSwapPage from './pages/DirectSwapPage';
// import AppContainer from './AppContainer';
import { store } from './store';
// import registerServiceWorker from './registerServiceWorker';
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';

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

class RoutesResponsive extends React.Component {
  public componentDidMount() {
    (window as any).__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true;
  }
  public render() {
    return (
      <Switch><React.Fragment>
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
      </React.Fragment></Switch>
    );
  }
}

ReactDOM.render(
  <Provider store={store}>
    <HashRouter basename="/" >
      <React.Fragment>
        {routes.map(route =>
          <Route exact key={route.path} path={route.path} component={Sidebar} />)
        }
        <RoutesResponsive />
      </React.Fragment>
    </HashRouter>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
