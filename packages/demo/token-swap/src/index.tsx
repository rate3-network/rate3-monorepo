import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import { Provider } from 'react-redux';
import Main from './Main';
import Counter from './components/Counter';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { store } from './store';

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
});

class Wrapper extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <MuiThemeProvider theme={theme}>
          {/* <Counter id={1} /> */}
          <Main />
        </MuiThemeProvider>
      </Provider>
    );
  }
}

ReactDOM.render(
  <Wrapper /> ,
  document.getElementById('root') as HTMLElement
);
