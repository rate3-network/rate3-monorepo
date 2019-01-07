import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { withRouter } from 'react-router';
import PageBox from '../components/layout/PageBox';
import { initialState } from '../reducers/network';
import PageTitle from '../components/layout/PageTitle';
import { RouteComponentProps } from 'react-router-dom';
import { COLORS } from '../constants/colors';
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
});

interface IProps {
  pendingTxMap: typeof initialState.pendingTxMap;
  selectedTx: string;
  direction: Direction;
  value: string;
  goBack(): void;
  next(): void;
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
    console.log(this.props.pendingTxMap);
    console.log(this.props.selectedTx);
  }

  render() {
    const { classes, selectedTx, direction, pendingTxMap } = this.props;
    const selectedRequest = pendingTxMap[selectedTx];
    console.log(selectedRequest);
    return (
      <PageBox>
        <PageTitle withBackButton={true} backName="BACK" backAction={this.props.goBack}>
          SWAP DETAILS
        </PageTitle>
        {
          <TxProgress
            tx={selectedRequest}
            direction={direction}
            userSetValue={this.props.value}
          />
        }
      </PageBox>
    );
  }
}

export default withStyles(styles)(withRouter(SwapDetailsPage));
