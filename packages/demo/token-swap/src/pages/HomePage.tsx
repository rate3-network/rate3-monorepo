import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { withRouter } from 'react-router';
import Counter from '../components/Counter';

import { RouteComponentProps, HashRouter, Switch, Route } from 'react-router-dom';
import RoleContext from '../components/common/RoleContext';
import { ROLES } from '../constants/general';
// export interface IProps {
//   classes: any;
// }

const styles = createStyles({
});

type IProps = WithStyles<typeof styles> & RouteComponentProps<{ role: string }>;
class HomePage extends React.Component<IProps> {
  static contextType = RoleContext;
  componentDidMount() {
    console.log(this.props.match);
    console.log(this.props.match.url);
    // console.log(this.props.history.location);
  }

  render() {
    console.log('context', this.context);
    const { classes, match } = this.props;
    // const { role } = match.params;
    return (
      <div>
        Home!
        <hr/>
        {this.context.theme === ROLES.ISSUER ? 'issuer' : 'user'}
        <button
          onClick={() => { this.context.setTheme(ROLES.ISSUER); }}
        >
          to issuer
        </button>
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(HomePage));
