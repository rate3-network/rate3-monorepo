import * as React from 'react';

import { Paper, Divider } from '@material-ui/core';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as actions from '../../actions/issuer';
import { IAction, truncateAddress } from '../../utils/general';
import { IStoreState, IE2SRequest, IS2ERequest } from '../../reducers/issuer';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { SIDEBAR } from '../../constants/colors';

const styles = createStyles({
  root: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',

    margin: '3em 2em 1em 2em',
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
  e2sApprovalList: null | IE2SRequest[];
  s2eApprovalList: null | IS2ERequest[];
  fetchE2S: () => void;
  fetchS2E: () => void;
}
class AwaitingApprovalList extends React.PureComponent<IProps & WithStyles<typeof styles>> {
  componentDidMount() {
    this.props.fetchE2S();
    this.props.fetchS2E();
  }
  render() {
    const { e2sApprovalList, s2eApprovalList, fetchE2S, fetchS2E, classes } = this.props;
    return (
      <>
        {e2sApprovalList && e2sApprovalList.map(request => (
          <div key={request.hash}>
            <span>{truncateAddress(request.hash)}</span>
            ----
            <span>{request.type}</span>
            ----
            <span>{request.amount}</span>
          </div>
        ))}
        {s2eApprovalList && s2eApprovalList.map(request => (
          <div key={request.hash}>
            <span>{truncateAddress(request.hash)}</span>
            ----
            <span>{request.type}</span>
            ----
            <span>{request.amount}</span>
          </div>
        ))}
      </>
    );
  }
}
export function mapStateToProps({ issuer }: { issuer: IStoreState; }) {
  return {
    e2sApprovalList: issuer.e2sApprovalList,
    s2eApprovalList: issuer.s2eApprovalList,
  };
}
export function mapDispatchToProps(dispatch: Dispatch<IAction>) {
  return {
    fetchE2S: () => dispatch(actions.fetchEthToStellar()),
    fetchS2E: () => dispatch(actions.fetchStellarToEth()),
  };
}
export default connect(
  mapStateToProps, mapDispatchToProps)(withStyles(styles)(AwaitingApprovalList));
