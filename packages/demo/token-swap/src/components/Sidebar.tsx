import * as React from 'react';
import { IStoreState } from '../reducers/counter';
import { withRouter } from 'react-router';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { Hidden, Drawer } from '@material-ui/core';
import { Link, RouteComponentProps } from 'react-router-dom';
import RoleSwitch from './common/RoleSwitch';

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
type IFinalProps = WithStyles<typeof styles> & RouteComponentProps<{ role: string }>;
class Sidebar extends React.Component<IFinalProps> {
  state = {
    shouldRenderSidebar: true,
  };

  componentDidMount() {
    this.props.history.listen((location) => {
      if (location.pathname.includes('onboarding')) {
        this.setState({
          shouldRenderSidebar: false,
        });
      } else {
        this.setState({
          shouldRenderSidebar: true,
        });
      }
    });
  }

  render() {
    const { classes, match, history } = this.props;
    const { params } = match;
    const { role } = params;
    const shouldRenderSidebarFromHistory = !history.location.pathname.includes('onboarding');
    if (this.state.shouldRenderSidebar && shouldRenderSidebarFromHistory) {
      return (
        <>
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
        </>
      );
    }
    return null;
  }
}
export interface IStates {
  counter: IStoreState;
}

export default withStyles(styles)(withRouter(Sidebar));
