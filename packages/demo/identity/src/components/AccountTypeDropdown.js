import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import KeyboardArrowDown from '@material-ui/icons/ArrowDropDown';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';

import { disabledBackgroundColor, borderColor, disabledIconColor, materialGrey } from '../constants/colors';
import MetamaskIcon from '../assets/metamask.svg';
import OnboardingWalletIcon from '../assets/BuiltInWallet.svg';


const styles = theme => ({
  box: {
    backgroundColor: 'transparent',
    color: materialGrey,
    height: '2.2em',
    width: '14.5em',
    fontWeight: '500',
    fontSize: '1em',
    borderRadius: '9px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '0.6em',
    border: `0.1em solid ${borderColor}`,
  },
  sidebarBox: {
    height: '2.3rem !important',
    width: '13.5rem !important',
    fontSize: '0.9rem !important',
  },

  disabled: {
    backgroundColor: disabledBackgroundColor,
    color: materialGrey,
    height: '2.2em',
    width: '14.5em',
    fontWeight: '500',
    fontSize: '1em',
    borderRadius: '9px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '0.6em',
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
    fontSize: '1rem',
    fontWeight: '500',
    height: '100%',
    textAlign: 'center',
    color: materialGrey,
    '&:focus': {
      backgroundColor: 'transparent',
    },
  },
  verifierSelect: {
    color: `${disabledBackgroundColor} !important`,
  },
  selectSidebar: {
    fontSize: '0.9rem !important',
  },
  menuIconWithText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  itemText: {
    whiteSpace: 'pre',
  },
  selectMenu: {
    padding: '0.83em 2.5em 0 1em',
  },
  sidebarSelectMenu: {
    padding: '0.63em 2.5em 0 1em',
  },
  selectIcon: {
    padding: '0.3em 0.5em',
  },
  selectIconDisabled: {
    padding: '0.3em 0.5em',
    color: disabledIconColor,
  },
});

const accountTypes = [
  { value: 'metamask', label: 'MetaMask' },
  { value: 'fixed', label: 'Built-in Demo Wallet' },
];
@inject('RootStore') @observer
class AccountTypeDropdown extends React.Component {
  componentDidMount() {
  }
  handleClick = (e) => {
    if (e.target.value === 'metamask') {
      this.props.RootStore.userStore.changeToMetaMaskAccount();
    } else {
      this.props.RootStore.userStore.changeToFixedAccount();
    }
    this.props.RootStore.initNetwork();

  };
  handleSidebarClick = (e) => {
    if (e.target.value === 'metamask') {
      this.props.RootStore.userStore.changeToMetaMaskAccount();
      if (this.props.isOnSidebar) {
        if (!this.props.RootStore.commonStore.isWalletSetupDone) this.props.RootStore.userStore.openReOnboardModal();
      } else {
        this.props.RootStore.initNetwork();
      }
    } else {
      this.props.RootStore.userStore.changeToFixedAccount();
      this.props.RootStore.initNetwork();
    }
    window.location.reload();
  }
  render() {
    const imgStyle = { width: '1.3em' };
    const { classes, variant, isOnSidebar, isUser } = this.props;
    if (variant === 'verifier') {
      return (
        <div
          className={classNames(classes.disabled, { [classes.sidebarBox]: isOnSidebar }, { [classes.sidebarBoxVerifier]: !isUser })}
          // className={classNames(classes.disabled)}
        >
          <FormControl className={classes.formControl}>
            <Select
              className={classes.inputRoot}
              value={'fixed'}
              input={(<Input disableUnderline />)}
              IconComponent={KeyboardArrowDown}
              disabled
              MenuProps={{
                PaperProps: {
                  square: false,
                },
              }}
              classes={{
                selectMenu: classNames({ [classes.selectMenu]: !isOnSidebar }, { [classes.sidebarSelectMenu]: isOnSidebar }),
                icon: classes.selectIconDisabled,
                select: classNames(classes.select, { [classes.selectSidebar]: isOnSidebar }),
              }}
            >
              {accountTypes.map((item) => {
                  return (
                    <MenuItem
                      key={item.value}
                      value={item.value}
                      classes={{
                        root: classes.itemRoot,
                        selected: classes.selectedItem,
                      }}
                    >
                      <div className={classes.menuIconWithText}>
                        {item.value === 'metamask' ?
                          <img style={imgStyle} src={MetamaskIcon} alt="metamask" /> :
                          <img style={imgStyle} src={OnboardingWalletIcon} alt="metamask" />}
                        <div className={classes.itemText}>  {item.label}</div>
                      </div>
                    </MenuItem>
                  );
                })
              }
            </Select>
          </FormControl>
        </div>
      );
    }
    return (
      <div
        className={classNames(classes.box, { [classes.sidebarBox]: isOnSidebar }, { [classes.sidebarBoxVerifier]: !isUser })}
      >
        <FormControl className={classes.formControl}>
          <Select
            className={classes.inputRoot}
            value={this.props.RootStore.userStore.isOnFixedAccount ? 'fixed' : 'metamask'}
            onChange={isOnSidebar ? this.handleSidebarClick : this.handleClick}
            input={(<Input disableUnderline />)}
            IconComponent={KeyboardArrowDown}
            MenuProps={{
              PaperProps: {
                square: false,
              },
            }}
            classes={{
              selectMenu: classNames({ [classes.selectMenu]: !isOnSidebar }, { [classes.sidebarSelectMenu]: isOnSidebar }),
              icon: classes.selectIcon,
              select: classNames(classes.select, { [classes.selectSidebar]: isOnSidebar }, { [classes.verifierSelect]: !isUser }),
            }}
          >
            {accountTypes.map((item) => {
                return (
                  <MenuItem
                    key={item.value}
                    value={item.value}
                    classes={{
                      root: classes.itemRoot,
                      selected: classes.selectedItem,
                    }}
                  >
                    <div className={classes.menuIconWithText}>
                      {item.value === 'metamask' ?
                        <img style={imgStyle} src={MetamaskIcon} alt="metamask" /> :
                        <img style={imgStyle} src={OnboardingWalletIcon} alt="metamask" />}
                      <div className={classes.itemText}>  {item.label}</div>
                    </div>
                  </MenuItem>
                );
              })
            }
          </Select>
        </FormControl>
      </div>
    );
  }
}

AccountTypeDropdown.propTypes = {
  classes: PropTypes.object.isRequired,
  variant: PropTypes.string.isRequired,
  isOnSidebar: PropTypes.bool,
  isUser: PropTypes.bool,
};
AccountTypeDropdown.wrappedComponent.propTypes = {
  RootStore: PropTypes.object.isRequired,
};

AccountTypeDropdown.defaultProps = {
  isOnSidebar: false,
  isUser: true,
};

export default withStyles(styles, { withTheme: true })(AccountTypeDropdown);
