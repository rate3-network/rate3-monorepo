import * as React from 'react';
import RoleContext from './RoleContext';
import * as W3 from '../../web3Exported';
import { ROLES } from '../../constants/general';
import { Paper } from '@material-ui/core';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as actions from '../../actions/network';
import { IAction, toEth, fromTokenAmount } from '../../utils/general';
import { IStoreState, initialState } from '../../reducers/network';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { SIDEBAR } from '../../constants/colors';
import Ether from '../../assets/Ethereum_logo.svg'; // tslint:disable-line:import-name
import ethSvg from '../../assets/eth.svg';
import ethSgdrSvg from '../../assets/ethSGDR.svg';
const styles = createStyles({
  root: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    minWidth: '16em',
    margin: '3em 2em 1em 2em',
    padding: '1em',
    backgroundColor: SIDEBAR.ETH_CARD.bg,
    color: SIDEBAR.ETH_CARD.textColor,
    borderRadius: '8px',
  },
  unit: {
    color: SIDEBAR.ETH_CARD.unitColor,
    whiteSpace: 'pre',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.2em',
  },
  img: {
    marginRight: '1em',
  },
});

interface IProps {
  web3Obj: W3.default | null;
  userEthBalance: string;
  issuerEthBalance: string;
  userEthSgdrBalance: string;
}
class EthBalanceCard extends React.Component<IProps & WithStyles<typeof styles>> {
  static contextType = RoleContext;
  render() {
    const { userEthBalance, userEthSgdrBalance, issuerEthBalance, classes } = this.props;
    const format = input => toEth(this.props.web3Obj, input, 4);
    const balance = this.context.theme === ROLES.USER ? userEthBalance : issuerEthBalance;
    const sgdrBalance = userEthSgdrBalance;
    return (
      <div className={classes.root}>
        <div className={classes.col}>
          <div className={classes.row}>
            <img className={classes.img} draggable={false} height="25" src={ethSvg} alt="Ether"/>
            {format(balance)}
            <span className={classes.unit}> ETH</span>
          </div>
          {this.context.theme === ROLES.USER &&
            <div className={classes.row}>
              <img
                className={classes.img}
                draggable={false}
                height="25"
                src={ethSgdrSvg}
                alt="sgdr"
              />
              {fromTokenAmount(sgdrBalance, 4)}
              <span className={classes.unit}> SGDR</span>
            </div>
          }
        </div>
        <img draggable={false} src={Ether} alt="Ether"/>
      </div>
    );
  }
}
export function mapStateToProps({ network }: { network: IStoreState; }) {
  return {
    contract: network.contract,
    web3Obj: network.web3Obj,

    userEthBalance: network.userEthBalance,
    userEthSgdrBalance: network.userEthSgdrBalance,

    issuerEthBalance: network.issuerEthBalance,

    pendingTxMap: network.pendingTxMap,
  };
}
export function mapDispatchToProps(dispatch: Dispatch<IAction>) {
  return {
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EthBalanceCard));
