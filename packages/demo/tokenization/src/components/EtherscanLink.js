import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { withStyles } from '@material-ui/core/styles';
import { contractAddresses } from '../constants/addresses';

const styles = {
  anchor: {
    color: 'inherit',
  },
  disableUnderline: {
    textDecoration: 'none',
  },
};

const etherscanTxnLink = ({
  classes,
  networkId,
  hash,
  disableUnderline,
}) => {
  const { etherscanTx } = Object
    .prototype
    .hasOwnProperty
    .call(contractAddresses, networkId)
    ? contractAddresses[networkId]
    : {};

  if (!etherscanTx) {
    return <a title={hash}>{hash}</a>;
  }

  return (
    <a
      href={`${etherscanTx}${hash}`}
      title={hash}
      target="_blank"
      rel="noopener noreferrer"
      className={classnames([
        classes.anchor,
        { [classes.disableUnderline]: disableUnderline },
      ])}
    >
      {hash}
    </a>
  );
};

etherscanTxnLink.propTypes = {
  classes: PropTypes.object.isRequired,
  networkId: PropTypes.number.isRequired,
  hash: PropTypes.string.isRequired,
  disableUnderline: PropTypes.bool,
};

etherscanTxnLink.defaultProps = {
  disableUnderline: false,
};

export const EtherscanTxnLink = (withStyles(styles))(etherscanTxnLink);

const etherscanAddrLink = ({
  classes,
  networkId,
  addr,
  disableUnderline,
}) => {
  const { etherscanAddr } = Object
    .prototype
    .hasOwnProperty
    .call(contractAddresses, networkId)
    ? contractAddresses[networkId]
    : {};

  if (!etherscanAddr) {
    return <a title={addr}>{addr}</a>;
  }

  return (
    <a
      href={`${etherscanAddr}${addr}`}
      title={addr}
      target="_blank"
      rel="noopener noreferrer"
      className={classnames([
        classes.anchor,
        { [classes.disableUnderline]: disableUnderline },
      ])}
    >
      {addr}
    </a>
  );
};

etherscanAddrLink.propTypes = {
  classes: PropTypes.object.isRequired,
  networkId: PropTypes.number.isRequired,
  addr: PropTypes.string.isRequired,
  disableUnderline: PropTypes.bool,
};

etherscanAddrLink.defaultProps = {
  disableUnderline: false,
};

export const EtherscanAddrLink = (withStyles(styles))(etherscanAddrLink);
