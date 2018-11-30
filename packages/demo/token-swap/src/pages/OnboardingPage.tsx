import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as actions from '../actions/counter';
import { IStoreState } from '../reducers/counter';
import { createStyles } from '@material-ui/core/styles';
import { Button, AppBar, Toolbar, Typography } from '@material-ui/core';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { withRouter } from 'react-router';
import { HashRouter, Switch, Route, Redirect, RouteComponentProps } from 'react-router-dom';
// export interface IProps {
//   classes: any;
// }

const styles = createStyles({
  page: {
    backgroundColor: 'white',
    height: '100vh',
  },
  appBar: {
    fontFamily: 'din-2014, sans-serif',
    fontSize: '2em',
  },
});
// interface IProps extends WithStyles<typeof styles> {

// }
type IProps = WithStyles<typeof styles> & RouteComponentProps<{ pageNumber: string }>;
class OnboardingPage extends React.PureComponent<IProps> {
  public componentDidMount() {
    console.log(this.props.match.params);
  }
  public render() {
    const { classes, match } = this.props;
    const { pageNumber } = match.params;
    return (
      <div className={classes.page}>

        <AppBar className={classes.appBar} position="static" color="default">
          <Toolbar>
            {/* <Typography variant="h6" color="inherit"> */}
              Rate3 page {pageNumber}
            {/* </Typography> */}
          </Toolbar>
        </AppBar>
      </div>
    );
  }

}
// export interface IStates {
//   counter: IStoreState;
// }

export default withStyles(styles)(withRouter(OnboardingPage));
