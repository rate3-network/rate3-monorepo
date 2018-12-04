import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as actions from '../actions/counter';
import { IStoreState } from '../reducers/counter';
import { withRouter } from 'react-router';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { Hidden, Drawer } from '@material-ui/core';
import { Link, RouteComponentProps } from 'react-router-dom';
import RoleSwitch from './common/RoleSwitch';

export interface IProps {
  value: number;
  content: string;
  error: object;
  isFetching: boolean;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onIncrementAsync?: () => void;
  requestContent?: () => void;
  requestContent2?: () => void;
}
const styles = createStyles({
  root: {
    backgroundColor: 'purple',
  },
  drawerPaper: {
    position: 'fixed',
    width: '20vw',
    height: '100vh',
    transition: 'background-color 0.1s ease',
    // borderRight: '0',
    // backgroundColor: SIDEBAR.bg,
    // color: COLORS.white,
    // paddingTop: '2em',
  },
});
type IFinalProps = IProps & WithStyles<typeof styles> & RouteComponentProps<{ role: string }>;
class Sidebar extends React.PureComponent<IFinalProps> {
  componentDidMount() {
    console.log('rendered', this.props.match);
  }
  render() {
    const { classes, match } = this.props;
    const { params } = match;
    const { role } = params;
    return (
      <React.Fragment>
        <Hidden mdUp>
          <Drawer
            variant="temporary"
            // open={sidebarStore.getIsMobileSidebarOpen()}
            // onClose={sidebarStore.toggleIsMobileSidebarOpen.bind(sidebarStore)}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            <RoleSwitch />
            <Link to={`/${role}/home`}>Home</Link>
            <Link to={`/${role}/direct-swap`}>Direct</Link>
            <Link to={`/${role}/p2p-swap`}>Peer-to-Peer</Link>
            {/* <Link to={`/${role}/settings`}></Link> */}
          </Drawer>
        </Hidden>
        <Hidden smDown>
          <Drawer
            variant="permanent"
            anchor="left"
            open
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            <RoleSwitch />
            <Link to={`/${role}/home`}>Home</Link>
            <Link to={`/${role}/direct-swap`}>Direct</Link>
            <Link to={`/${role}/p2p-swap`}>Peer-to-Peer</Link>
            {/* <Link to={`/${role}/settings`}></Link> */}
          </Drawer>
        </Hidden>
      </React.Fragment>
    );
  }
}
export interface IStates {
  counter: IStoreState;
}

export function mapStateToProps({ counter }: IStates) {
  return {
    content: counter.content,
    error: counter.error,
    isFetching: counter.isFetching,
    value: counter.value,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.ClickAction>) {
  return {
    onDecrement: () => dispatch(actions.decrement()),
    onIncrement: () => dispatch(actions.increment()),
    onIncrementAsync: () => dispatch(actions.incrementAsync()),
    requestContent: () => dispatch(actions.requestContent(3)),
    requestContent2: () => dispatch(actions.requestContent(4)),
  };
}
export default connect(
  mapStateToProps, mapDispatchToProps)(withStyles(styles)(withRouter(Sidebar)));
