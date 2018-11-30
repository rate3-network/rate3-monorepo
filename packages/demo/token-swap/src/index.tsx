import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import { Provider } from 'react-redux';
import Main from './Main';
import Counter from './components/Counter';
import OnboardingPage from './pages/OnboardingPage';
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
  { path: '/onboarding/:pageNumber', component: OnboardingPage },
];
ReactDOM.render(
  <Provider store={store}>
    <HashRouter basename="/" >
      <Switch>
        <Route
          exact
          path="/"
          render={() => <Redirect to="/home" />}
        />
        <Route
          exact
          path="/onboarding"
          render={() => <Redirect to="/onboarding/1" />}
        />
        {routes.map((route) => {
          return (
            <Route
              key={route.path}
              exact
              path={route.path}
              component={route.component}
            />
          );
        })}
      </Switch>
      {/* <Main /> */}
    </HashRouter>
  </Provider>,
  document.getElementById('root') as HTMLElement
);

// if (module.hot) {
//   module.hot.accept('./App', () => {
//     ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
//   });
// }
// console.log(module);
// registerServiceWorker();
