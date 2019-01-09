import { AppBar, Toolbar } from '@material-ui/core';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import * as React from 'react';
import { withRouter } from 'react-router';
import { Link, RouteComponentProps } from 'react-router-dom';
import BlueButton from '../components/common/BlueButton';
import { ONBOARDING, SIDEBAR } from '../constants/colors';
import userLogo from '../assets/user_rate3_logo.svg';
import { ONBOARDING_TEXTS } from '../constants/defaults';
import coin from '../assets/coin_fly.svg';
import imgLeft from '../assets/img_left.svg';
import imgRight from '../assets/img_right.svg';
import p2p1 from '../assets/p2p.svg';
import p2p2 from '../assets/p2p_2.svg';
import direct1 from '../assets/direct_1.svg';
import direct2 from '../assets/direct_2.svg';
// export interface IProps {
//   classes: any;
// }
const imgArray = [coin, imgLeft, p2p1, p2p2, direct1, direct2];
const styles = createStyles({
  page: {
    backgroundColor: 'white',
    height: '100vh',
  },
  appBar: {
    fontFamily: 'din-2014, sans-serif',
    fontSize: '2em',
    backgroundColor: 'white',
  },
  mainContainer: {
    width: '100vw',
    height: '80vh',
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingSlideContainer: {
    width: '65%',
    height: '75%',
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
    margin: '0 2rem',
  },
  subContainer: {
    width: '70%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  swapText: {
    fontSize: '1rem',
    color: SIDEBAR.userTextColor,
  },
  titleLarge: {
    fontSize: '2.5rem',
    fontWeight: 700,
    margin: '2rem 0',
  },
  mainText: {
    fontSize: '1.1rem',
    margin: '2rem 0',
  },
  titleThin: {
    fontSize: '2rem',
    fontWeight: 300,
    margin: '2rem 0',
  },
  titleMedium: {
    fontSize: '2rem',
    fontWeight: 700,
    margin: '2rem 0',
  },
  imgGrp: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
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
            <div className={classes.row}>
              <img src={userLogo} alt="logo"/>
              <span className={classes.swapText}>Token Swap Demo</span>
            </div>
          </Toolbar>
        </AppBar>
        <div className={classes.mainContainer}>
          <div className={classes.onboardingSlideContainer}>
            {page === 0 &&
              <div className={classes.subContainer}>
                <div className={classes.titleLarge}>
                  {ONBOARDING_TEXTS[0].title}
                </div>
                <div className={classes.mainText}>
                  {ONBOARDING_TEXTS[0].text}
                </div>
                <img src={coin} alt="coin"/>
              </div>
            }
            {page === 1 &&
              <div className={classes.subContainer}>
                <div className={classes.titleThin}>
                  {ONBOARDING_TEXTS[1].title}
                </div>
                <div className={classes.imgGrp}>
                  <img src={imgLeft} alt=""/>
                  <img src={imgRight} alt=""/>
                </div>
              </div>
            }
            {page > 1 &&
              <div className={classes.subContainer}>
                <div className={classes.titleMedium}>
                  {ONBOARDING_TEXTS[page].title}
                </div>
                <img src={imgArray[page]} alt=""/>
                <div className={classes.mainText}>
                  {ONBOARDING_TEXTS[page].text}
                </div>
              </div>
            }
          </div>
        </div>
        <div className={classes.buttonGroup}>
          {page === 0 &&
            <Link className={classes.link} to={`/onboarding/${page + 1}`}>
              <BlueButton
                width="10em"
                fontSize="1.1em"
                height="2.2em"
                noCap
              >
                Take a Tour
              </BlueButton>
            </Link>
          }
          {(page > 0 && page < 5) &&
            <>
              <Link className={classes.link} to={`/onboarding/${page - 1}`}>
                <BlueButton
                  width="10em"
                  fontSize="1.1em"
                  height="2.2em"
                  noCap
                  outlined
                >
                  Back
                </BlueButton>
              </Link>
              <Link className={classes.link} to={`/onboarding/${page + 1}`}>
                <BlueButton
                  width="10em"
                  fontSize="1.1em"
                  height="2.2em"
                  noCap
                >
                  Next
                </BlueButton>
              </Link>
            </>
          }
          {(page === 5) &&
            <>
              <Link className={classes.link} to={`/onboarding/${page - 1}`}>
                <BlueButton
                  width="10em"
                  fontSize="1.1em"
                  height="2.2em"
                  noCap
                  outlined
                >
                  Back
                </BlueButton>
              </Link>
              <Link className={classes.link} to="/user/home">
                <BlueButton
                  width="10em"
                  fontSize="1.1em"
                  height="2.2em"
                  noCap
                >
                  Start Demo
                </BlueButton>
              </Link>
            </>
          }

        </div>
      </div>
    );
  }
}

export default withStyles(styles)(withRouter(OnboardingPage));
