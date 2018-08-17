import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { translate } from 'react-i18next';

import { compose } from '../../utils';

const styles = theme => ({
});

const Completion = ({
  classes,
  t,
}) => (
  <React.Fragment>
    Some other stuff
  </React.Fragment>
);

Completion.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
};

export default compose(
  withStyles(styles, { withTheme: true }),
  translate('tokenization'),
)(Completion);
