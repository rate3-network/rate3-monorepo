import * as React from 'react';

import Fab from '@material-ui/core/Fab';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
// import { buttonShadow, buttonHoverShadow } from '../constants/colors';
import classnames from 'classnames';
import { BLUE_BUTTON, COLORS } from '../../constants/colors';

const styles = createStyles({
  button: {
    color: BLUE_BUTTON.color,
    backgroundColor: BLUE_BUTTON.bg,
    boxShadow: BLUE_BUTTON.shadow,
    fontFamily: 'din-2014, sans-serif',
    '&:hover': {
      // boxShadow:    color: BLUE_BUTTON.color,
      backgroundColor: BLUE_BUTTON.bg,
      color: BLUE_BUTTON.color,
    },
  },
  darkBlue: {
    backgroundColor: COLORS.blue,
    '&:hover': {
      backgroundColor: COLORS.blue,
      color: BLUE_BUTTON.color,
    },
  },
  noCap: {
    textTransform: 'inherit',
  },
  outlined: {
    color: BLUE_BUTTON.bg,
    backgroundColor: BLUE_BUTTON.color,
    border: `1.5px solid ${BLUE_BUTTON.bg}`,
  },
  outlinedDarkBlue: {
    color: COLORS.blue,
    backgroundColor: BLUE_BUTTON.color,
    border: `1.5px solid ${COLORS.blue}`,
    '&:hover': {
      backgroundColor: COLORS.blue,
      color: BLUE_BUTTON.color,
    },
  },
  whitespaces: {
    whiteSpace: 'pre',
  },
  disabled: {
    boxShadow: BLUE_BUTTON.shadow,
    backgroundColor: BLUE_BUTTON.disabled,
    color: 'white !important',
  },
  root: {

  },
});

interface IProps extends WithStyles<typeof styles> {
  disabled?: boolean;
  children: string | number | React.ComponentType;
  handleClick?: () => void;
  height?: string;
  width?: string;
  fontSize?: string;
  noCap?: boolean;
  darkBlue?: boolean;
  outlined?: boolean;
  outlinedDarkBlue?: boolean;
}
class BlueButton extends React.PureComponent<IProps> {
  static defaultProps = { // tslint:disable-line:member-access
    width: '',
    height: '2rem',
    fontSize: '0.9rem',
    noCap: false,
    outlined: false,
    darkBlue: false,
    outlinedDarkBlue: false,
  };
  render() {
    const { classes } = this.props;
    return (
      <Fab
        variant="extended"
        size="large"
        // color="primary"
        disabled={this.props.disabled}
        className={
          classnames(
            classes.button,
            { [classes.noCap]: this.props.noCap },
            { [classes.outlined]: this.props.outlined },
            { [classes.darkBlue]: this.props.darkBlue },
            { [classes.outlinedDarkBlue]: this.props.outlinedDarkBlue }
          )}
        classes={{
          disabled: classes.disabled,
          root: classes.button,
        }}
        style={{
          minHeight: this.props.height,
          height: this.props.height,
          fontSize: this.props.fontSize,
          lineHeight: this.props.fontSize,
          width: this.props.width ? this.props.width : 'inherit',
          minWidth: this.props.width ? this.props.width : 'inherit',
        }}
        onClick={this.props.handleClick}
        // style={{
        //   minHeight: this.props.height,
        //   height: this.props.height,
        //   fontSize: this.props.fontSize,
        //   lineHeight: this.props.fontSize,
        // }}
      >
        {this.props.children}
      </Fab>
    );
  }

}

export default withStyles(styles)(BlueButton);
