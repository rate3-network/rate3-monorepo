import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

const Wallet = ({ t }) => (
  <h1>{t('walletSettings')}</h1>
);

Wallet.propTypes = {
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
};

export default translate('wallet')(Wallet);
