import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Trans, translate } from 'react-i18next';

import Field from '../../components/Field';
import { SgdPill } from '../../components/CurrencyPill';
import { sgdrColor, withdrawalInfoText } from '../../constants/colors';
import { withdrawFields } from '../../actions/Withdraw';
import { compose } from '../../utils';

const styles = theme => ({
  willReceiveAmount: {
    marginTop: '-1em',
    color: withdrawalInfoText,
    letterSpacing: 0,
    wordBreak: 'break-word',
  },
});

class Amount extends React.Component {
  handleAmountChange = (e) => {
    const { setField } = this.props;
    if (isNaN(e.target.value)) {
      return;
    }
    setField(withdrawFields.amount, e.target.value);
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
    } = this.props;

    return (
      <React.Fragment>
        <Field
          isUser
          label={t('amountFieldLabel')}
          id="withdraw-amount"
          fullWidth
          adornment={<span style={{ color: sgdrColor }}>SGDR</span>}
          value={amount}
          onChange={this.handleAmountChange}
          onKeyPress={this.handleKeyPress}
          autoFocus
        />
        <div className={classes.willReceiveAmount}>
          <Trans i18nKey="receiveInReturn">
            You will receive
            {{ amount: amount || '0' }}
            <SgdPill />
            in return.
          </Trans>
        </div>
      </React.Fragment>
    );
  }
}


Amount.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  amount: PropTypes.string.isRequired,
  setField: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
};

Amount.defaultProps = {
  onSubmit: () => null,
};

export default compose(
  withStyles(styles, { withTheme: true }),
  translate('withdrawal'),
)(Amount);
