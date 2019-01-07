import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import * as actions from '../actions/issuer';
import lineSvg from '../assets/line.svg';
import BlueButton from '../components/common/BlueButton';
import SwapInfoBox from '../components/common/SwapInfoBox';
import Box from '../components/layout/Box';
import PageBox from '../components/layout/PageBox';
import PageContainer from '../components/layout/PageContainer';
import PageTitle from '../components/layout/PageTitle';
import { COLORS } from '../constants/colors';
import { CONVERSION_CONTRACT_ADDR, ETH_USER, STELLAR_USER } from '../constants/defaults';
import { IE2SRequest, IS2ERequest } from '../reducers/issuer';
import { Direction, IAction, truncateAddress } from '../utils/general';
import day from 'dayjs';

const FORMAT = 'DD-MM-YYYY H:mm';
const styles = createStyles({
  row: {
    marginTop: '2em',
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  backButton: {
    textAlign: 'start',
    fontSize: '1rem',
  },
  summaryBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBox: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: COLORS.black,
    padding: '1.5em 0 0 0',
    fontWeight: 300,
    fontSize: '1em',
  },
  cardText: {
    color: COLORS.black,
    padding: '1em 0',
    fontWeight: 500,
    fontSize: '1.2em',
  },
  img: {
    padding: '1em 0',
  },
  gap: {
    padding: '0 1em',
  },
  btnRow: {
    padding: '4em 0',
    display: 'flex',
    width: '40%',
    justifyContent: 'space-around',
  },
  col: {
    width: '45%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
});

interface IProps {
  currentApproval: null | (IE2SRequest & IS2ERequest);
  goBack(): void;
  next(): void;
  approve(tx: IE2SRequest | IS2ERequest): void;
}
type IPropsFinal = WithStyles<typeof styles> & RouteComponentProps<{ role: string }> & IProps;
class SwapApprovalPage extends React.Component<IPropsFinal> {
  // state: IState;
  constructor(props: any) {
    super(props);
    this.state = {
    };
  }
  componentDidMount() {
    console.log(this.props.currentApproval);
  }

  render() {
    console.log('swap page rendered');
    const { classes, currentApproval } = this.props;

    const value = currentApproval ? currentApproval.amount : '0';
    const direction = currentApproval &&
      (currentApproval.type === 'E2S' ? Direction.E2S : Direction.S2E);
    const stellarTime = currentApproval && (currentApproval.created_at &&
      day(currentApproval.created_at).format(FORMAT));
    const ethTime = currentApproval && (currentApproval.requestTimestamp
      && day.unix(parseInt(currentApproval.requestTimestamp, 10)).format(FORMAT));
    return (
      <PageBox>
        <PageTitle withBackButton={true} backName="HOME" backAction={this.props.goBack}>
          SWAP APPROVAL
        </PageTitle>
        <PageContainer>
          <SwapInfoBox forApproval value={value} direction={direction} />

          <div className={classes.row}>
            <Box>
              <div className={classes.detailBox}>
                <div className={classes.col}>
                  <span className={classes.cardTitle}>Transaction Hash</span>
                  <span className={classes.cardText}>
                    {currentApproval && truncateAddress(currentApproval.hash)}
                  </span>
                </div>
                <span>
                  <svg
                    width="3"
                    height="33"
                    viewBox="0 0 3 33"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.76953 31.7148L1.76953 1.44588"
                      stroke="#203542"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <div className={classes.col}>
                  <span className={classes.cardTitle}>Date/Time of Request</span>
                  <span className={classes.cardText}>{stellarTime || ethTime}</span>
                </div>
              </div>
            </Box>
          </div>
          <div className={classes.row}>
            <Box>
              <div className={classes.summaryBox}>
                <span className={classes.cardTitle}>User Ethereum Address</span>
                <span className={classes.cardText}>{truncateAddress(ETH_USER)}</span>
                <img className={classes.img} src={lineSvg} alt="line"/>
                <span className={classes.cardTitle}>User Stellar Address</span>
                <span className={classes.cardText}>{truncateAddress(STELLAR_USER)}</span>
              </div>
            </Box>
            <div className={classes.gap} />
            <Box>
              <div className={classes.summaryBox}>
                <span className={classes.cardTitle}>Ethereum Transaction Fee</span>
                <span className={classes.cardText}>0.0051 ETH</span>
                <img className={classes.img} src={lineSvg} alt="line"/>
                <span className={classes.cardTitle}>Stellar Transaction Fee</span>
                <span className={classes.cardText}>0.00001 XLM</span>
              </div>
            </Box>
          </div>
          <div className={classes.btnRow}>
            <BlueButton
              outlinedDarkBlue
              noCap
              width="10em"
              fontSize="1.1em"
              height="2.2em"
              handleClick={this.props.goBack}
            >
              Back
            </BlueButton>
            <div className={classes.gap} />
            <BlueButton
              darkBlue
              noCap
              width="10em"
              fontSize="1.1em"
              height="2.2em"
              handleClick={() => {
                if (!currentApproval) {
                  console.error('cannot approve empty tx');
                } else {
                  this.props.approve(currentApproval);
                  this.props.next();
                }
              }}
            >
              Approve
            </BlueButton>
          </div>
        </PageContainer>
      </PageBox>
    );
  }
}
export function mapDispatchToProps(dispatch: Dispatch<IAction>) {
  return {
    approve: (currentApproval: IE2SRequest | IS2ERequest) =>
      dispatch(actions.approve(currentApproval)),
  };
}
// export default withStyles(styles)(withRouter(SwapApprovalPage));
export default connect(
  null, mapDispatchToProps)(withStyles(styles)(SwapApprovalPage));
