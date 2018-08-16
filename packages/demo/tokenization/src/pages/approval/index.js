import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

const Approval = ({ t }) => (
  <React.Fragment>
    Approval Component
  </React.Fragment>
);

Approval.propTypes = {
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
};

export default translate('approval')(Approval);
