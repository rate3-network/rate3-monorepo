import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { compose } from '../../utils';

const styles = theme => ({
});

class Tokenization extends React.Component {
  state = {}

  render() {
    return (
      <React.Fragment>
        Tokenization Component
      </React.Fragment>
    );
  }
}

Tokenization.propTypes = {
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
};

const mapStateToProps = state => ({
});

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  translate('tokenization'),
  connect(mapStateToProps),
);

export default enhance(Tokenization);
