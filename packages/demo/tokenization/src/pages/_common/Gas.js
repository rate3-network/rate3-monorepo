import React from 'react';
import PropTypes from 'prop-types';

import Field from '../../components/Field';

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

  render() {
    const {
      isUser,
      gasLimit,
      gasLimitLabel,
      gasLimitAdornment,
      gasPrice,
      gasPriceLabel,
      gasPriceAdornment,
    } = this.props;

    return (
      <React.Fragment>
        <Field
          isUser={isUser}
          label={gasLimitLabel}
          id="gas-limit"
          fullWidth
          value={gasLimit}
          adornment={gasLimitAdornment}
          onChange={this.handleLimitChange}
          onKeyPress={this.handleKeyPress}
          // disabled
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
  isUser: PropTypes.bool.isRequired,

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


export default Gas;
