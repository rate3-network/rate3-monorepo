import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as actions from '../actions/counter';
import { IStoreState } from '../reducers/counter';
import { createStyles } from '@material-ui/core/styles';
import { Button, AppBar, Toolbar } from '@material-ui/core';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { withRouter } from 'react-router';
import { Link, RouteComponentProps } from 'react-router-dom';

import BlueButton from '../components/common/BlueButton';
import { ONBOARDING } from '../constants/colors';
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
  mainContainer: {
    width: '100vw',
    height: '70vh',
    minHeight: '70vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingSlideContainer: {
    width: '65%',
    height: '65%',
    background: ONBOARDING.background,
    borderRadius: 10,
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    textDecoration: 'none',
  },
});
// interface IProps extends WithStyles<typeof styles> {

// }
type IProps = WithStyles<typeof styles> & RouteComponentProps<{ pageNumber: string }>;
class OnboardingPage extends React.PureComponent<IProps> {
  // componentDidMount() {
  // }

  render() {
    const { classes, match } = this.props;
    const { pageNumber } = match.params;
    const page = parseInt(pageNumber, 10);
    console.log((page > 0 && page < 5));
    return (
      <div className={classes.page}>
        <AppBar className={classes.appBar} position="static" color="default">
          <Toolbar>
            Rate3
          </Toolbar>
        </AppBar>
        <div className={classes.mainContainer}>
          <div className={classes.onboardingSlideContainer}>
            Token Swap Demo page {pageNumber}
          </div>
        </div>
        <div className={classes.buttonGroup}>
          {page === 0 &&
            <Link className={classes.link} to={`/onboarding/${page + 1}`}>
              <BlueButton noCap>Take a Tour</BlueButton>
            </Link>
          }
          {(page > 0 && page < 5) &&
            <>
              <Link className={classes.link} to={`/onboarding/${page - 1}`}>
                <BlueButton noCap outlined>Back</BlueButton>
              </Link>
              <Link className={classes.link} to={`/onboarding/${page + 1}`}>
                <BlueButton noCap>Next</BlueButton>
              </Link>
            </>
          }
          {(page === 5) &&
            <>
              <Link className={classes.link} to={`/onboarding/${page - 1}`}>
                <BlueButton noCap outlined>Back</BlueButton>
              </Link>
              <Link className={classes.link} to="/user/home">
                <BlueButton noCap>Start Demo</BlueButton>
              </Link>
            </>
          }

        </div>
      </div>
    );
  }
}

export default withStyles(styles)(withRouter(OnboardingPage));
