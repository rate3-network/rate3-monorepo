import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import Field from '../../components/Field';
import { withdrawFields } from '../../actions/Withdraw';
import { compose } from '../../utils';

class Gas extends React.Component {
  handleLimitChange = (e) => {
    const { setField } = this.props;
    if (isNaN(e.target.value)) {
      return;
    }
    if (e.target.value.includes('.')) {
      return;
    }
    setField(withdrawFields.gasLimit, e.target.value);
  }

  handlePriceChange = (e) => {
    const { setField } = this.props;
    if (isNaN(e.target.value)) {
      return;
    }
    if (e.target.value.includes('.')) {
      return;
    }
    setField(withdrawFields.gasPrice, e.target.value);
  }

  handleKeyPress = (e) => {
    const { onSubmit } = this.props;
    if (e.key === 'Enter') {
      onSubmit(e);
    }
  }

  render() {
    const {
      t,
      gasLimit,
      gasPrice,
    } = this.props;

    return (
      <React.Fragment>
        <Field
          isUser
          label={t('gasLimitFieldLabel')}
          id="withdraw-gas-limit"
          fullWidth
          value={gasLimit}
          adornment="UNITS"
          onChange={this.handleLimitChange}
          onKeyPress={this.handleKeyPress}
          autoFocus
        />
        <Field
          isUser
          label={t('gasPriceFieldLabel')}
          id="withdraw-gas-price"
          fullWidth
          value={gasPrice}
          adornment="GWEI"
          onChange={this.handlePriceChange}
          onKeyPress={this.handleKeyPress}
        />
      </React.Fragment>
    );
  }
}

Gas.propTypes = {
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  gasLimit: PropTypes.string.isRequired,
  gasPrice: PropTypes.string.isRequired,
  setField: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
};

Gas.defaultProps = {
  onSubmit: () => null,
};


export default compose(
  translate('withdrawal'),
)(Gas);
