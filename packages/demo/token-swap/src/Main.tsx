import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { HashRouter, Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Dispatch } from 'redux';

import { Hidden } from '@material-ui/core';

import * as actions from './actions/network';
import RoleContext from './components/common/RoleContext';
import Counter from './components/Counter';
import Sidebar from './components/Sidebar';
import { ROLES } from './constants/general';
import DirectSwapPage from './pages/DirectSwapPage';
import IssuerHomePage from './pages/IssuerHomePage';
import NotFound from './pages/NotFound';
import UserHomePage from './pages/UserHomePage';
import { IStoreState } from './reducers/network';
import { IAction } from './utils/general';
import extrapolateFromXdr from './utils/extrapolateFromXdr';

const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage'));

interface IRoute {
  path: string;
  component: React.ComponentType;
}
const routes: IRoute[] = [
  { path: '/counter', component: Counter },
  { path: '/user/home', component: UserHomePage },
  { path: '/issuer/home', component: IssuerHomePage },
  { path: '/user/direct-swap', component: DirectSwapPage },
  { path: '/direct-swap', component: DirectSwapPage },
];

interface IProps {
  initUser: () => void;
  initIssuer: () => void;
}
const OnboardingSuspended = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}><OnboardingPage /></React.Suspense>
  );
};
class Main extends React.Component<IProps> {
  setRoleBound: () => void;
  state: IState;
  setRole;
  constructor(props) {
    super(props);
    this.setRole = (value: ROLES): void => {
      this.setState({
        theme: value,
      });
    };
    this.setRoleBound = this.setRole.bind(this);
    this.state = {
      theme: sessionStorage.getItem('role') === 'issuer' ? ROLES.ISSUER : ROLES.USER,
      setRole: this.setRoleBound,
    };
  }
  componentDidMount() {
    (window as any).extrapolateFromXdr = extrapolateFromXdr;
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
  setRole: () => void;
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
