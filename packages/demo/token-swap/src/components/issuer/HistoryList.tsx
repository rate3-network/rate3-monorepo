import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { isEmpty, orderBy } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as actions from '../../actions/issuer';
import arrowSvg from '../../assets/arrow.svg';
import { COLORS } from '../../constants/colors';
import { IE2SRequest, IS2ERequest, IStoreState } from '../../reducers/issuer';
import { IStoreState as INetoworkState } from '../../reducers/network';
import { IAction } from '../../utils/general';
import SummaryCard from '../common/SummaryCard';
import Progress from '@material-ui/core/CircularProgress';

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
  details: {
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
  pagerGrp: {
    padding: '1em 0',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    borderTop: `1px solid ${COLORS.veryLightGrey}`,
  },
  pager: {
    padding: '0 2em',
    color: COLORS.grey,
    cursor: 'pointer',
  },
  spinner: {
    padding: '2em',
  },
});

interface IProps {
  e2sApprovalList: null | IE2SRequest[];
  s2eApprovalList: null | IS2ERequest[];
  ethHistory: any[];
  stellarHistory: any[];
  inProgress?: boolean;
  loadingHistory: boolean;
  fetchE2S(): void;
  fetchS2E(): void;
  next(): void;
  goBack(): void;
  goTo(pg: number): void;
  setSelectedHistory(value: any): void;
  // setCurrentApproval(value: any): void;
}
interface IState {
  page: number;
  maxPage: number;
  noPerPage: number;
}
class HistoryList extends React.Component<IProps & WithStyles<typeof styles>, IState> {
  static defaultProps = {
    inProgress: false,
  };
  state = {
    page: 0,
    maxPage: 1,
    noPerPage: 10,
  };
  componentDidMount() {
    console.log('list page');
    this.props.fetchE2S();
    this.props.fetchS2E();
  }

  render() {
    const {
      e2sApprovalList,
      s2eApprovalList,
      inProgress,
      stellarHistory,
      ethHistory,
      classes,
    } = this.props;

    const filteredE2sList = e2sApprovalList && e2sApprovalList.filter((item) => {
      return item.approved !== inProgress;
    });
    const filteredS2eList = s2eApprovalList && s2eApprovalList.filter((item) => {
      return item.approved !== inProgress;
    });

    let combinedList: any = [];
    if (!inProgress) {
      combinedList = orderBy(stellarHistory.concat(ethHistory), ['sortingTimestamp'], ['desc']);
    }
    const listLen = combinedList.length;

    const { page, noPerPage } = this.state;

    const currPage = listLen <= noPerPage ?
      combinedList
      :
      combinedList.slice(page * noPerPage, (page + 1) * noPerPage);

    const renderHistory = () => {
      return (
        <>
          {this.props.loadingHistory &&
            <div className={classes.spinner}><Progress /></div>}
          {currPage.map(request => (
            <div className={classes.fullLength} key={request.key}>
              <div className={classes.divider} />
              <div className={classes.row}>
                <span className={classes.centered}>Direct</span>
                <span className={classes.centered}>
                  {request.type === 'E2S' ?
                  <SummaryCard type="eth" value={request.amount} />
                  :
                  <SummaryCard type="stellar" value={request.amount} />
                  }
                </span>
                <span className={classes.centered}>
                  <img className={classes.centered} src={arrowSvg} alt="arrow"/>
                </span>
                <span className={classes.centered}>
                {request.type === 'E2S' ?
                  <SummaryCard type="stellar" value={request.amount} />
                  :
                  <SummaryCard type="eth" value={request.amount} />
                  }
                </span>
                <span
                  className={classes.details}
                  onClick={() => {
                    this.props.setSelectedHistory(request);
                    this.props.goTo(4);
                  }}
                >
                  Details <b>></b>
                </span>
              </div>
            </div>
          ))}
        </>
      );
    };
    if (inProgress) {
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
              You don't any swaps in this section.
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
                  className={classes.details}
                  onClick={() => {
                    this.props.setSelectedHistory(request);
                    this.props.goTo(4);
                  }}
                >
                  Details <b>></b>
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
                  className={classes.details}
                  onClick={() => {
                    this.props.setSelectedHistory(request);
                    this.props.goTo(4);
                  }}
                >
                  Details <b>></b>
                </span>
                {/* <span>{truncateAddress(request.hash)}</span> */}
              </div>
            </div>
          ))}
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
        {renderHistory()}
        <div className={classes.pagerGrp}>
          <span
            className={classes.pager}
            onClick={() => {
              if (this.state.page > 0) {
                this.setState({
                  page: this.state.page - 1,
                });
              }
            }}
          >
            {'< Most Recent'}
          </span>
          <span
            className={classes.pager}
            onClick={() => {
              const maxPage = Math.floor(combinedList.length / noPerPage);
              if (this.state.page < maxPage) {
                this.setState({
                  page: this.state.page + 1,
                });
              }
            }}
          >
            {'Older >'}
          </span>
        </div>
      </>
    );
  }
}
export function mapStateToProps({ issuer, network }:
  { issuer: IStoreState; network: INetoworkState; }) {
  return {
    e2sApprovalList: issuer.e2sApprovalList,
    s2eApprovalList: issuer.s2eApprovalList,
    stellarHistory: network.stellarHistory,
    ethHistory: network.ethHistory,
    loadingHistory: network.loadingHistory,
  };
}
export function mapDispatchToProps(dispatch: Dispatch<IAction>) {
  return {
    fetchE2S: () => dispatch(actions.fetchEthToStellar()),
    fetchS2E: () => dispatch(actions.fetchStellarToEth()),
  };
}
export default connect(
  mapStateToProps, mapDispatchToProps)(withStyles(styles)(HistoryList));
