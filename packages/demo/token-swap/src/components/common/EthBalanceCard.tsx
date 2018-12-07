import * as React from 'react';
import RoleContext from './RoleContext';
import * as W3 from 'src/web3Exported';
import { ROLES } from 'src/constants/general';
import { Paper } from '@material-ui/core';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as actions from 'src/actions/network';
import { IAction, toEth } from 'src/utils/general';
import { IStoreState } from 'src/reducers/network';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { SIDEBAR } from 'src/constants/colors';
import { Ethereum_logoSvg as Ether } from 'src/assets/Ethereum_logo.svg';

const styles = createStyles({
  root: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',

    margin: '1em 2em',
    padding: '1em',
    backgroundColor: SIDEBAR.ETH_CARD.bg,
    color: SIDEBAR.ETH_CARD.textColor,
    borderRadius: '8px',
  },
  unit: {
    color: SIDEBAR.ETH_CARD.unitColor,
  },
});
interface IProps {
  web3Obj: W3.default;
  initUser: () => void;
  initIssuer: () => void;
  userEthBalance: string;
  issuerEthBalance: string;
}
class EthBalanceCard extends React.PureComponent<IProps & WithStyles<typeof styles>> {
  static contextType = RoleContext;
  render() {
    console.log(Ether);
    const { userEthBalance, issuerEthBalance, classes } = this.props;
    const format = input => toEth(this.props.web3Obj, input);
    const balance = this.context.theme === ROLES.USER ? userEthBalance : issuerEthBalance;
    return (
      <div className={classes.root}>
        <span>
          {format(balance)}
          <span className={classes.unit}> ETH</span>
        </span>
        {/* <Ether /> */}
        {/* <img src={Ether} alt="Ether"/> */}
      </div>
    );
  }
}
export function mapStateToProps({ network }: { network: IStoreState; }) {
  return {
    contract: network.contract,
    web3Obj: network.web3Obj,
    userEthBalance: network.userEthBalance,
    issuerEthBalance: network.issuerEthBalance,
  };
}
export function mapDispatchToProps(dispatch: Dispatch<IAction>) {
  return {
    initUser: () => dispatch(actions.initUser()),
    initIssuer: () => dispatch(actions.initIssuer()),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EthBalanceCard));
