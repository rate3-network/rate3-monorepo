import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

const SideBar = ({
  t,
}) => {
  return (
    <div>
      Hello.
      {t('test')}
    </div>
  );
};

SideBar.propTypes = {
  t: PropTypes.func.isRequired,
};

export default translate('testNS')(SideBar);
