import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';


const styles = {
  ring: {
    display: 'inline-block',
    position: 'relative',
    width: '64px',
    height: '64px',
    animation: 'mds-ring 12s infinite linear',

    '& div': {
      boxSizing: 'border-box',
      display: 'block',
      position: 'absolute',
      width: '51px',
      height: '51px',
      margin: '6px',
      borderWidth: '6px',
      borderStyle: 'solid',
      borderRadius: '50%',
      animation: 'mds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
      borderTopColor: '#000',
      borderRightColor: 'transparent',
      borderBottomColor: 'transparent',
      borderLeftColor: 'transparent',
    },
  },
  child1: {
    animationDelay: '-0.45s !important',
  },
  child2: {
    animationDelay: '-0.3s !important',
  },
  child3: {
    animationDelay: '-0.15s !important',
  },
  '@keyframes mds-ring': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
};

const MaterialDesignSpinner = ({
  classes,
  sizeUnit,
  size,
  marginUnit,
  margin,
  borderUnit,
  border,
  color,
}) => {
  const parentStyle = {
    width: `${size}${sizeUnit}`,
    height: `${size}${sizeUnit}`,
  };

  const childStyle = {
    width: `calc(${size}${sizeUnit} - ${2 * margin}${marginUnit})`,
    height: `calc(${size}${sizeUnit} - ${2 * margin}${marginUnit})`,
    margin: `${margin}${marginUnit}`,
    borderWidth: `${border}${borderUnit}`,
    borderTopColor: color,
  };

  return (
    <div className={classes.ring} style={parentStyle}>
      <div className={classes.child1} style={childStyle} />
      <div className={classes.child2} style={childStyle} />
      <div className={classes.child3} style={childStyle} />
      <div style={childStyle} />
    </div>
  );
};

MaterialDesignSpinner.propTypes = {
  classes: PropTypes.object.isRequired,
  sizeUnit: PropTypes.oneOf(['em', 'px', '%']),
  size: PropTypes.number,
  marginUnit: PropTypes.oneOf(['em', 'px', '%']),
  margin: PropTypes.number,
  borderUnit: PropTypes.oneOf(['em', 'px', '%']),
  border: PropTypes.number,
  color: PropTypes.string,
};

MaterialDesignSpinner.defaultProps = {
  sizeUnit: 'px',
  size: 64,
  marginUnit: 'px',
  margin: 6,
  borderUnit: 'px',
  border: 6,
  color: '#000000',
};

export default withStyles(styles)(MaterialDesignSpinner);
