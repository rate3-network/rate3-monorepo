import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import Divider from '@material-ui/core/Divider';
import { IE2SRequest, IS2ERequest } from '../../reducers/issuer';
import { withRouter } from 'react-router';
import PageBox from '../../components/layout/PageBox';
import { initialState } from '../../reducers/network';
import PageTitle from '../../components/layout/PageTitle';
import PageContainer from '../../components/layout/PageContainer';
import Box from '../../components/layout/Box';
import { RouteComponentProps } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import SummaryCard from '../../components/common/SummaryCard';
import { Direction } from '../../utils/general';

const styles = createStyles({
  row: {
    marginTop: '2em',
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  col: {
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
});

interface IProps {
  tx: any;
  userSetValue: string;
  direction: Direction;
}
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
    let transaction = {};
    if (!tx) {
      // amount = userSetValue;
      transaction = {};
    } else {
      // amount = tx.amount;
      transaction = tx;
    }
    return (
      <PageContainer>
        <Box>
          <span className={classes.greyTitle}>You Deposit</span>
          <span className={classes.greyTitle}>You Withdraw</span>
          <Divider />
          {direction === Direction.E2S ?
            <>
              <SummaryCard type="eth" value={amount} />
              -->
              <SummaryCard type="stellar" value={amount} />
            </>
            :
            <>
              <SummaryCard type="stellar" value={amount} />
              -->
              <SummaryCard type="eth" value={amount} />
            </>
          }
        </Box>
        <div className={classes.row}>
          <Box>
            <div className={classes.summaryBox}>
              <span>Issuer Identity</span>
              <span>Rate3</span>
              <span>Smart Contract Address</span>
              <span>0x1234...123d</span>
            </div>
          </Box>
          <Box>
            <div className={classes.summaryBox}>
              <span>Ethereum Transaction Fee</span>
              <span>0.001 ETH</span>
              <span>----</span>
              <span>Stellar Transaction Fee</span>
              <span>0.001 XLM</span>
            </div>
          </Box>
        </div>
        <Box>
          <div className={classes.col}>
            {
              direction === Direction.E2S ?
              <>
                <span>In Progress</span>
                <span>1. Submitted {evaluate(transaction, 'hash')}</span>
                <span>2. Network Confirmed {evaluate(transaction, 'indexID')}</span>
                <span>3. Appoval Submitted {evaluate(transaction, 'aceeptHash')}</span>
                <span>4 Appoval Confirmed {evaluate(transaction, 'acceptedBy')}</span>
                <span>5. Converting to Stellar SGDR {evaluate(transaction, 'approved')}</span>
              </>
              :
              <>
                <span>In Progress</span>
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
