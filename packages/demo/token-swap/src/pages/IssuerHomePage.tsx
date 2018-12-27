import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { withRouter } from 'react-router';
import Counter from '../components/Counter';

import { RouteComponentProps, HashRouter, Switch, Route } from 'react-router-dom';
import RoleContext from '../components/common/RoleContext';
import { ROLES } from '../constants/general';
import PageBox from '../components/layout/PageBox';
import PageTitle from '../components/layout/PageTitle';
import PageContainer from '../components/layout/PageContainer';
import Box from '../components/layout/Box';
import AwaitingApprovalList from '../components/issuer/AwaitingApprovalList';
import { COLORS } from '../constants/colors';
// export interface IProps {
//   classes: any;
// }

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
  boxLabel: {
    color: COLORS.grey,
    fontSize: '1.5rem',
    fontWeight: 100,
    alignSelf: 'flex-start',
  },
});

type IProps = WithStyles<typeof styles> & RouteComponentProps<{ role: string }>;
class IssuerHomePage extends React.Component<IProps> {
  static contextType = RoleContext;
  componentDidMount() {
    // console.log(this.props.history.location);
  }

  render() {
    console.log('home page rendered');
    const { classes, match } = this.props;
    // const { role } = match.params;
    return (
      <PageBox>
        <PageTitle>
          HOME
        </PageTitle>
        <PageContainer>
          <span className={classes.boxLabel}>Overview</span>
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
          <span className={classes.boxLabel}>Approval Needed</span>
          <Box>
            <AwaitingApprovalList />
          </Box>
          <span className={classes.boxLabel}>In Progress</span>
          <Box>
            table
          </Box>
        </PageContainer>
      </PageBox>
    );
  }
}

export default withRouter(withStyles(styles)(IssuerHomePage));
