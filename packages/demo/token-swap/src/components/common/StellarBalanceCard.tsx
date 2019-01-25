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
import stellarSvg from '../../assets/stellar.svg';
import stellarSgdrSvg from '../../assets/stellarSGDR.svg';
const styles = createStyles({
  root: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    minWidth: '16em',

    margin: '1em 2em 3em 2em',
    padding: '1em',
    backgroundColor: SIDEBAR.STELLAR_CARD.bg,
    color: SIDEBAR.STELLAR_CARD.textColor,
    borderRadius: '8px',
  },
  unit: {
    color: SIDEBAR.STELLAR_CARD.unitColor,
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
  userStellarBalance: string;
  issuerStellarBalance: string;

  userStellarSgdrBalance: string;
}
class StellarBalanceCard extends React.PureComponent<IProps & WithStyles<typeof styles>> {
  static contextType = RoleContext;
  render() {
    const
      { userStellarBalance,
        userStellarSgdrBalance,
        issuerStellarBalance,
        classes,
      } = this.props;
    const format = input => parseFloat(input).toFixed(4);
    const balance = this.context.theme === ROLES.USER ? userStellarBalance : issuerStellarBalance;
    return (
      <div className={classes.root}>
        <div className={classes.col}>
          <div className={classes.row}>
            <img
              className={classes.img}
              draggable={false}
              height="25"
              src={stellarSvg}
              alt="Ether"
            />
            {format(balance)}
            <span className={classes.unit}> XLM</span>
          </div>
          {this.context.theme === ROLES.USER &&
            <div className={classes.row}>
              <img
                className={classes.img}
                draggable={false}
                height="25"
                src={stellarSgdrSvg}
                alt="stellarSgdrSvg"
              />
              {format(userStellarSgdrBalance)}
              <span className={classes.unit}> SGDR</span>
            </div>
          }
        </div>
        <img draggable={false} src={Stellar} alt="Stellar"/>
      </div>
    );
  }
}
export function mapStateToProps({ network }: { network: IStoreState; }) {
  return {
    contract: network.contract,
    web3Obj: network.web3Obj,
    userStellarBalance: network.userStellarBalance,
    userStellarSgdrBalance: network.userStellarSgdrBalance,
    issuerStellarBalance: network.issuerStellarBalance,
  };
}
export function mapDispatchToProps(dispatch: Dispatch<IAction>) {
  return {
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(StellarBalanceCard));
