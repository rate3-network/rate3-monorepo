import * as React from 'react';
import { IStoreState } from '../reducers/counter';
import { withRouter } from 'react-router';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { Hidden, Drawer } from '@material-ui/core';
import { Link, RouteComponentProps } from 'react-router-dom';
import RoleSwitch from './common/RoleSwitch';
import RoleContext from './common/RoleContext';
import classnames from 'classnames';
import { ROLES } from '../constants/general';
import { SIDEBAR } from '../constants/colors';
import IssuerSidebarMenu from './issuer/IssuerSidebarMenu';
import UserSidebarMenu from './user/UserSidebarMenu';
import EthBalanceCard from '../components/common/EthBalanceCard';
import StellarBalanceCard from '../components/common/StellarBalanceCard';
import issuerLogo from '../assets/issuer_rate3_logo.svg';
import userLogo from '../assets/user_rate3_logo.svg';

const styles = createStyles({
  root: {
    backgroundColor: 'purple',
  },
  drawerPaper: {
    position: 'fixed',
    width: '25vw',
    height: '100vh',
    transition: 'background-color 0.1s ease',
  },
  issuerPaper: {
    backgroundColor: SIDEBAR.background,
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '1em 0',
    color: SIDEBAR.userTextColor,
  },
  topRowIssuer: {
    color: SIDEBAR.issuerTextColor,
  },
});

type IFinalProps = WithStyles<typeof styles> & RouteComponentProps<{ role: string }>;
class Sidebar extends React.Component<IFinalProps> {
  static contextType = RoleContext;
  state = {
    shouldRenderSidebar: true,
    unlisten: () => {}, // tslint:disable-line:no-empty
    activePath: this.props.history.location.pathname,
  };

  componentDidMount() {
    const unlisten = this.props.history.listen((location) => {
      this.setState({
        activePath: this.props.history.location.pathname,
      });
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
    this.setState({ unlisten });
    const { pathname } = this.props.history.location;
    console.log(pathname);
    if (sessionStorage.getItem('role') === 'issuer' && !pathname.includes('issuer')) {
      this.props.history.push('/issuer/home');
    }
    if (sessionStorage.getItem('role') === 'user' && !pathname.includes('user')) {
      this.props.history.push('/user/home');
    }
  }

  render() {
    const { classes, match, history } = this.props;
    const { params } = match;
    const { role } = params;
    const shouldRenderSidebarFromHistory = !history.location.pathname.includes('onboarding');
    const renderSidebarItems = () => {
      return (
        <>
          <div
            className={
              classnames(
                classes.topRow,
                { [classes.topRowIssuer]: this.context.theme === ROLES.ISSUER }
              )
            }
          >
            <img src={this.context.theme === ROLES.ISSUER ? issuerLogo : userLogo} alt="logo"/>
            <span>Cross Chain Demo</span>
          </div>
          <RoleSwitch />
          <EthBalanceCard />
          <StellarBalanceCard />
          {this.context.theme === ROLES.ISSUER &&
          <IssuerSidebarMenu activePath={this.state.activePath} />}
          {this.context.theme === ROLES.USER &&
             <UserSidebarMenu activePath={this.state.activePath} />}
        </>
      );
    };
    if (this.state.shouldRenderSidebar && shouldRenderSidebarFromHistory) {
      return (
        <>
          <Hidden mdUp>
            <Drawer
              variant="temporary"
              classes={{
                paper: classnames(
                  classes.drawerPaper,
                  { [classes.issuerPaper]: this.context.theme === ROLES.ISSUER }
                  )}}
              ModalProps={{  keepMounted: true }}
            >
              {renderSidebarItems()}
            </Drawer>
          </Hidden>
          <Hidden smDown>
            <Drawer
              variant="permanent"
              anchor="left"
              open
              classes={{
                paper: classnames(
                  classes.drawerPaper,
                  { [classes.issuerPaper]: this.context.theme === ROLES.ISSUER }
                  )}}
              ModalProps={{ keepMounted: true }}
            >
              {renderSidebarItems()}
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

export default withRouter(withStyles(styles)(Sidebar));
