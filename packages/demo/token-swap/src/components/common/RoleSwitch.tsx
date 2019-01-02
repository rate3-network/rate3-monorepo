import * as React from 'react';
import Switch from '@material-ui/core/Switch';
import RoleContext from './RoleContext';
import { ROLES } from '../../constants/general';
import { connect } from 'react-redux';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { Dispatch } from 'redux';
import * as actions from '../../actions/network';
import { IAction } from '../../utils/general';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import { SIDEBAR } from '../../constants/colors';
import classnames from 'classnames';

const styles = createStyles({
  root: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '2rem',
    fontWeight: 700,
    letterSpacing: '1px',

    color: SIDEBAR.ROLE_SWITCH.selectedBgUser,
    backgroundColor: SIDEBAR.ROLE_SWITCH.bgUser,
  },
  rootIssuer: {
    color: SIDEBAR.issuerHighlightBg,
    backgroundColor: SIDEBAR.ROLE_SWITCH.bgIssuer,
  },
  switchBox: {
    cursor: 'pointer',
    fontSize: '1.1rem',
    width: '12rem',
    // minWidth: '12rem',
    marginTop: '1em',
    height: '1.8rem',
    borderRadius: '0.3rem',
    display: 'flex',
    flexDirection: 'row',
    fontWeight: 'bolder',
    letterSpacing: '1px',

    color: SIDEBAR.ROLE_SWITCH.color,
    border: `1px solid ${SIDEBAR.ROLE_SWITCH.color}`,
    backgroundColor: SIDEBAR.ROLE_SWITCH.bgUser,
  },
  switchBoxIssuer: {
    color: SIDEBAR.ROLE_SWITCH.color,
    border: `1px solid ${SIDEBAR.ROLE_SWITCH.color}`,
    backgroundColor: SIDEBAR.ROLE_SWITCH.bgIssuer,
  },
  itemBoxLeft: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    textAlign: 'center',
    width: '6rem',
    minWidth: '6rem',
    borderRight: `1px solid ${SIDEBAR.ROLE_SWITCH.color}`,
  },
  // itemBoxLeftIssuer: {
  //   backgroundColor:
  // },
  itemBoxRight: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    textAlign: 'center',
    width: '6em',
    // minWidth: '6em',
  },
  selected: {
    color: SIDEBAR.ROLE_SWITCH.selectedColorUser,
    border: `1px solid ${SIDEBAR.ROLE_SWITCH.selectedBgUser}`,
    borderTopLeftRadius: '0.2rem',
    borderBottomLeftRadius: '0.2rem',
    backgroundColor: SIDEBAR.ROLE_SWITCH.selectedBgUser,
  },
  selectedIssuer: {
    color: SIDEBAR.ROLE_SWITCH.selectedColorIssuer,
    backgroundColor: SIDEBAR.ROLE_SWITCH.selectedBgIssuer,
  },
});

interface IProps {
  initUser: () => void;
  initIssuer: () => void;
}
class RoleSwitch extends React.Component<IProps & WithStyles<typeof styles> & RouteComponentProps> {
  static contextType = RoleContext;
  toggle = () => {
    if (this.context.theme === ROLES.ISSUER) {
      this.props.initUser();
    } else {
      this.props.initIssuer();
    }
    this.context.setRole(
      this.context.theme === ROLES.ISSUER ? ROLES.USER : ROLES.ISSUER);
    this.props.history.push(this.context.theme === ROLES.ISSUER
      ? '/user/home' : '/issuer/home');
    sessionStorage.setItem('role', this.context.theme === ROLES.ISSUER
      ? 'user' : 'issuer');
  }

  render() {
    const { classes } = this.props;
    const { theme } = this.context;
    return (
      <div
        className={classnames(
          classes.root,
          { [classes.rootIssuer]: theme === ROLES.ISSUER }
        )}
      >
        {this.context.theme === ROLES.ISSUER ? 'Issuer' : 'User'}
          <div
            className={classnames(
              classes.switchBox,
              { [classes.switchBoxIssuer]: theme === ROLES.ISSUER }
            )}
            onClick={this.toggle}
          >
            <div
              className={classnames(
                classes.itemBoxLeft,
                { [classes.selected]: theme === ROLES.USER }
              )}
            >
              USER
            </div>
            <div
              className={classnames(
                classes.itemBoxRight,
                { [classes.selectedIssuer]: theme === ROLES.ISSUER }
              )}
            >
              ISSUER
            </div>
          </div>
      </div>
    );
  }
}

export function mapDispatchToProps(dispatch: Dispatch<IAction>) {
  return {
    initUser: () => dispatch(actions.initUser()),
    initIssuer: () => dispatch(actions.initIssuer()),
  };
}
export default connect(null, mapDispatchToProps)(withRouter(withStyles(styles)(RoleSwitch)));
