import React from 'react';
import PropTypes from 'prop-types';

import Field from '../../components/Field';

class Amount extends React.Component {
  handleAmountChange = (e) => {
    const { onAmountChange } = this.props;
    if (isNaN(e.target.value)) {
      return;
    }
    onAmountChange(e.target.value);
  }

  handleKeyPress = (e) => {
    const { onSubmit } = this.props;
    if (e.key === 'Enter') {
      onSubmit(e);
    }
  }

  render() {
    const {
      amount,
      amountLabel,
      amountAdornment,
      amountError,
      message,
    } = this.props;

    return (
      <React.Fragment>
        <div>
          <Field
            isUser
            label={amountLabel}
            id="amount"
            fullWidth
            adornment={amountAdornment}
            value={amount}
            onChange={this.handleAmountChange}
            onKeyPress={this.handleKeyPress}
            error={Boolean(amountError)}
            helperText={amountError}
            autoFocus
          />
        </div>
        {message}
      </React.Fragment>
    );
  }
}

Amount.propTypes = {
  amount: PropTypes.string.isRequired,
  amountLabel: PropTypes.node.isRequired,
  amountAdornment: PropTypes.node,
  amountError: PropTypes.node,
  onAmountChange: PropTypes.func.isRequired,

  message: PropTypes.node,
  onSubmit: PropTypes.func,
};

Amount.defaultProps = {
  amountAdornment: null,
  amountError: null,
  message: null,
  onSubmit: () => null,
};

export default Amount;
