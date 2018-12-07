import * as React from 'react';
import { withRouter } from 'react-router';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { Link, RouteComponentProps } from 'react-router-dom';
import { SIDEBAR } from 'src/constants/colors';
import classnames from 'classnames';

const styles = createStyles({
  items: {
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    padding: '0.5em 0 0.5em 2em',
    fontSize: '1.6em',
    color: SIDEBAR.issuerTextColor,
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  highlighted: {
    color: SIDEBAR.issuerTextHighlight,
    backgroundColor: SIDEBAR.issuerHighlightBg,
    borderLeft: `0.3em solid ${SIDEBAR.issuerHighlightBorderLeft}`,
    padding: '0.5em 0 0.5em 1.7em',

  },
});
interface IProps {
  activePath: string;
}
type IFinalProps = WithStyles<typeof styles> & IProps & RouteComponentProps<{ role: string }>;
class IssuerSidebarMenu extends React.Component<IFinalProps> {
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
        active: {activePath}
        {renderTab('/issuer/home', 'HOME')}
      </div>
    );
  }
}
export default withStyles(styles)(withRouter(IssuerSidebarMenu));
