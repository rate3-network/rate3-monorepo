import { COLORS } from '../constants/colors';
import { createStyles } from '@material-ui/core/styles';
import { RouteComponentProps } from 'react-router-dom';
import { withRouter } from 'react-router';
import * as React from 'react';
import Box from '../components/layout/Box';
import HistoryList from '../components/issuer/HistoryList';
import PageBox from '../components/layout/PageBox';
import PageContainer from '../components/layout/PageContainer';
import PageTitle from '../components/layout/PageTitle';
import RoleContext from '../components/common/RoleContext';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import HistorySwapDetailsPage from './HistorySwapDetailsPage';

const styles = createStyles({
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  boxConstraint: {
    width: '40%',
  },
  thinText: {
    color: COLORS.grey,
    fontSize: '1.5rem',
    fontWeight: 100,
    margin: '1rem 0 2rem 0',
  },
  swapNumber: {
    color: COLORS.black,
    fontSize: '3rem',
    fontWeight: 500,
    margin: '1rem 0',
  },
  boxLabelNoMargin: {
    color: COLORS.grey,
    fontSize: '1.5rem',
    fontWeight: 100,
    alignSelf: 'flex-start',
    margin: '0rem 0 1rem 0',
  },
  boxLabel: {
    color: COLORS.grey,
    fontSize: '1.5rem',
    fontWeight: 100,
    alignSelf: 'flex-start',
    margin: '2.5rem 0 1rem 0',
  },
});

type IProps = WithStyles<typeof styles> & RouteComponentProps<{ role: string }>;
class UserHomePage extends React.Component<IProps> {
  static contextType = RoleContext;
  state = {
    page: 1,
    selectedHistory: null,
  };

  setSelectedHistory = (value) => {
    this.setState({
      selectedHistory: value,
    });
  }
  goBack = () => {
    this.setState({
      page: this.state.page - 1 < 0 ? 0 : this.state.page - 1,
    });
  }
  goTo = (pg: number) => {
    this.setState({
      page: pg,
    });
  }
  next = () => {
    this.setState({
      page: this.state.page + 1 > 3 ? 3 : this.state.page + 1,
    });
  }
  render() {
    console.log('home page rendered');
    const { classes, match } = this.props;
    // const { role } = match.params;
    return (
      <>
        {this.state.page === 4 ?
          <HistorySwapDetailsPage
            currentSelectedHistory={this.state.selectedHistory}
            goBack={this.goBack}
            next={this.next}
          />
          :
          <PageBox>
            <PageTitle>
              HOME
            </PageTitle>
            <PageContainer>
              <span className={classes.boxLabelNoMargin}>Overview</span>
              <div className={classes.row}>
                <div className={classes.boxConstraint}>
                  <Box fullHeight>
                    <div className={classes.swapNumber}>
                      5
                    </div>
                    <div className={classes.thinText}>
                      Swaps today
                    </div>
                  </Box>
                </div>
                <div className={classes.boxConstraint}>
                  <Box fullHeight>
                    <div className={classes.thinText}>
                      Demo Exploration
                    </div>
                  </Box>
                </div>
              </div>
              <span className={classes.boxLabel}>In Progress</span>
              <Box>
                <HistoryList
                  inProgress
                  next={this.next}
                  goBack={this.goBack}
                  goTo={this.goTo}
                  setSelectedHistory={this.setSelectedHistory}
                />
              </Box>
              <span className={classes.boxLabel}>History</span>
              <Box>
                <HistoryList
                  next={this.next}
                  goBack={this.goBack}
                  goTo={this.goTo}
                  setSelectedHistory={this.setSelectedHistory}
                />
              </Box>
            </PageContainer>
          </PageBox>
        }
        </>
    );
  }
}

export default withRouter(withStyles(styles)(UserHomePage));
