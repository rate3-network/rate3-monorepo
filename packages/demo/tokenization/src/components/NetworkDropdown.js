import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import Typography from '@material-ui/core/Typography';

import {
  networkMenuButtonText,
  networkMenuItemSelectedBg,
  networkMenuItemSelectedText,
} from '../constants/colors';

const styles = theme => ({
  networkButtonContainer: {
    borderRadius: '0.5em',
    width: '280px',
  },
  networkButtonRoot: {
    height: '3em',
    width: '100%',
    backgroundColor: 'unset',
    boxShadow: 'none',
    color: networkMenuButtonText,
    '&:hover': {
      backgroundColor: 'unset',
      boxShadow: 'none',
    },
    '&:focus': {
      backgroundColor: 'unset',
      boxShadow: 'none',
    },
    '&:active': {
      backgroundColor: 'unset',
      boxShadow: 'none',
    },
  },
  networkButtonLabel: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  networkBullet: {
    height: 10,
    width: 10,
    marginRight: theme.spacing.unit * 2,
    borderRadius: '50%',
  },
  buttonText: {
    flexGrow: 1,
    textTransform: 'none',
    textAlign: 'left',
  },
  menuPaper: {
    width: '280px',
    borderRadius: '0.5em',
  },
  selectedItem: {
    backgroundColor: `${networkMenuItemSelectedBg} !important`,
    color: networkMenuItemSelectedText,
  },
});

class NetworkDropdown extends React.Component {
  state = {
    anchorEl: null,
  };

  handleClick = (event) => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  handleClose = () => {
    this.setState({
      anchorEl: null,
    });
  };

  handleSelect = networkId => () => {
    const { onChange } = this.props;
    onChange(networkId);
    this.handleClose();
  }

  render() {
    const {
      classes,
      buttonText,
      networks,
      currentNetwork,
    } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div>
        <div className={classes.networkButtonContainer}>
          <Button
            variant="contained"
            color="primary"
            disableRipple
            disableFocusRipple
            disableTouchRipple
            onClick={this.handleClick}
            classes={{
              root: classes.networkButtonRoot,
              label: classes.networkButtonLabel,
            }}
          >
            <div className={classes.networkBullet} />
            <Typography classes={{ root: classes.buttonText }}>
              {buttonText}
            </Typography>
            <KeyboardArrowDown />
          </Button>
        </div>
        <Menu
          id="network-selection-mnenu"
          anchorEl={anchorEl}
          open={open}
          onClose={this.handleClose}
          MenuListProps={{
            disablePadding: true,
          }}
          classes={{
            paper: classes.menuPaper,
          }}
        >
          {
            networks.map(network => (
              <MenuItem
                key={network.value}
                onClick={this.handleSelect(network.value)}
                selected={network.value === currentNetwork}
                classes={{
                  selected: classes.selectedItem,
                }}
              >
                {network.label}
              </MenuItem>
            ))
          }
        </Menu>
      </div>
    );
  }
}

NetworkDropdown.propTypes = {
  classes: PropTypes.object.isRequired,
  buttonText: PropTypes.node.isRequired,
  onChange: PropTypes.func,
  currentNetwork: PropTypes.any.isRequired,
  networks: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.node.isRequired,
    value: PropTypes.any.isRequired,
  })).isRequired,
};

NetworkDropdown.defaultProps = {
  onChange: () => null,
};

export default withStyles(styles, { withTheme: true })(NetworkDropdown);
