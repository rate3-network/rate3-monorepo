import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { withRouter } from 'react-router';
import Counter from '../components/Counter';

import { RouteComponentProps } from 'react-router-dom';
// export interface IProps {
//   classes: any;
// }

const styles = createStyles({
});
const routes = [
  { path: '/counter', component: Counter },
];
type IProps = WithStyles<typeof styles> & RouteComponentProps<{ role: string }>;
class DirectSwapPage extends React.Component<IProps> {
  componentDidMount() {
    // console.log(this.props.history.location);
  }

  render() {
    console.log('swap page rendered');
    const { classes, match } = this.props;
    const { role } = match.params;
    return (
      <div>
        swap!!!!!!!!!!!!!!!!!!{role}
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(DirectSwapPage));
