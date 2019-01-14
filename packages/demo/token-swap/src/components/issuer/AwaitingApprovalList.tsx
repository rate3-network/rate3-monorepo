import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { isEmpty } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as actions from '../../actions/issuer';
import * as networkActions from '../../actions/network';
import arrowSvg from '../../assets/arrow.svg';
import { COLORS } from '../../constants/colors';
import { IE2SRequest, IS2ERequest, IStoreState } from '../../reducers/issuer';
import { IAction } from '../../utils/general';
import SummaryCard from '../common/SummaryCard';

const styles = createStyles({
  row: {
    width: 'calc(95% - 4rem)',
    padding: '0.8rem 2rem',
    display: 'grid',
    gridTemplateColumns: '1.5fr 2fr 0.5fr 2fr 2fr',
  },
  titleRow: {
    width: '100%',
    borderBottom: `1px solid ${COLORS.veryLightGrey}`,
  },
  centered: {
    color: COLORS.grey,
    alignSelf: 'center',
    justifySelf: 'center',
  },
  fullLength: {
    width: '100%',
  },
  divider: {
    width: '100%',
    borderBottom: `1px solid ${COLORS.veryLightGrey}`,
  },
  greyTitle: {
    fontSize: '1.1rem',
    alignSelf: 'center',
    justifySelf: 'center',
    color: COLORS.lighGrey,
  },
  approve: {
    color: COLORS.blue,
    alignSelf: 'center',
    justifySelf: 'center',
    cursor: 'pointer',
  },
  noEntry: {
    backgroundColor: COLORS.superLightGrey,
    width: 'calc(95% - 4rem)',
    padding: '2rem 2rem',
    textAlign: 'center',
    color: COLORS.grey,
  },
});

interface IProps {
  e2sApprovalList: null | IE2SRequest[];
  s2eApprovalList: null | IS2ERequest[];
  fetchE2S(): void;
  fetchS2E(): void;
  next(): void;
  goBack(): void;
  setCurrentApproval(value: any): void;
  selectTx(hash: string): void;
}
class AwaitingApprovalList extends React.Component<IProps & WithStyles<typeof styles>> {
  componentDidMount() {
    this.props.fetchE2S();
    this.props.fetchS2E();
  }

  render() {
    const { e2sApprovalList, s2eApprovalList, fetchE2S, fetchS2E, classes } = this.props;
    const filteredE2sList = e2sApprovalList && e2sApprovalList.filter((item) => {
      return !item.approved && !item.inProgress;
    });
    const filteredS2eList = s2eApprovalList && s2eApprovalList.filter((item) => {
      return !item.approved && !item.inProgress;
    });
    if (isEmpty(filteredE2sList) && isEmpty(filteredS2eList)) {
      return (
        <>
          <div className={classes.titleRow}>
            <div className={classes.row}>
              <span className={classes.greyTitle}>Type</span>
              <span className={classes.greyTitle}>Deposit</span>
              <span className={classes.greyTitle} />
              <span className={classes.greyTitle}>Withdraw</span>
              <span className={classes.greyTitle} />
            </div>
          </div>
          <div className={classes.noEntry}>
            You don't have any swaps to approve.
          </div>
        </>
      );
    }
    return (
      <>
        <div className={classes.titleRow}>
          <div className={classes.row}>
            <span className={classes.greyTitle}>Type</span>
            <span className={classes.greyTitle}>Deposit</span>
            <span className={classes.greyTitle} />
            <span className={classes.greyTitle}>Withdraw</span>
            <span className={classes.greyTitle} />
          </div>
        </div>
        {filteredE2sList && filteredE2sList.map(request => (
          <div className={classes.fullLength} key={request.hash}>
            <div className={classes.divider} />
            <div className={classes.row}>
              <span className={classes.centered}>Direct</span>
              <span className={classes.centered}>
                <SummaryCard type="eth" value={request.amount} />
              </span>
              <span className={classes.centered}>
                <img className={classes.centered} src={arrowSvg} alt="arrow"/>
              </span>
              <span className={classes.centered}>
                <SummaryCard type="stellar" value={request.amount} />
              </span>
              <span
                className={classes.approve}
                onClick={() => {
                  this.props.selectTx(request.hash);
                  this.props.setCurrentApproval(request);
                  this.props.next();
                }}
              >
                Approve <b>></b>
              </span>
            </div>
          </div>
        ))}
        {filteredS2eList && filteredS2eList.map(request => (
          <div className={classes.fullLength} key={request.hash}>
            <div className={classes.divider} />
            <div className={classes.row}>
              <span className={classes.centered}>Direct</span>
              <span className={classes.centered}>
                <SummaryCard type="stellar" value={request.amount} />
              </span>
              <span className={classes.centered}>
                <img className={classes.centered} src={arrowSvg} alt="arrow"/>
              </span>
              <span className={classes.centered}>
                <SummaryCard type="eth" value={request.amount} />
              </span>
              <span
                className={classes.approve}
                onClick={() => {
                  this.props.setCurrentApproval(request);
                  this.props.selectTx(request.hash);
                  this.props.next();
                }}
              >
                Approve <b>></b>
              </span>
              {/* <span>{truncateAddress(request.hash)}</span> */}
            </div>
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
    selectTx: (hash: string) => dispatch(networkActions.selectTx(hash)),
  };
}
export default connect(
  mapStateToProps, mapDispatchToProps)(withStyles(styles)(AwaitingApprovalList));

