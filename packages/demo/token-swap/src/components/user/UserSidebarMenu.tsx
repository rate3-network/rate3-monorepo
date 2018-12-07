import * as React from 'react';
import { withRouter } from 'react-router';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { Link, RouteComponentProps } from 'react-router-dom';
import { SIDEBAR } from '../../constants/colors';
import classnames from 'classnames';

const styles = createStyles({
  items: {
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    padding: '0.5em 0 0.5em 2em',
    fontSize: '1.6em',
    color: SIDEBAR.userTextColor,
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  highlighted: {
    color: SIDEBAR.userTextHighlight,
    backgroundColor: SIDEBAR.userHighlightBg,
    borderLeft: `0.3em solid ${SIDEBAR.userHighlightBorderLeft}`,
    padding: '0.5em 0 0.5em 1.7em',

  },
});
interface IProps {
  activePath: string;
}
type IFinalProps = WithStyles<typeof styles> & IProps & RouteComponentProps<{ role: string }>;
class UserSidebarMenu extends React.Component<IFinalProps> {
  render() {
    const { classes, match, activePath } = this.props;
    const { params } = match;
    const { role } = params;
    const renderTab = (link, name) => {
      return (
        <Link
          className={classnames(
            classes.item,
            { [classes.highlighted]: link === activePath }
          )}
          to={link}
        >
          {name}
        </Link>
      );
    };
    return (
      <div className={classes.items}>
        {renderTab('/user/home', 'HOME')}
        {renderTab('/user/direct-swap', 'DIRECT')}
        {renderTab('/user/p2p-swap', 'PEER-TO-PEER')}
      </div>
    );
  }
}
export default withStyles(styles)(withRouter(UserSidebarMenu));
