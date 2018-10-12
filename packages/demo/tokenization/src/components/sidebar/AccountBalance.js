import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { balancePendingText } from '../../constants/colors';

const styles = {
  name: {
    fontSize: '0.8em',
    whiteSpace: 'pre-line',
  },
  amount: {
    letterSpacing: 0,
    fontWeight: 'bold',
    fontSize: '1.25em',
    marginTop: '5px',
  },
  currency: {
    fontWeight: 'bold',
    fontSize: '0.8em',
  },
  pendingDotContainer: {
    position: 'relative',
  },
  pendingDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginTop: '-0.5em',
    marginRight: '-0.5em',
    userSelect: 'none',
    color: balancePendingText,
  },
  pendingAmount: {
    textTransform: 'uppercase',
    fontSize: '0.7em',
    color: balancePendingText,
    whiteSpace: 'pre-line',
    height: '3em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

const AccountBalance = ({
  classes,
  currencySymbol,
  currency,
  name,
  amount,
  pendingAmount,
  renderPending,
}) => (
  <React.Fragment>
    <div className={classes.name}>{`${name}`}</div>
    <div className={classes.amount}>
      <span className={classes.pendingDotContainer}>
        {currencySymbol}
        {amount}
        {pendingAmount && <div className={classes.pendingDot}>•</div>}
      </span>
    </div>
    <div className={classes.currency}>{currency}</div>
    <div className={classes.pendingAmount}>
      {pendingAmount && renderPending(`${pendingAmount} ${currency}`)}
    </div>
  </React.Fragment>
);

AccountBalance.propTypes = {
  classes: PropTypes.object.isRequired,
  currencySymbol: PropTypes.node,
  currency: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  amount: PropTypes.string.isRequired,
  pendingAmount: PropTypes.string,
  renderPending: PropTypes.func,
};

AccountBalance.defaultProps = {
  currencySymbol: null,
  pendingAmount: null,
  renderPending: value => null,
};

export default withStyles(styles)(AccountBalance);
