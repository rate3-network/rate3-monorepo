import React from 'react';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { createStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import { ETHERSCAN, STEEXP } from '../../constants/defaults';
// import { copyToClipboard } from '../../utils/general';
const styles = createStyles({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: '1em',
    whiteSpace: 'pre',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '50em',
    // width: '50em',
  },
  children: {
    cursor: 'pointer',
    textDecoration: 'underline',
  },
});
interface IProps extends WithStyles<typeof styles> {
  children: JSX.Element;
  popoverText: string;
  isAddress?: boolean;
}

class MouseOverPopover extends React.Component<IProps> {
  defaultProps = {
    isAddress: false,
  };
  handleClick = () => {
    if (this.props.popoverText.startsWith('0x') || this.props.popoverText.startsWith('0X')) {
      window.open(`${ETHERSCAN}/search?q=${this.props.popoverText}`);
    } else {
      const type = this.props.isAddress ? 'account' : 'tx';
      window.open(`${STEEXP}/${type}/${this.props.popoverText}`);
    }
  }
  render() {
    const { classes } = this.props;

    return (
      <div>
        <Tooltip
          interactive
          classes={{ tooltip: classes.paper, }}
          title={
            <span>
              {this.props.popoverText}
            </span>}
        >
          <span
            onClick={this.handleClick}
            className={classes.children}
          >
            {this.props.children}
          </span>
        </Tooltip>
      </div>
    );
  }
}

export default withStyles(styles)(MouseOverPopover);
