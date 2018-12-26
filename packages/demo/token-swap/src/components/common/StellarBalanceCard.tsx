import * as React from 'react';
import RoleContext from './RoleContext';
import * as W3 from '../../web3Exported';
import { ROLES } from '../../constants/general';
import { Paper } from '@material-ui/core';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as actions from '../../actions/network';
import { IAction, toEth } from '../../utils/general';
import { IStoreState } from '../../reducers/network';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { SIDEBAR } from '../../constants/colors';
import Stellar from '../../assets/Stellar_logo.svg'; // tslint:disable-line:import-name

const styles = createStyles({
  root: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',

    margin: '1em 2em 3em 2em',
    padding: '1em',
    backgroundColor: SIDEBAR.STELLAR_CARD.bg,
    color: SIDEBAR.STELLAR_CARD.textColor,
    borderRadius: '8px',
  },
  unit: {
    color: SIDEBAR.STELLAR_CARD.unitColor,
  },
});
interface IProps {
  web3Obj: W3.default | null;
  userStellarBalance: string;
  issuerStellarBalance: string;
}
class StellarBalanceCard extends React.PureComponent<IProps & WithStyles<typeof styles>> {
  static contextType = RoleContext;
  render() {
    const { userStellarBalance, issuerStellarBalance, classes } = this.props;
    const format = input => parseFloat(input).toFixed(2);
    const balance = this.context.theme === ROLES.USER ? userStellarBalance : issuerStellarBalance;
    return (
      <div className={classes.root}>
        <span>
          {format(balance)}
          <span className={classes.unit}> XLM</span>
        </span>
        <img src={Stellar} alt="Stellar"/>
      </div>
    );
  }
}
export function mapStateToProps({ network }: { network: IStoreState; }) {
  return {
    contract: network.contract,
    web3Obj: network.web3Obj,
    userStellarBalance: network.userStellarBalance,
    issuerStellarBalance: network.issuerStellarBalance,
  };
}
export function mapDispatchToProps(dispatch: Dispatch<IAction>) {
  return {
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(StellarBalanceCard));
