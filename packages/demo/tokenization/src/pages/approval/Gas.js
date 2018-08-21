import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import Field from '../../components/Field';
import { tokenizeFields } from '../../actions/Tokenize';
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
    setField(tokenizeFields.gasLimit, e.target.value);
  }

  handlePriceChange = (e) => {
    const { setField } = this.props;
    if (isNaN(e.target.value)) {
      return;
    }
    if (e.target.value.includes('.')) {
      return;
    }
    setField(tokenizeFields.gasPrice, e.target.value);
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
          isUser={false}
          label={t('gasLimitFieldLabel')}
          id="approval-gas-limit"
          fullWidth
          value={gasLimit}
          adornment="UNITS"
          onChange={this.handleLimitChange}
          onKeyPress={this.handleKeyPress}
          autoFocus
        />
        <Field
          isUser={false}
          label={t('gasPriceFieldLabel')}
          id="approval-gas-price"
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
  translate('approval'),
)(Gas);
