import * as React from 'react';

import Button from '@material-ui/core/Button';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';

import { COLORS } from '../../constants/colors';
import { title, titleWithBackBtn } from '../../constants/styles';

const styles = createStyles({
  root: {
    ...title,
  },
  rootWithBackBtn: {
    ...titleWithBackBtn,
  },
  btn: {
    fontSize: '1rem',
    color: COLORS.grey,
    cursor: 'pointer',
    fontFamily: 'din-2014',
    fontWeight: 700,
  },
  centered: {
    textAlign: 'center',
  },
});
interface IProps {
  children: string | Element | JSX.Element | Array<string | Element | JSX.Element>;
}
type IPropsFinal = WithStyles<typeof styles> & IProps;
interface IFinal extends IPropsFinal {
  withBackButton?: boolean;
  backName?: string;
  backAction?(): void;
}
class PageTitle extends React.Component<IFinal> {
  static defaultProps = {
    withBackButton: false,
    backName: '',
    backAction: () => { return; },
  };
  render() {
    const { classes, withBackButton } = this.props;
    if (withBackButton) {
      return (
        <div className={classes.rootWithBackBtn}>
          <Button className={classes.btn} onClick={this.props.backAction}>
            <span>{'< '}{this.props.backName}</span>
          </Button>
          <div className={classes.centered}>{this.props.children}</div>
          <span />
        </div>
      );
    }
    return (
      <div className={classes.root}>
        {this.props.children}
      </div>
    );
  }
}

export default withStyles(styles)(PageTitle);
