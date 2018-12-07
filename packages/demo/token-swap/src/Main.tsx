
import * as React from 'react';
import { withRouter } from 'react-router';
import { Hidden } from '@material-ui/core';
import { ROLES } from './constants/general';
import { HashRouter, Switch, Route, Redirect, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Counter from './components/Counter';
import Sidebar from './components/Sidebar';
import RoleContext from './components/common/RoleContext';
import * as actions from 'src/actions/network';
import { IStoreState } from 'src/reducers/network';
import { IAction } from 'src/utils/general';

import NotFound from './pages/NotFound';
import HomePage from './pages/HomePage';
import DirectSwapPage from './pages/DirectSwapPage';
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage'));

interface IRoute {
  path: string;
  component: React.ComponentType;
}
const routes: IRoute[] = [
  { path: '/counter', component: Counter },
  { path: '/user/home', component: HomePage },
  { path: '/issuer/home', component: HomePage },
  { path: '/user/direct-swap', component: DirectSwapPage },
  { path: '/home', component: HomePage },
  { path: '/direct-swap', component: DirectSwapPage },
];

type IProps = IStoreState;
interface IPropsFinal extends IProps {
  initUser: () => void;
  initIssuer: () => void;
}
const OnboardingSuspended = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}><OnboardingPage /></React.Suspense>
  );
};
class Main extends React.Component<IPropsFinal> {
  setThemeBound: () => void;
  state: IState;
  setTheme;
  constructor(props) {
    super(props);
    this.setTheme = (value: ROLES): void => {
      this.setState({
        theme: value,
      });
    };
    this.setThemeBound = this.setTheme.bind(this);
    this.state = {
      theme: sessionStorage.getItem('role') === 'issuer' ? ROLES.ISSUER : ROLES.USER,
      setTheme: this.setThemeBound,
    };
  }
  componentDidMount() {
    if (sessionStorage.getItem('role') === 'issuer') {
      this.props.initIssuer();
    } else {
      this.props.initUser();
    }
  }
  render() {
    const Routes = () => {
      return (
        <Switch>
          <Route exact path="/" render={() => <Redirect to="/onboarding/1" />} />
          <Route exact path="/home" render={() => <Redirect to="/user/home" />} />
          <Route exact path="/onboarding" render={() => <Redirect to="/onboarding/1" />} />
          {routes.map(route =>
            <Route exact key={route.path} path={route.path} component={route.component} />
          )}
          <Route component={NotFound} />
        </Switch>
      );
    };
    return (
      <HashRouter basename="/">
        <RoleContext.Provider value={this.state} >
            <Sidebar />
            <Hidden mdUp>
              <div style={{ width: '100vw', marginLeft: 0 }}>
                <Routes />
                <Route exact path="/onboarding/:pageNumber" component={OnboardingSuspended} />
              </div>
            </Hidden>

            <Hidden smDown>
              <div style={{ width: '75vw', marginLeft: '25vw' }}>
                <Routes />
              </div>
              <div style={{ width: '100vw', marginLeft: 0 }}>
                <Route exact path="/onboarding/:pageNumber" component={OnboardingSuspended} />
              </div>
            </Hidden>
          </RoleContext.Provider>
        </HashRouter>
    );
  }
}
interface IState  {
  theme: ROLES;
  setTheme: () => void;
}

export function mapStateToProps({ network }: { network: IStoreState; }) {
  return {
    contract: network.contract,
    web3Obj: network.web3Obj,
  };
}
export function mapDispatchToProps(dispatch: Dispatch<IAction>) {
  return {
    initUser: () => dispatch(actions.initUser()),
    initIssuer: () => dispatch(actions.initIssuer()),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(Main);
