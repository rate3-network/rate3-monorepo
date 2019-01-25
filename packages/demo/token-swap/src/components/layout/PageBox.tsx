import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { basicLayout } from '../../constants/styles';

const styles = createStyles({
  root: {
    ...basicLayout,
  },
});
interface IProps {
  children: string | Element | JSX.Element | Array<string | Element | JSX.Element>;
}
type IPropsFinal = WithStyles<typeof styles> & IProps;
class PageBox extends React.Component<IPropsFinal> {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        {this.props.children}
      </div>
    );
  }
}

export default withStyles(styles)(PageBox);
