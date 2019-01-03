import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import Divider from '@material-ui/core/Divider';
import { withRouter } from 'react-router';
import PageBox from '../components/layout/PageBox';
import { initialState } from '../reducers/network';
import PageTitle from '../components/layout/PageTitle';
import PageContainer from '../components/layout/PageContainer';
import Box from '../components/layout/Box';
import { RouteComponentProps } from 'react-router-dom';
import { COLORS } from '../constants/colors';
import SummaryCard from '../components/common/SummaryCard';
import { Direction } from '../utils/general';

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
  pendingTxMap: typeof initialState.pendingTxMap;
  selectedTx: string;
  direction: Direction;
  value: string;
  goBack(): void;
  next(): void;
  // requestS2E(): void;
  // requestE2S(): void;
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
  componentDidMount() {
    console.log(this.props.pendingTxMap);
    console.log(this.props.selectedTx);
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
    const { classes, selectedTx, direction, pendingTxMap } = this.props;
    const selectedRequest = pendingTxMap[selectedTx];
    console.log(selectedRequest);
    return (
      <PageBox>
        <PageTitle withBackButton={true} backName="Direct" backAction={this.props.goBack}>
          SWAP DETAILS
        </PageTitle>
        <PageContainer>
          <Box>
            <span className={classes.greyTitle}>You Deposit</span>
            <span className={classes.greyTitle}>You Withdraw</span>
            <Divider />
            {direction === Direction.E2S ?
              <>
                <SummaryCard type="eth" value={this.props.value} />
                -->
                <SummaryCard type="stellar" value={this.props.value} />
              </>
              :
              <>
                <SummaryCard type="stellar" value={this.props.value} />
                -->
                <SummaryCard type="eth" value={this.props.value} />
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
                  <span>1. Submitted {evaluate(selectedRequest, 'hash')}</span>
                  <span>2. Network Confirmed {evaluate(selectedRequest, 'indexID')}</span>
                  <span>3. Appoval Submitted {evaluate(selectedRequest, 'aceeptHash')}</span>
                  <span>4 Appoval Confirmed {evaluate(selectedRequest, 'acceptedBy')}</span>
                  <span>5. Converting to Stellar SGDR {evaluate(selectedRequest, 'approved')}</span>
                </>
                :
                <>
                  <span>In Progress</span>
                  <span>1. Submitted</span>
                  <span>2. Network Confirmed</span>
                  <span>3. Awaiting Approval</span>
                  <span>4. Appoval Submitted</span>
                  <span>4. Appoval Confirmed</span>
                </>
              }
            </div>
          </Box>
          {/* <BlueButton handleClick={this.props.goBack}>Back</BlueButton>
          <BlueButton
            handleClick={direction === Direction.E2S ? requestE2S : requestS2E}
          >
            Send Request
          </BlueButton> */}
        </PageContainer>
      </PageBox>
    );
  }
}

export default withStyles(styles)(withRouter(SwapDetailsPage));
