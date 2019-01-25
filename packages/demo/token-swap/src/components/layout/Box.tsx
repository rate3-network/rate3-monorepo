import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import classnames from 'classnames';
import { box } from '../../constants/styles';

const styles = createStyles({
  root: {
    ...box,
  },
  fullHeight: {
    // ...box,
    height: '100%',
  },
});
interface IProps {
  children: string | Element | JSX.Element | Array<string | Element | JSX.Element>;
  fullHeight: boolean;
}
type IPropsFinal = WithStyles<typeof styles> & IProps;
class Box extends React.Component<IPropsFinal> {
  static defaultProps = { // tslint:disable-line:member-access
    fullHeight: false,
  };
  render() {
    const { classes } = this.props;
    return (
      <div
        className={classnames(
          classes.root,
          { [classes.fullHeight]: this.props.fullHeight }
        )}
      >
        {this.props.children}
      </div>
    );
  }
}

export default withStyles(styles)(Box);
