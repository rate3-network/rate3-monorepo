import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import blockies from 'ethereum-blockies';
import { withStyles } from '@material-ui/core/styles';
import ArrowRightAlt from '@material-ui/icons/ArrowRightAlt';

import Field from '../../components/Field';

import {
  networkRopstenBullet,
  networkRopstenBg,
  networkRinkebyBullet,
  networkRinkebyBg,
  networkKovanBullet,
  networkKovanBg,
  networkLocalhostBullet,
  networkLocalhostBg,
} from '../../constants/colors';
import { compose } from '../../utils';
import { ropsten, rinkeby, kovan } from '../../constants/addresses';
import { EtherscanAddrLink } from '../../components/EtherscanLink';

const styles = theme => ({
  baseNetwork: {
    borderRadius: '0.5em',
    width: '280px',
    height: '3em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'left',
    marginBottom: '0.5em',
  },
  networkBullet: {
    height: 10,
    width: 10,
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    borderRadius: '50%',
  },
  addresses: {
    display: 'flex',
    alignItems: 'center',
    color: '#858585',
    marginBottom: '2em',
    marginLeft: '0.5em',
  },
  addressArrow: {
    marginLeft: '0.5em',
    marginRight: '0.5em',
  },
  addressContainer: {
    width: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  blockie: {
    width: '1em',
    height: '1em',
    borderRadius: '0.5em',
    marginRight: '0.5em',
  },
  ropstenBullet: {
    backgroundColor: networkRopstenBullet,
  },
  ropstenBg: {
    backgroundColor: networkRopstenBg,
  },
  rinkebyBullet: {
    backgroundColor: networkRinkebyBullet,
  },
  rinkebyBg: {
    backgroundColor: networkRinkebyBg,
  },
  kovanBullet: {
    backgroundColor: networkKovanBullet,
  },
  kovanBg: {
    backgroundColor: networkKovanBg,
  },
  localhostBullet: {
    backgroundColor: networkLocalhostBullet,
  },
  localhostBg: {
    backgroundColor: networkLocalhostBg,
  },
});


class Gas extends React.Component {
  handleLimitChange = (e) => {
    const { onGasLimitChange } = this.props;
    if (isNaN(e.target.value)) {
      return;
    }
    if (e.target.value.includes('.')) {
      return;
    }
    onGasLimitChange(e.target.value);
  }

  handlePriceChange = (e) => {
    const { onGasPriceChange } = this.props;
    if (isNaN(e.target.value)) {
      return;
    }
    if (e.target.value.includes('.')) {
      return;
    }
    onGasPriceChange(e.target.value);
  }

  handleKeyPress = (e) => {
    const { onSubmit } = this.props;
    if (e.key === 'Enter') {
      onSubmit(e);
    }
  }

  renderNetwork(networkId) {
    const { classes, t } = this.props;

    let currentNetworkName;
    let bulletClass = `${classes.networkBullet} `;
    let networkClass = `${classes.baseNetwork} `;
    switch (networkId) {
      case ropsten.id:
        currentNetworkName = t('ropsten');
        networkClass += classes.ropstenBg;
        bulletClass += classes.ropstenBullet;
        break;
      case rinkeby.id:
        currentNetworkName = t('rinkeby');
        networkClass += classes.rinkebyBg;
        bulletClass += classes.rinkebyBullet;
        break;
      case kovan.id:
        currentNetworkName = t('kovan');
        networkClass += classes.kovanBg;
        bulletClass += classes.kovanBullet;
        break;
      default:
        currentNetworkName = t('localhost');
        networkClass += classes.localhostBg;
        bulletClass += classes.localhostBullet;
    }

    return (
      <div className={networkClass}>
        <div className={bulletClass} />
        <div>{currentNetworkName}</div>
      </div>
    );
  }

  render() {
    const {
      classes,
      isUser,
      networkId,
      fromAddr,
      toAddr,
      gasLimit,
      gasLimitLabel,
      gasLimitAdornment,
      gasPrice,
      gasPriceLabel,
      gasPriceAdornment,
    } = this.props;

    return (
      <React.Fragment>
        <div>
          {this.renderNetwork(networkId)}
          <div className={classes.addresses}>
            <img
              className={classes.blockie}
              src={
                blockies.create({
                  seed: fromAddr,
                  size: 8,
                }).toDataURL()
              }
              alt=""
            />
            <div className={classes.addressContainer}>
              <EtherscanAddrLink
                networkId={networkId}
                addr={fromAddr}
                disableUnderline
              />
            </div>
            <div className={classes.addressArrow}>
              <ArrowRightAlt />
            </div>
            <div className={classes.addressContainer}>
              <EtherscanAddrLink
                networkId={networkId}
                addr={toAddr}
                disableUnderline
              />
            </div>
          </div>
        </div>
        <Field
          isUser={isUser}
          label={gasLimitLabel}
          id="gas-limit"
          fullWidth
          value={gasLimit}
          adornment={gasLimitAdornment}
          onChange={this.handleLimitChange}
          onKeyPress={this.handleKeyPress}
          disabled
          autoFocus
        />
        <Field
          isUser={isUser}
          label={gasPriceLabel}
          id="gas-price"
          fullWidth
          value={gasPrice}
          adornment={gasPriceAdornment}
          onChange={this.handlePriceChange}
          onKeyPress={this.handleKeyPress}
          // disabled
        />
      </React.Fragment>
    );
  }
}

Gas.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC

  isUser: PropTypes.bool.isRequired,
  networkId: PropTypes.number.isRequired,

  fromAddr: PropTypes.string.isRequired,
  toAddr: PropTypes.string.isRequired,

  gasLimit: PropTypes.string.isRequired,
  gasLimitLabel: PropTypes.node.isRequired,
  gasLimitAdornment: PropTypes.node,
  onGasLimitChange: PropTypes.func.isRequired,

  gasPrice: PropTypes.string.isRequired,
  gasPriceLabel: PropTypes.node.isRequired,
  gasPriceAdornment: PropTypes.node,
  onGasPriceChange: PropTypes.func.isRequired,

  onSubmit: PropTypes.func,
};

Gas.defaultProps = {
  gasLimitAdornment: 'UNITS',
  gasPriceAdornment: 'GWEI',
  onSubmit: () => null,
};

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  translate('wallet'),
);

export default enhance(Gas);
