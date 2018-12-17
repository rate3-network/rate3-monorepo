import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import Input from '@material-ui/core/Input';
import { withRouter } from 'react-router';
import PageBox from '../components/layout/PageBox';
import PageTitle from '../components/layout/PageTitle';
import PageContainer from '../components/layout/PageContainer';
import { RouteComponentProps } from 'react-router-dom';
import { SIDEBAR } from '../constants/colors';
import BlueButton from '../components/common/BlueButton';
import SwapRequestPage from './SwapRequestPage';
import SwapDetailsPage from './SwapDetailsPage';
import ethSGDRSvg from '../assets/ethSGDR.svg';
import stellarSGDRSvg from '../assets/stellarSGDR.svg';

const styles = createStyles({
  row: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  ethCard: {
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingLeft: '3em',
    justifyContent: 'center',
    width: '50%',
    backgroundColor: SIDEBAR.ETH_CARD.bg,
  },
  stellarCard: {
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
    backgroundColor: SIDEBAR.STELLAR_CARD.bg,
  },
  title: {
    marginTop: '3em',
    fontSize: '1.1em',
    fontWeight: 700,
  },
  inputRoot: {
    backgroundColor: 'white',
    borderRadius: '1em',
    height: '1.5em',
    width: '16em',
  },
  input: {
    marginTop: '1em',
    borderRadius: '0.3em',
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
});
enum Direction {
  E2S, // eth to stellar
  S2E, // stellar to eth
}
interface IState {
  page: number;
  direction: Direction;
  ethCardValue: number;
}
type IProps = WithStyles<typeof styles> & RouteComponentProps<{ role: string }>;
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
      ethCardValue: 0,
    };
  }
  componentDidMount() {
    // console.log(this.props.history.location);
  }
  onEthCardValueChange = (e) => {
    const parsed = parseFloat(e.target.value);
    console.log(parsed);
    if (isNaN(parsed)) {
      console.log('skipped');
      return;
    }
    this.setState({
      ethCardValue: parsed,
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
      page: this.state.page - 1 < 0 ? 0 : this.state.page - 1 ,
    });
  }
  next = () => {
    this.setState({
      page: this.state.page + 1 > 3 ? 3 : this.state.page + 1,
    });
  }
  renderEthCard = () => {
    const { classes } = this.props;
    return (
      <div className={classes.ethCard}>
        <span className={classes.title}>
          You {this.state.direction === Direction.E2S ? 'Deposit' : 'Withdraw'}
        </span>
        <span className={classes.input}>Enter Amount</span>
        <Input
          id="uncontrolled"
          value={this.state.ethCardValue}
          onChange={this.onEthCardValueChange}
          // onKeyPress={(e) => { if (e.key === 'Enter') props.onKeyPress(); }}
          placeholder="Email Amount"
          className={classes.input}
          classes={{ input: classes.inputRoot }}
          disableUnderline
          fullWidth
        />
        <span className={classes.amount}>{this.state.ethCardValue}</span>
        <img src={ethSGDRSvg} alt="eth sgdr"/>
        <span className={classes.sgdr}> SGDR</span>
        <span className={classes.chainName}>Ethereum Blackchain</span>
      </div>
    );
  }
  renderStellarCard = () => {
    const { classes } = this.props;
    return (
      <div className={classes.stellarCard}>
        <span>You  {this.state.direction === Direction.E2S ? 'Withdraw' : 'Deposit'}</span>
        <span>Enter Amount</span>
        <span>0.00000 SGDR</span>
        <span>Stellar Blackchain</span>
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
              <span>choose a token: SGDR RTE</span>
              <button onClick={this.toggleDirection}>toggle</button>
              <div className={classes.row}>
                {this.state.direction === Direction.E2S ?
                  <React.Fragment>
                    {this.renderEthCard()}
                    {this.renderStellarCard()}
                  </React.Fragment> :
                  <React.Fragment>
                    {this.renderStellarCard()}
                    {this.renderEthCard()}
                </React.Fragment>
                }
              </div>
              <BlueButton handleClick={this.next}>Next</BlueButton>
            </PageContainer>
          </PageBox>
        }
        {this.state.page === 2 &&
          <SwapRequestPage direction={this.state.direction} goBack={this.goBack} next={this.next} />
        }
        {this.state.page === 3 &&
          <SwapDetailsPage direction={this.state.direction} goBack={this.goBack} next={this.next} />
        }

      </React.Fragment>
    );
  }
}

export default withStyles(styles)(withRouter(DirectSwapPage));
