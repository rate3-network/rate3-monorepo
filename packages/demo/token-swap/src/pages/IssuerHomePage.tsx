import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { IStoreState, initialState } from '../reducers/network';
import { Direction } from '../utils/general';

import { IE2SRequest, IS2ERequest } from '../reducers/issuer';
import { RouteComponentProps } from 'react-router-dom';
import PageBox from '../components/layout/PageBox';
import PageTitle from '../components/layout/PageTitle';
import SwapDetailsPage from './SwapDetailsPage';
import PageContainer from '../components/layout/PageContainer';
import Box from '../components/layout/Box';
import AwaitingApprovalList from '../components/issuer/AwaitingApprovalList';
import HistoryList from '../components/issuer/HistoryList';
import { COLORS } from '../constants/colors';
import SwapApprovalPage from './SwapApprovalPage';
// export interface IProps {
//   classes: any;
// }

const styles = createStyles({
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  boxConstraint: {
    width: '40%',
  },
  thinText: {
    color: COLORS.grey,
    fontSize: '1.5rem',
    fontWeight: 100,
    margin: '1rem 0 2rem 0',
  },
  swapNumber: {
    color: COLORS.black,
    fontSize: '3rem',
    fontWeight: 500,
    margin: '1rem 0',
  },
  boxLabel: {
    color: COLORS.grey,
    fontSize: '1.5rem',
    fontWeight: 100,
    alignSelf: 'flex-start',
  },
});
interface IProps {
  pendingTxMap: typeof initialState.pendingTxMap;
  selectedTx: string;
}
interface IState {
  page: number;
  currentApproval: null | IE2SRequest | IS2ERequest;
}
type IPropsFinal = IProps & WithStyles<typeof styles> & RouteComponentProps;
class IssuerHomePage extends React.Component<IPropsFinal> {
  state: IState;
  constructor(props: any) {
    super(props);
    this.goBack = this.goBack.bind(this);
    this.next = this.next.bind(this);
    this.state = {
      page: 1,
      currentApproval: null,
    };
  }
  componentDidMount() {
    // console.log(this.props.history.location);
  }
  setCurrentApproval = (value) => {
    this.setState({
      currentApproval: value,
    });
  }
  goBack = () => {
    this.setState({
      page: this.state.page - 1 < 0 ? 0 : this.state.page - 1,
    });
  }
  next = () => {
    this.setState({
      page: this.state.page + 1 > 3 ? 3 : this.state.page + 1,
    });
  }
  render() {
    console.log('home page rendered');
    const { classes } = this.props;
    let amount = '';
    let direction = Direction.S2E;
    if (this.state.currentApproval) {
      amount = this.state.currentApproval.amount;
      if ('indexID' in this.state.currentApproval) {
        direction = Direction.E2S;
      }
    }
    return (
      <>
        {this.state.page === 1 &&
          <PageBox>
            <PageTitle>
              HOME
            </PageTitle>
            <PageContainer>
              <span className={classes.boxLabel}>Overview</span>
              <div className={classes.row}>
                <div className={classes.boxConstraint}>
                  <Box fullHeight>
                    <div className={classes.swapNumber}>
                      5
                    </div>
                    <div className={classes.thinText}>
                      Swaps today
                    </div>
                  </Box>
                </div>
                <div className={classes.boxConstraint}>
                  <Box fullHeight>
                    <div className={classes.thinText}>
                      Demo Exploration
                    </div>
                  </Box>
                </div>
              </div>
              <span className={classes.boxLabel}>Approval Needed</span>
              <Box>
                <AwaitingApprovalList
                  next={this.next}
                  goBack={this.goBack}
                  setCurrentApproval={this.setCurrentApproval}
                />
              </Box>
              <span className={classes.boxLabel}>In Progress</span>
              <Box>
                table
              </Box>
              <span className={classes.boxLabel}>History</span>
              <Box>
                <HistoryList
                  next={this.next}
                  goBack={this.goBack}
                />
              </Box>
            </PageContainer>
          </PageBox>
        }
        {this.state.page === 2 &&
        <SwapApprovalPage
          currentApproval={this.state.currentApproval}
          next={this.next}
          goBack={this.goBack}
        />}
        {this.state.page === 3 &&
        <SwapDetailsPage
          value={amount}
          direction={direction}
          goBack={this.goBack}
          next={this.next}
          pendingTxMap={this.props.pendingTxMap}
          selectedTx={this.props.selectedTx}
        />}
      </>
    );
  }
}
export function mapStateToProps({ network }: { network: IStoreState; }) {
  return {
    pendingTxMap: network.pendingTxMap,
    selectedTx: network.selectedTx,
  };
}

export default connect(
  mapStateToProps, null)(withStyles(styles)(withRouter(IssuerHomePage)));

// export default withStyles(styles)(withRouter(IssuerHomePage));
