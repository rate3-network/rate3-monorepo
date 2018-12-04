import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { withRouter } from 'react-router';
import Counter from '../components/Counter';

import { RouteComponentProps, HashRouter, Switch, Route } from 'react-router-dom';
// export interface IProps {
//   classes: any;
// }

const styles = createStyles({
});
const routes = [
  { path: '/counter', component: Counter },
];
type IProps = WithStyles<typeof styles> & RouteComponentProps<{ role: string }>;
class HomePage extends React.PureComponent<IProps> {
  public componentDidMount() {
    console.log(this.props.match);
    console.log(this.props.match.url);
    // console.log(this.props.history.location);
  }

  public render() {
    const { classes, match } = this.props;
    const { role } = match.params;
    return (
      <div>
        home!!!!!!!!!!!!!!!!!!{role}
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(HomePage));
