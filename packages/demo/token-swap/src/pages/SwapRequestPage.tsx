import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { withRouter } from 'react-router';
import PageBox from '../components/layout/PageBox';
import PageTitle from '../components/layout/PageTitle';
import PageContainer from '../components/layout/PageContainer';
import Box from '../components/layout/Box';
import { RouteComponentProps } from 'react-router-dom';
import BlueButton from '../components/common/BlueButton';

const styles = createStyles({
  row: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  backButton: {
    textAlign: 'start',
    fontSize: '1rem',
  },
});
enum Direction {
  E2S, // eth to stellar
  S2E, // stellar to eth
}
interface IProps {
  direction: Direction;
  goBack(): void;
  next(): void;
}
type IPropsFinal = WithStyles<typeof styles> & RouteComponentProps<{ role: string }> & IProps;
class DirectSwapPage extends React.Component<IPropsFinal> {
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
    const { classes } = this.props;
    return (
      <PageBox>
        <PageTitle withBackButton={true} backName="Direct" backAction={this.props.goBack}>
          Swap Request
        </PageTitle>
        <PageContainer>
          <span>choose a token: SGDR RTE</span>
          <div className={classes.row}>
            {/* {this.state.direction === Direction.E2S ?
              <React.Fragment>
                {this.renderEthCard()}
                {this.renderStellarCard()}
              </React.Fragment> :
              <React.Fragment>
                {this.renderStellarCard()}
                {this.renderEthCard()}
            </React.Fragment>
            } */}
          </div>
          <BlueButton handleClick={this.props.next}>Next</BlueButton>
        </PageContainer>
      </PageBox>
    );
  }
}

export default withStyles(styles)(withRouter(DirectSwapPage));
