import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import Divider from '@material-ui/core/Divider';
import { withRouter } from 'react-router';
import { IStoreState, IE2SRequest, IS2ERequest } from '../reducers/issuer';
import PageBox from '../components/layout/PageBox';
import * as actions from '../actions/issuer';
import { Dispatch } from 'redux';
import { IAction, truncateAddress } from '../utils/general';
import PageTitle from '../components/layout/PageTitle';
import PageContainer from '../components/layout/PageContainer';
import Box from '../components/layout/Box';
import { RouteComponentProps } from 'react-router-dom';
import BlueButton from '../components/common/BlueButton';
import { COLORS } from '../constants/colors';
import { connect } from 'react-redux';

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

interface IProps {
  currentApproval: null | IE2SRequest | IS2ERequest;
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
  ethSummaryCard = () => {
    return (
      <div>
        ETH
        {this.props.currentApproval && this.props.currentApproval.amount}
      </div>
    );
  }
  stellarSummaryCard = () => {
    return(
      <div>
        Stellar
        {this.props.currentApproval && this.props.currentApproval.amount}
      </div>
    );
  }
  render() {
    console.log('swap page rendered');
    const { classes, currentApproval } = this.props;
    return (
      <PageBox>
        <PageTitle withBackButton={true} backName="HOME" backAction={this.props.goBack}>
          SWAP APPROVAL
        </PageTitle>
        <PageContainer>
          <Box>
            <span className={classes.greyTitle}>User Deposit</span>
            <span className={classes.greyTitle}>User Withdraw</span>
            <Divider />
            {currentApproval &&
              currentApproval.type === 'E2S' ?
                <>
                  {this.ethSummaryCard()}
                  ->
                  {this.stellarSummaryCard()}
                </>
              :
                <>
                  {this.stellarSummaryCard()}
                  ->
                  {this.ethSummaryCard()}
                </>
            }
          </Box>
          <div className={classes.row}>
            <Box>
              <div className={classes.summaryBox}>
                <span>Transaction Hash</span>
                <span>{currentApproval && currentApproval.hash}</span>
                <span>Date/Time of Request</span>
                <span>placeholder</span>
              </div>
            </Box>
          </div>
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
          <BlueButton handleClick={this.props.goBack}>Back</BlueButton>
          <BlueButton
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
