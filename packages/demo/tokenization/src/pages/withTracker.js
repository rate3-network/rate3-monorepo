// https://github.com/ReactTraining/react-router/issues/4278
// Basically a HOC to track routes

import React from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';

import { gaTrackingId } from '../constants/ga';
import TranslationsHandler from '../translations';

ReactGA.initialize(gaTrackingId);

const withTracker = (WrappedComponent) => {
  const trackPage = (page) => {
    ReactGA.set({ page, language: TranslationsHandler.getLanguage() });
    ReactGA.pageview(page);
  };

  const HOC = (props) => {
    const { location: { pathname } } = props;
    trackPage(pathname);

    return (
      <WrappedComponent {...props} />
    );
  };

  HOC.propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
  };

  return HOC;
};

export default withTracker;
