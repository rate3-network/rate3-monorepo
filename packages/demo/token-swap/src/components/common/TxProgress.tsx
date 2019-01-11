import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import day from 'dayjs';
import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import * as networkActions from '../../actions/network';
import greyTickSvg from '../../assets/greyTick.svg';
import lineSvg from '../../assets/line.svg';
import tickSvg from '../../assets/tick.svg';
import SwapInfoBox from '../../components/common/SwapInfoBox';
import Box from '../../components/layout/Box';
import PageContainer from '../../components/layout/PageContainer';
import { COLORS } from '../../constants/colors';
import { ETH_USER, STELLAR_USER } from '../../constants/defaults';
import { ROLES } from '../../constants/general';
import { Direction, IAction, truncateAddress } from '../../utils/general';
import Pop from './Pop';
import ProgressBar from './ProgressBar';
import RoleContext from './RoleContext';

const styles = createStyles({
  row: {
    margin: '2em 0',
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  col: {
    width: '85%',
    display: 'flex',
    flexDirection: 'column',
  },
  backButton: {
    textAlign: 'start',
    fontSize: '1rem',
  },
  greyTitle: {
    color: COLORS.lighGrey,
  },
  summaryBox: {
    display: 'flex',
    flexDirection: 'column',
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
  inProgress: {
    margin: '1em 0',
    fontSize: '1.1em',
    fontWeight: 700,
    color: COLORS.grey,
  },
  warning: {
    margin: '0.5em 0',
    fontSize: '1em',
    fontWeight: 700,
    color: COLORS.grey,
  },
  finished: {
    margin: '1em 0',
    fontSize: '1.1em',
    fontWeight: 700,
    color: COLORS.green,
  },
  listContainer: {
    color: COLORS.black,
    fontWeight: 200,
    borderRadius: '0.5em',
    fontSize: '1em',
    letterSpacing: '0.02em',
    margin: '2em 0',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: COLORS.lightBlue,
  },
  even: {
    padding: '0.5em 1.5em',
    backgroundColor: COLORS.veryLightBlue,
  },
  odd: {
    padding: '0.5em 1.5em',
  },
  timestampRow: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
  },
  timestampCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  link: {
    textDecoration: 'underline',
    color: COLORS.blue,
    whiteSpace: 'pre',
  },
});

const FORMAT = 'DD-MM-YYYY H:mm';
interface IProps {
  tx: any;
  userSetValue: string;
  direction: Direction;
  resetSelectedTx: () => void;
  initUser: () => void;
  initIssuer: () => void;
}
const evaluateToBool = (stuff: any, field: string) => {
  if (!stuff) return false;
  try {
    return !!stuff[field];
  } catch (err) {
    return false;
  }
};
const tick = () => {
  return <img src={tickSvg} alt="tick"/>;
};
const greyTick = () => {
  return <img src={greyTickSvg} alt="disabledTick"/>;
};
const evaluate = (stuff: any, field: string) => {
  if (stuff.fromBlockchain) return tick();

  if (!stuff) return greyTick();

  try {
    return !!stuff[field] ? tick() : greyTick();
  } catch (err) {
    return greyTick();
  }
};
type IPropsFinal = WithStyles<typeof styles> & RouteComponentProps<{ role: string }> & IProps;
class SwapDetailsPage extends React.Component<IPropsFinal> {
  static contextType = RoleContext;
  // state: IState;
  constructor(props: any) {
    super(props);
    this.state = {
      progress: 0,
    };
  }
  switch = () => {
    this.props.resetSelectedTx();
    if (this.context.theme === ROLES.ISSUER) {
      this.props.initUser();
    } else {
      this.props.initIssuer();
    }
    this.context.setRole(ROLES.ISSUER);
    this.props.history.push('/issuer/home');
    sessionStorage.setItem('role', 'issuer');
  }
  render() {
    const { classes, tx, direction, userSetValue } = this.props;
    const amount = userSetValue;
    const transaction = tx ? tx : {};
    const stellarTime = transaction.created_at && day(transaction.created_at).format(FORMAT);
    const ethTime = transaction.requestTimestamp
      && day.unix(transaction.requestTimestamp).format(FORMAT);
    const stellarApprovalTime = transaction.fromBlockchain ?
      (transaction.timestamp
      && day.unix(transaction.timestamp).format(FORMAT))
      : (transaction.stellarTokenMintTimestamp &&
      day(transaction.stellarTokenMintTimestamp).format(FORMAT));
    const ethApprovalTime = transaction.unlockTimestamp
      && day.unix(transaction.unlockTimestamp).format(FORMAT);

    const calProgress = (tran, ...fields) => {
      if (tran.fromBlockchain) return 100;
      const total = fields.length;
      let prog = 0;
      fields.forEach((field) => {
        if (evaluateToBool(tran, field)) {
          prog += 1;
        }
      });
      console.log(prog / total * 100);
      return Math.round(prog / total * 100);
    };

    const ethProgress = calProgress(
      transaction,
      'hash',
      'indexID',
      'aceeptHash',
      'acceptedBy',
      'approved'
    );
    const stellarProgress = calProgress(
      transaction,
      'hash',
      'unlockHash',
      'approved'
    );

    const getCurrentAction = (tran, ...fields) => {
      let currentAction = '';
      fields.forEach((field) => {
        if (!evaluateToBool(tran, field)) {
          return field;
          currentAction = field;
        }
      });
      return currentAction;
    };
    console.log(transaction);
    return (
      <PageContainer>
        <SwapInfoBox value={amount} direction={direction} />
        <div className={classes.row}>
            <Box>
              <div className={classes.summaryBox}>
                {transaction.fromBlockchain ?
                  <>
                    <span className={classes.cardTitle}>Transaction Hash</span>
                    <span className={classes.cardText}>
                      {transaction.type === 'S2E'
                        && <Pop popoverText={transaction.approveHash}>
                            <span>{truncateAddress(transaction.approveHash, 20)}</span>
                          </Pop>}
                      {transaction.type === 'E2S'
                      && <Pop popoverText={transaction.transaction_hash}>
                            <span>{truncateAddress(transaction.transaction_hash, 20)}</span>
                          </Pop>}
                    </span>
                  </>
                :
                  <div className={classes.timestampRow}>
                    <div className={classes.timestampCol}>
                      <span className={classes.cardTitle}>Deposit Hash</span>
                      <span className={classes.cardText}>
                        {transaction.hash ?
                          <Pop popoverText={transaction.hash}>
                            <span>{truncateAddress(transaction.hash, 10)}</span>
                          </Pop>
                        :
                          '-'
                        }
                      </span>
                    </div>
                    <div className={classes.timestampCol}>
                      <span className={classes.cardTitle}>Withdrawal Hash</span>
                        <span className={classes.cardText}>
                          {transaction.withdrawalHash ?
                            <Pop popoverText={transaction.withdrawalHash}>
                              <span>{truncateAddress(transaction.withdrawalHash, 10)}</span>
                            </Pop>
                          :
                            '-'
                          }
                      </span>
                    </div>
                  </div>
                }

                <img className={classes.img} src={lineSvg} alt="line"/>
                <div className={classes.timestampRow}>
                  {!transaction.fromBlockchain &&
                    <>
                      <div className={classes.timestampCol}>
                        <span className={classes.cardTitle}>Date/Time of Request</span>
                        <span className={classes.cardText}>
                          {stellarTime || ethTime}
                        </span>
                      </div>
                      <div className={classes.gap} />
                    </>
                  }
                  <div className={classes.timestampCol}>
                    <span className={classes.cardTitle}>Date/Time of Approval</span>
                    <span className={classes.cardText}>
                      {stellarApprovalTime || ethApprovalTime}
                    </span>
                  </div>
                </div>
              </div>
            </Box>
            <div className={classes.gap} />
            <Box>
              <div className={classes.summaryBox}>
                <span className={classes.cardTitle}>User Ethereum Address</span>
                <span className={classes.cardText}>
                  <Pop isAddress popoverText={ETH_USER}>
                    <span>{truncateAddress(ETH_USER, 20)}</span>
                  </Pop>
                </span>
                <img className={classes.img} src={lineSvg} alt="line"/>
                <span className={classes.cardTitle}>User Stellar Address</span>
                <span className={classes.cardText}>
                  <Pop isAddress popoverText={STELLAR_USER}>
                    <span>{truncateAddress(STELLAR_USER, 20)}</span>
                  </Pop>
                </span>

              </div>
            </Box>
          </div>
        {transaction.error ?
          <Box>
            <div className={classes.col}>
              Error: {transaction.error}
            </div>
          </Box>
        :
          <Box>
            <div className={classes.col}>
              {
                direction === Direction.E2S ?
                <>
                  {ethProgress === 100 ?
                  <span className={classes.finished}>Complete</span>
                  :
                  <span className={classes.inProgress}>In Progress</span>
                  }
                  {ethProgress < 40 &&
                    <span className={classes.warning}>
                      Submitting Your Transaction. Please Do Not Close this Window or Tab .
                    </span>
                  }
                  {ethProgress === 40 &&
                    <span className={classes.warning}>
                      Your Request has been submitted. You can now
                      <span className={classes.link} onClick={this.switch}> switch to Issuer </span>
                      and Approve this Swap.
                    </span>
                  }
                  <ProgressBar progress={ethProgress} />
                  <div className={classes.listContainer}>
                    <span className={classes.odd}>
                      1. Submitted {evaluate(transaction, 'hash')}
                    </span>
                    <span className={classes.even}>
                      2. Network Confirmed {evaluate(transaction, 'indexID')}
                      {ethProgress === 40 &&
                      <>
                      <span className={classes.link} onClick={this.switch}> Switch to Issuer </span>
                      and Approve this Swap.
                      </>
                      }
                    </span>
                    <span className={classes.odd}>
                      3. Appoval Submitted {evaluate(transaction, 'aceeptHash')}
                    </span>
                    <span className={classes.even}>
                      4 Appoval Confirmed {evaluate(transaction, 'acceptedBy')}
                    </span>
                    <span className={classes.odd}>
                      5. Converting to Stellar SGDR {evaluate(transaction, 'approved')}
                    </span>
                  </div>
                </>
                :
                <>
                  {stellarProgress === 100 ?
                    <span className={classes.finished}>Complete</span>
                  :
                    <span className={classes.inProgress}>In Progress</span>
                  }
                  {stellarProgress === 33 &&
                    <span className={classes.warning}>
                      Your Request has been submitted. You can now
                      <span className={classes.link} onClick={this.switch}> switch to Issuer </span>
                      and Approve this Swap.
                    </span>
                  }
                  {stellarProgress === 66 &&
                    <span className={classes.warning}>
                      Submitting Your Transaction. Please Do Not Close this Window or Tab.
                    </span>
                  }
                  <ProgressBar
                    progress={stellarProgress}
                  />
                  <div className={classes.listContainer}>
                    <span className={classes.odd}>
                      1. Submitted on Stellar Network {evaluate(transaction, 'hash')}
                      {stellarProgress === 33 &&
                      <>
                      <span className={classes.link} onClick={this.switch}> switch to Issuer </span>
                      and Approve this Swap.
                      </>
                      }
                    </span>
                    <span className={classes.even}>
                      2. Appoval Submitted {evaluate(transaction, 'unlockHash')}
                    </span>
                    <span className={classes.odd}>
                      3. Appoval Confirmed {evaluate(transaction, 'approved')}
                    </span>
                  </div>
                </>
              }
            </div>
          </Box>
        }
      </PageContainer>
    );
  }
}
export function mapDispatchToProps(dispatch: Dispatch<IAction>) {
  return {
    resetSelectedTx: () => dispatch(networkActions.resetSelectedTx()),
    initUser: () => dispatch(networkActions.initUser()),
    initIssuer: () => dispatch(networkActions.initIssuer()),
  };
}
export default connect(
  null, mapDispatchToProps)(withStyles(styles)(withRouter(SwapDetailsPage)));
