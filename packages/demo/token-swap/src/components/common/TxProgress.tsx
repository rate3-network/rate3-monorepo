import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { withRouter } from 'react-router';
import PageContainer from '../../components/layout/PageContainer';
import Box from '../../components/layout/Box';
import { RouteComponentProps } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import { Direction, truncateAddress } from '../../utils/general';
import SwapInfoBox from '../../components/common/SwapInfoBox';
import lineSvg from '../../assets/line.svg';
import day from 'dayjs';
import ProgressBar from './ProgressBar';

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
  listContainer: {
    color: COLORS.black,
    fontWeight: 200,
    fontSize: '1em',
    letterSpacing: '0.02em',
    margin: '2em 0',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: COLORS.veryLightBlue,
  },
  even: {
    padding: '0.2em 1.5em',
    backgroundColor: COLORS.veryLightBlue,
  },
  odd: {
    padding: '0.2em 1.5em',
    backgroundColor: COLORS.lightBlue,
  },
});

const FORMAT = 'DD-MM-YYYY H:mm';
interface IProps {
  tx: any;
  userSetValue: string;
  direction: Direction;
}
const evaluateToBool = (stuff: any, field: string) => {
  if (!stuff) return false;
  try {
    return !!stuff[field];
  } catch (err) {
    return false;
  }
};
const evaluate = (stuff: any, field: string) => {
  if (!stuff) return '❌';

  try {
    return !!stuff[field] ? '✔️' : '❌';
  } catch (err) {
    return '❌';
  }
};
type IPropsFinal = WithStyles<typeof styles> & RouteComponentProps<{ role: string }> & IProps;
class SwapDetailsPage extends React.Component<IPropsFinal> {
  // state: IState;
  constructor(props: any) {
    super(props);
    this.state = {
      progress: 0,
    };
  }

  renderEthCard = () => {
    const { classes } = this.props;
    return (
      <div>
        <span>Enter Amount</span>
        <span>0.00000 SGDR</span>
        <span>Ethereum Blackchain</span>
      </div>
    );
  }
  renderStellarCard = () => {
    const { classes } = this.props;
    return (
      <div>
        <span>Enter Amount</span>
        <span>0.00000 SGDR</span>
        <span>Stellar Blackchain</span>
      </div>
    );
  }

  render() {
    const { classes, tx, direction, userSetValue } = this.props;
    const amount = userSetValue;
    const transaction = tx ? tx : {};
    const stellarTime = transaction.created_at && day(transaction.created_at).format(FORMAT);
    const ethTime = transaction.requestTimestamp
      && day.unix(transaction.requestTimestamp).format(FORMAT);

    const calProgress = (tran, ...fields) => {
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
                <span className={classes.cardTitle}>Transaction Hash</span>
                <span className={classes.cardText}>
                  {transaction.hash && truncateAddress(transaction.hash, 20)}
                </span>
                <img className={classes.img} src={lineSvg} alt="line"/>
                <span className={classes.cardTitle}>Date/Time of Request</span>
                <span className={classes.cardText}>
                  {stellarTime || ethTime}
                </span>
              </div>
            </Box>
            <div className={classes.gap} />
            <Box>
              <div className={classes.summaryBox}>
                <span className={classes.cardTitle}>User Ethereum Address</span>
                <span className={classes.cardText}>0.0051 ETH</span>
                <img className={classes.img} src={lineSvg} alt="line"/>
                <span className={classes.cardTitle}>User Stellar Address</span>
                <span className={classes.cardText}>0.00001 XLM</span>
              </div>
            </Box>
          </div>
        <Box>
          <div className={classes.col}>
            {
              direction === Direction.E2S ?
              <>
                <span className={classes.inProgress}>In Progress</span>
                <ProgressBar
                  progress={
                    calProgress(
                      transaction,
                      'hash',
                      'indexID',
                      'aceeptHash',
                      'acceptedBy',
                      'approved'
                    )}
                />
                {/* <span>{getCurrentAction(
                      transaction,
                      'hash',
                      'indexID',
                      'aceeptHash',
                      'acceptedBy',
                      'approved'
                    )}</span> */}
                <div className={classes.listContainer}>
                  <span className={classes.odd}>
                    1. Submitted {evaluate(transaction, 'hash')}
                  </span>
                  <span className={classes.even}>
                    2. Network Confirmed {evaluate(transaction, 'indexID')}
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
                <span>In Progress</span>
                <ProgressBar
                  progress={
                    calProgress(
                      transaction,
                      'hash',
                      'unlockHash',
                      'approved'
                    )}
                />
                {/* <span>{getCurrentAction(
                      transaction,
                      'hash',
                      'unlockHash',
                      'approved'
                    )}</span> */}
                <span>1. Submitted on Stellar Network {evaluate(transaction, 'hash')}</span>
                <span>2. Appoval Submitted {evaluate(transaction, 'unlockHash')}</span>
                <span>3. Appoval Confirmed {evaluate(transaction, 'approved')}</span>
              </>
            }
          </div>
        </Box>
      </PageContainer>
    );
  }
}

export default withStyles(styles)(withRouter(SwapDetailsPage));
