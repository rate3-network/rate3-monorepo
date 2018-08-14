import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

const Withdrawal = ({ t }) => (
  <h1>{t('withdraw')}</h1>
);

Withdrawal.propTypes = {
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
};

export default translate('withdrawal')(Withdrawal);
