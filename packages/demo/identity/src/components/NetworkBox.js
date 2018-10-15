import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import Lens from '@material-ui/icons/Lens';
import classNames from 'classnames';
import { networkBoxBg, identityBlueLight, materialGrey, ropstenDot, rinkebyDot, kovanDot } from '../constants/colors';

const styles = (theme) => {
  return {
    box: {
      backgroundColor: networkBoxBg,
      color: materialGrey,
      height: '2.3rem',
      width: '13.5rem',
      fontWeight: '500',
      fontSize: '0.9rem',
      borderRadius: '9px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '0.5em',
    },
    ropstenDot: {
      color: `${ropstenDot} !important`,
    },
    rinkebyDot: {
      color: `${rinkebyDot} !important`,
    },
    kovanDot: {
      color: `${kovanDot} !important`,
    },
    icon: {
      height: '0.4em',
      color: identityBlueLight,
    },
    expandIcon: {
      paddingLeft: '0.5em',
      fontSize: '1.7em',
    },
  };
};
@inject('RootStore') @observer
class NetworkBox extends React.Component {
  componentDidMount() {
  }
  render() {
    const { classes } = this.props;
    return (
      <div className={classNames(
        classes.box,
        { [classes.ropsten]: this.props.RootStore.currentNetwork === 'Ropsten' },
        { [classes.rinkeby]: this.props.RootStore.currentNetwork === 'Rinkeby' },
        { [classes.kovan]: this.props.RootStore.currentNetwork === 'Kovan' },
        )}
      >
        <Lens className={classNames(
        classes.icon,
        { [classes.ropstenDot]: this.props.RootStore.currentNetwork === 'Ropsten' },
        { [classes.rinkebyDot]: this.props.RootStore.currentNetwork === 'Rinkeby' },
        { [classes.kovanDot]: this.props.RootStore.currentNetwork === 'Kovan' },
        )}
        />
        {`${this.props.RootStore.currentNetwork} Test Network`}
      </div>
    );
  }
}

NetworkBox.propTypes = {
  classes: PropTypes.object.isRequired,
};
NetworkBox.wrappedComponent.propTypes = {
  RootStore: PropTypes.object.isRequired,
};

export default withStyles(styles)(NetworkBox);
