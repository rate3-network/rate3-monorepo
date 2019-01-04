import Input from '@material-ui/core/Input';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import classnames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import * as networkActions from '../actions/network';
import * as actions from '../actions/user';
import BlueButton from '../components/common/BlueButton';
import SummaryCard from '../components/common/SummaryCard';
import PageBox from '../components/layout/PageBox';
import PageContainer from '../components/layout/PageContainer';
import PageTitle from '../components/layout/PageTitle';
import { SIDEBAR } from '../constants/colors';
import { IE2SRequest, IS2ERequest } from '../reducers/issuer';
import { initialState, IStoreState } from '../reducers/network';
import { Direction, IAction } from '../utils/general';
import SwapDetailsPage from './SwapDetailsPage';
import SwapRequestPage from './SwapRequestPage';
import exchangeSvg from '../assets/exchange.svg';
const styles = createStyles({
  toggleBtn: {
    position: 'relative',
    top: 120,
    height: 35,
    cursor: 'pointer',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  card: {
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingLeft: '3em',
    justifyContent: 'center',
    width: '50%',
    paddingBottom: '1.5em',
  },
  ethCard: {
    backgroundColor: SIDEBAR.ETH_CARD.bg,
  },
  stellarCard: {
    backgroundColor: SIDEBAR.STELLAR_CARD.bg,
  },
  leftCard: {
    borderTopLeftRadius: '0.4em',
    borderBottomLeftRadius: '0.4em',
  },
  rightCard: {
    borderTopRightRadius: '0.4em',
    borderBottomRightRadius: '0.4em',
  },
  title: {
    marginTop: '3em',
    fontSize: '1.1em',
    fontWeight: 300,
  },
  inputRoot: {
    backgroundColor: 'white',
    borderRadius: '1em',
    paddingLeft: '1em',
    height: '1.5em',
    width: '16em',
    fontFamily: 'din-2014',
  },
  input: {
    width: '16em',
    margin: '0.7em 0 1.2em 0',
    borderRadius: '0.4em',
    fontFamily: 'din-2014',
  },
  cardItemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  amount: {
    marginTop: '1em',

  },
  sgdr: {
    marginTop: '1em',

  },
  chainName: {
    marginTop: '1em',

  },
  verticalGap: {
    paddingTop: '3em',
  },
});
enum CardType {
  eth,
  stellar,
}
interface IState {
  page: number;
  direction: Direction;
  cardValue: string;
  selectedHistory: null | IE2SRequest | IS2ERequest;
}
interface IReduxProps {
  requestE2S: (value: string) => void;
  requestS2E: (value: string) => void;
  resetSelectedTx: () => void;
  pendingTxMap: typeof initialState.pendingTxMap;
  selectedTx: string;
}
type IProps = IReduxProps & WithStyles<typeof styles> & RouteComponentProps<{ role: string }>;
class DirectSwapPage extends React.Component<IProps> {
  state: IState;
  constructor(props: any) {
    super(props);
    this.toggleDirection = this.toggleDirection.bind(this);
    this.goBack = this.goBack.bind(this);
    this.next = this.next.bind(this);
    this.toggleDirection = this.toggleDirection.bind(this);
    this.state = {
      page: 1,
      direction: Direction.E2S,
      cardValue: '',
      selectedHistory: null,
    };
  }
  componentDidMount() {
    // console.log(this.props.history.location);
  }
  validateAmount = () => {
    const parsed = parseFloat(this.state.cardValue);
    console.log(parsed);
    if (isNaN(parsed) || parsed < 0) {
      console.log('skipped');
      this.setState({
        cardValue: '',
      });
    } else {
      this.setState({
        cardValue: parsed,
      });
    }
  }
  onCardValueChange = (e) => {
    this.setState({
      cardValue: e.target.value,
    });
  }
  toggleDirection = () => {
    console.log(this.state.direction);
    this.setState({
      direction: this.state.direction === Direction.E2S ? Direction.S2E : Direction.E2S,
    });
  }
  goBack = () => {
    this.setState({
      page: this.state.page - 1 < 0 ? 0 : this.state.page - 1,
    });
  }
  goHome = () => {
    this.setState({
      page: 1,
    });
  }
  next = () => {
    this.setState({
      page: this.state.page + 1 > 3 ? 3 : this.state.page + 1,
    });
  }
  renderCard = (type: CardType) => {
    const { classes } = this.props;
    const onLeft =
      (this.state.direction === Direction.E2S && type === CardType.eth) ||
      (this.state.direction === Direction.S2E && type === CardType.stellar);
    return (
      <div
        className={classnames(
          classes.card,
          { [classes.ethCard]: type === CardType.eth },
          { [classes.stellarCard]: type === CardType.stellar },
          { [classes.leftCard]: onLeft },
          { [classes.rightCard]: !onLeft }
        )}
      >
        <div className={classes.cardItemsContainer}>
          <span className={classes.title}>
            You {onLeft ? 'Deposit' : 'Withdraw'}
          </span>
          <Input
            id="uncontrolled"
            value={this.state.cardValue}
            onChange={this.onCardValueChange}
            onBlur={this.validateAmount}
            placeholder="Enter Amount"
            className={classes.input}
            classes={{ input: classes.inputRoot }}
            disableUnderline
            fullWidth
          />
          {type === CardType.eth ?
          <SummaryCard noPadding value={this.state.cardValue} type="eth" />
          :
          <SummaryCard noPadding value={this.state.cardValue} type="stellar" />
          }
        </div>
      </div>
    );
  }

  render() {
    console.log('swap page rendered');
    const { classes, match } = this.props;
    const { role } = match.params;
    return (
      <React.Fragment>
        {this.state.page === 1 &&
          <PageBox>
            <PageTitle>
              DIRECT
            </PageTitle>
            <PageContainer>
              <div onClick={this.toggleDirection}>
                <img
                  className={classes.toggleBtn}
                  src={exchangeSvg}
                  alt="swap"
                />
              </div>

              <div className={classes.row}>
                {this.state.direction === Direction.E2S ?
                  <React.Fragment>
                    {this.renderCard(CardType.eth)}
                    {this.renderCard(CardType.stellar)}
                  </React.Fragment> :
                  <React.Fragment>
                    {this.renderCard(CardType.stellar)}
                    {this.renderCard(CardType.eth)}
                </React.Fragment>
                }
              </div>
              <div className={classes.verticalGap} />
              <BlueButton
                darkBlue
                noCap
                width="10em"
                fontSize="1.1em"
                height="2.2em"
                disabled={!this.state.cardValue}
                handleClick={this.next}
              >
                Next
              </BlueButton>
            </PageContainer>
          </PageBox>
        }
        {this.state.page === 2 &&
          <SwapRequestPage
            value={this.state.cardValue}
            direction={this.state.direction}
            goBack={this.goBack}
            next={this.next}
            requestE2S={() => {
              this.props.requestE2S(this.state.cardValue);
            }}
            requestS2E={() => {
              this.props.requestS2E(this.state.cardValue);
            }}
          />
        }
        {this.state.page === 3 &&
          <SwapDetailsPage
            value={this.state.cardValue}
            direction={this.state.direction}
            goBack={() => {
              this.goHome();
              this.props.resetSelectedTx();
            }}
            next={this.next}
            pendingTxMap={this.props.pendingTxMap}
            selectedTx={this.props.selectedTx}
          />
        }

      </React.Fragment>
    );
  }
}
export function mapStateToProps({ network }: { network: IStoreState; }) {
  return {
    pendingTxMap: network.pendingTxMap,
    selectedTx: network.selectedTx,
  };
}
export function mapDispatchToProps(dispatch: Dispatch<IAction>) {
  return {
    requestE2S: (x: string) => dispatch(actions.requestEthToStellar(x)),
    requestS2E: (x: string) => dispatch(actions.requestStellarToEth(x)),
    resetSelectedTx: () => dispatch(networkActions.resetSelectedTx()),
  };
}
export default connect(
  mapStateToProps, mapDispatchToProps)(withStyles(styles)(withRouter(DirectSwapPage)));
