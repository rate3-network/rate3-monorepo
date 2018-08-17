import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';

import Field from '../../components/Field';
import { tokenizeFields } from '../../actions/Tokenize';
import { compose } from '../../utils';
import { textFieldLabel } from '../../constants/colors';
import { SgdPill } from '../../components/CurrencyPill';


const styles = theme => ({
  amountRoot: {
    marginBottom: theme.spacing.unit * 3,
  },
  amountText: {
    letterSpacing: 0,
    color: textFieldLabel,
  },
  amountNumber: {
    fontWeight: 'bold',
  },
});

class Trust extends React.Component {
  handleBankChange = (e) => {
    const { setField } = this.props;
    setField(tokenizeFields.trustBank, e.target.value.trim());
  }

  handleSwiftCodeChange = (e) => {
    const { setField } = this.props;
    setField(tokenizeFields.trustSwiftCode, e.target.value.trim());
  }

  handleAccountChange = (e) => {
    const { setField } = this.props;
    setField(tokenizeFields.trustAccount, e.target.value.trim());
  }

  handleKeyPress = (e) => {
    const { onSubmit } = this.props;
    if (e.key === 'Enter') {
      onSubmit(e);
    }
  }

  render() {
    const {
      classes,
      t,
      amount,
      trustBank,
      trustSwiftCode,
      trustAccount,
    } = this.props;

    return (
      <React.Fragment>
        <div className={classes.amountRoot}>
          <div className={classes.amountText}>
            {t('amountLabel')}:
            <span className={classes.amountNumber}> {amount}</span>
            &nbsp;
            <SgdPill />
          </div>
        </div>
        <Field
          isUser
          label={t('trustBankFieldLabel')}
          id="tokenize-trust-bank"
          fullWidth
          value={trustBank}
          onChange={this.handleBankChange}
          onKeyPress={this.handleKeyPress}
          autoFocus
        />
        <Field
          isUser
          label={t('trustSwiftCodeFieldLabel')}
          id="tokenize-trust-swiftcode"
          fullWidth
          value={trustSwiftCode}
          onChange={this.handleSwiftCodeChange}
          onKeyPress={this.handleKeyPress}
        />
        <Field
          isUser
          label={t('trustAccountFieldLabel')}
          id="tokenize-trust-account"
          fullWidth
          value={trustAccount}
          onChange={this.handleAccountChange}
          onKeyPress={this.handleKeyPress}
        />
      </React.Fragment>
    );
  }
}

Trust.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  amount: PropTypes.string.isRequired,
  trustBank: PropTypes.string.isRequired,
  trustSwiftCode: PropTypes.string.isRequired,
  trustAccount: PropTypes.string.isRequired,
  setField: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
};

Trust.defaultProps = {
  onSubmit: () => null,
};

export default compose(
  translate('tokenization'),
  withStyles(styles, { withTheme: true }),
)(Trust);
