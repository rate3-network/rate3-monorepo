import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import AppContainer from './AppContainer';
import './index.css';
import { store } from './store';
// import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <Provider store={store}>
    <AppContainer />
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
