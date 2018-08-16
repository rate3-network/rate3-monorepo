import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

const Transactions = ({ t }) => (
  <React.Fragment>
    Transactions Component
  </React.Fragment>
);

Transactions.propTypes = {
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
};

export default translate('transactions')(Transactions);
