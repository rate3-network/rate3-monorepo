import * as React from 'react';
import RoleContext from './RoleContext';
import { ROLES } from 'src/constants/general';
import { Paper } from '@material-ui/core';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as actions from 'src/actions/network';
import { IAction } from 'src/utils/general';
import { IStoreState } from 'src/reducers/network';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';

const styles = createStyles({
});
interface IProps {
  initUser: () => void;
  initIssuer: () => void;
  userEthBalance: string;
  issuerEthBalance: string;
}
class StellarBalanceCard extends React.PureComponent<IProps & WithStyles<typeof styles>> {
  static contextType = RoleContext;
  render() {
    const { userEthBalance, issuerEthBalance } = this.props;
    return (
      <Paper>
        Stellarbalance: {this.context.theme === ROLES.USER ? userEthBalance : issuerEthBalance}
        test
      </Paper>
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
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(StellarBalanceCard));
