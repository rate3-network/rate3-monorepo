import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

const Wallet = ({ t }) => (
  <React.Fragment>
    Wallet Component
  </React.Fragment>
);

Wallet.propTypes = {
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
};

export default translate('wallet')(Wallet);
