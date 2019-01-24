import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import Divider from '@material-ui/core/Divider';
import { IE2SRequest, IS2ERequest } from '../reducers/issuer';
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
import TxProgress from '../components/common/TxProgress';

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
  currentSelectedHistory: any;
  goBack(): void;
  next(): void;
  // requestS2E(): void;
  // requestE2S(): void;
}

type IPropsFinal = WithStyles<typeof styles> & RouteComponentProps<{ role: string }> & IProps;
class HistorySwapDetailsPage extends React.Component<IPropsFinal> {
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
    const { classes, currentSelectedHistory } = this.props;
    let amount = '';
    let direction = Direction.S2E;
    if (currentSelectedHistory) {
      amount = currentSelectedHistory.amount;
      if (currentSelectedHistory.type === 'E2S') {
        direction = Direction.E2S;
      }
    }
    return (
      <PageBox>
        <PageTitle withBackButton={true} backName="Direct" backAction={this.props.goBack}>
          SWAP DETAILS
        </PageTitle>
        {currentSelectedHistory &&
          <TxProgress
            userSetValue={currentSelectedHistory.amount}
            tx={currentSelectedHistory}
            direction={direction}
          />
        }
      </PageBox>
    );
  }
}

export default withStyles(styles)(withRouter(HistorySwapDetailsPage));
