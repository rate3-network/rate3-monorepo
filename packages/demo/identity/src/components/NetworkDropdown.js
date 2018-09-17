import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import Typography from '@material-ui/core/Typography';
import { inject, observer } from 'mobx-react';

import {
  networkMenuButtonText,
  networkMenuItemSelectedBg,
  networkMenuItemSelectedText,
  networkBoxBg, identityBlue, materialGrey, ropstenBg, ropstenDot, rinkebyBg, rinkebyDot, kovanBg, kovanDot,
} from '../constants/colors';


const styles = theme => ({
  box: {
    backgroundColor: networkBoxBg,
    color: materialGrey,
    height: '2.6em',
    width: '14.5em',
    fontWeight: '500',
    fontSize: '0.9em',
    borderRadius: '9px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '0.5em',
  },
  selectContainer: {
    backgroundColor: 'white',
    width: '80%',
    height: '2.5em',
    marginTop: 0,
    marginBottom: 0,
    padding: '0px 0px 0px 0px',
    borderRadius: '0.5em',
    border: '0em',
    '&:focus': {
      border: `0.1em solid ${identityBlue} !important`,
      borderRadius: '0.7em',
    },
    '&:focus-within': {
      border: `0.1em solid ${identityBlue} !important`,
      borderRadius: '0.7em',
    },
  },
  formControl: {
    width: '100%',
    height: '100%',
  },
  selectedItem: {
    backgroundColor: 'inherit',
    color: 'inherit',
  },
  select: {
    fontSize: '1.1rem',
    fontWeight: '500',
    height: '100%',
    color: materialGrey,
    '&:focus': {
      backgroundColor: 'transparent',
    },
  },
});

@inject('RootStore') @observer
class NetworkDropdown extends React.Component {

  handleClick = (e) => {
    this.props.RootStore.userStore.changeFixedUserAcctNetwork(e.target.value);
  };


  render() {
    const { classes } = this.props;

    return (
      <div className={classes.box}>
        <FormControl className={classes.formControl}>
          <Select
            className={classes.select}
            value={this.props.RootStore.userStore.fixedUserAcctNetwork}
            onChange={this.handleClick}
            input={(
              <Input disableUnderline />
            )}
            MenuProps={{
              PaperProps: {
                square: false,
              },
            }}
            classes={{
              selectMenu: classes.selectMenu,
              icon: classes.selectIcon,
              root: classes.inputRoot,
              select: classes.select,
            }}
          >
            <MenuItem value="_placeholder_" disabled>
              Choose a Verifier
            </MenuItem>
            {this.props.networks.map((item) => {
                return (
                  <MenuItem
                    key={item.value}
                    value={item.value}
                    classes={{
                      root: classes.itemRoot,
                      selected: classes.selectedItem,
                    }}
                  >
                    <div className={classes.itemText}>{item.label}</div>
                  </MenuItem>
                );
              })
            }
          </Select>
        </FormControl>
      </div>
      // <div className={classes.box}>
      //   <div className={classes.networkButtonContainer}>
      //     <Button
      //       variant="contained"
      //       color="primary"
      //       disableRipple
      //       disableFocusRipple
      //       disableTouchRipple
      //       onClick={this.handleClick}
      //       classes={{
      //         root: classes.networkButtonRoot,
      //         label: classes.networkButtonLabel,
      //       }}
      //     >
      //       <div className={classes.networkBullet} />
      //       <Typography classes={{ root: classes.buttonText }}>
      //         {buttonText}
      //       </Typography>
      //       <KeyboardArrowDown />
      //     </Button>
      //   </div>
      //   <Menu
      //     id="network-selection-mnenu"
      //     anchorEl={anchorEl}
      //     open={open}
      //     onClose={this.handleClose}
      //     MenuListProps={{
      //       disablePadding: true,
      //     }}
      //     classes={{
      //       paper: classes.menuPaper,
      //     }}
      //   >
      //     {
      //       networks.map(network => (
      //         <MenuItem
      //           key={network.value}
      //           onClick={this.handleSelect(network.value)}
      //           selected={network.value === currentNetwork}
      //           classes={{
      //             selected: classes.selectedItem,
      //           }}
      //         >
      //           {network.label}
      //         </MenuItem>
      //       ))
      //     }
      //   </Menu>
      // </div>
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
