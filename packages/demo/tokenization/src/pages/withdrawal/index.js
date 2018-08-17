import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

const Withdrawal = ({ t }) => (
  <React.Fragment>
    Withdraw Component
  </React.Fragment>
);

Withdrawal.propTypes = {
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
};

export default translate('withdrawal')(Withdrawal);