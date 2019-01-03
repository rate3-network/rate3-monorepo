import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import Divider from '@material-ui/core/Divider';
import { withRouter } from 'react-router';
import PageBox from '../components/layout/PageBox';
import PageTitle from '../components/layout/PageTitle';
import PageContainer from '../components/layout/PageContainer';
import Box from '../components/layout/Box';
import { RouteComponentProps } from 'react-router-dom';
import { COLORS } from '../constants/colors';
import SummaryCard from '../components/common/SummaryCard';

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
enum Direction {
  E2S, // eth to stellar
  S2E, // stellar to eth
}
interface IProps {
  direction: Direction;
  value: string;
  goBack(): void;
  next(): void;
  // requestS2E(): void;
  // requestE2S(): void;
}
type IPropsFinal = WithStyles<typeof styles> & RouteComponentProps<{ role: string }> & IProps;
class SwapDetailsPage extends React.Component<IPropsFinal> {
  // state: IState;
  constructor(props: any) {
    super(props);
    this.state = {
    };
  }
  componentDidMount() {
    // console.log(this.props.history.location);
  }

  renderEthCard = () => {
    const { classes } = this.props;
    return (
      <div>
        {/* <span>You {this.state.direction === Direction.E2S ? 'Deposit' : 'Withdraw'}</span> */}
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
        {/* <span>You  {this.state.direction === Direction.E2S ? 'Withdraw' : 'Deposit'}</span> */}
        <span>Enter Amount</span>
        <span>0.00000 SGDR</span>
        <span>Stellar Blackchain</span>
      </div>
    );
  }

  render() {
    console.log('swap page rendered');
    const { classes, value, direction } = this.props;
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
