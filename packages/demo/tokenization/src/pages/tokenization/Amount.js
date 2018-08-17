import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import Field from '../../components/Field';
import { tokenizeFields } from '../../actions/Tokenize';
import { compose } from '../../utils';
import { sgdColor } from '../../constants/colors';

class Amount extends React.Component {
  handleAmountChange = (e) => {
    const { setField } = this.props;
    if (isNaN(e.target.value)) {
      return;
    }
    setField(tokenizeFields.amount, e.target.value);
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
      amount,
    } = this.props;

    return (
      <React.Fragment>
        <Field
          isUser
          label={t('amountFieldLabel')}
          id="tokenize-amount"
          fullWidth
          adornment={<span style={{ color: sgdColor }}>SGD</span>}
          value={amount}
          onChange={this.handleAmountChange}
          onKeyPress={this.handleKeyPress}
          autoFocus
        />
      </React.Fragment>
    );
  }
}


Amount.propTypes = {
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  amount: PropTypes.string.isRequired,
  setField: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
};

Amount.defaultProps = {
  onSubmit: () => null,
};

export default compose(
  translate('tokenization'),
)(Amount);
