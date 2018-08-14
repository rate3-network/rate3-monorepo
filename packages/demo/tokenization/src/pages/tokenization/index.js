import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

const Tokenization = ({ t }) => (
  <h1>{t('tokenize')}</h1>
);

Tokenization.propTypes = {
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
};

export default translate('tokenization')(Tokenization);
