import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import KeyboardArrowDown from '@material-ui/icons/ArrowDropDown';
import { inject, observer } from 'mobx-react';
import Lens from '@material-ui/icons/Lens';
import classNames from 'classnames';

import { networkBoxBg, disabledBackgroundColor, borderColor, materialGrey, ropstenBg, ropstenDot, rinkebyBg, rinkebyDot, kovanBg, kovanDot } from '../constants/colors';


const styles = theme => ({
  box: {
    backgroundColor: 'transparent',
    color: materialGrey,
    height: '1.8em',
    width: '11.5em',
    fontWeight: '500',
    fontSize: '1em',
    borderRadius: '9px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '0.5em',
    border: `0.09em solid ${borderColor}`,
  },
  sidebarBox: {
    height: '2.3rem !important',
    width: '13.5rem !important',
    fontSize: '0.9rem !important',
  },
  sidebarBoxVerifier: {
    border: `0.1em solid ${disabledBackgroundColor}`,
    color: `${disabledBackgroundColor} !important`,
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
  ropsten: {
    backgroundColor: `${ropstenBg} !important`,
  },
  rinkeby: {
    backgroundColor: `${rinkebyBg} !important`,
  },
  kovan: {
    backgroundColor: `${kovanBg} !important`,
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
  },
  verifierIcon: {
    color: `${disabledBackgroundColor} !important`,
  },
  menuIconWithText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectMenu: {
    padding: '0.65em 2.5em 0 0',
  },
  selectIcon: {
    padding: '0.15em 0.5em',
  },
});

const networkList = [
  { value: 'Rinkeby', label: 'Rinkeby Test Net' },
  { value: 'Ropsten', label: 'Ropsten Test Net' },
  { value: 'Kovan', label: 'Kovan Test Net' },
];
@inject('RootStore') @observer
class NetworkDropdown extends React.Component {
  componentDidMount() {
  }
  handleClick = (e) => {
    if (this.props.RootStore.commonStore.commonNetwork === e.target.value) return;
    this.props.RootStore.commonStore.changeCommonNetwork(e.target.value);
    this.props.RootStore.initNetwork();
    window.location.reload();
  };


  render() {
    const { classes, isOnSidebar, isUser } = this.props;

    return (
      <div
        className={classNames(classes.box, { [classes.sidebarBox]: isOnSidebar }, { [classes.sidebarBoxVerifier]: !isUser })}
      >
        <FormControl className={classes.formControl}>
          <Select
            className={classes.inputRoot}
            value={this.props.RootStore.commonStore.getCommonNetwork()}
            onChange={this.handleClick}
            input={(<Input disableUnderline />)}
            IconComponent={KeyboardArrowDown}
            MenuProps={{
              PaperProps: {
                square: false,
              },
            }}
            classes={{
              selectMenu: classNames(classes.selectMenu, { [classes.verifierSelect]: !isUser }),
              icon: classNames(classes.selectIcon, { [classes.verifierIcon]: !isUser }),
              select: classes.select,
            }}
          >
            {networkList.map((item) => {
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
                      <Lens className={classNames(
                      classes.icon,
                      { [classes.ropstenDot]: item.value === 'Ropsten' },
                      { [classes.rinkebyDot]: item.value === 'Rinkeby' },
                      { [classes.kovanDot]: item.value === 'Kovan' },
                      )}
                      />
                      <div className={classes.itemText}>{item.label}</div>
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

NetworkDropdown.propTypes = {
  classes: PropTypes.object.isRequired,
  isUser: PropTypes.bool,
};
NetworkDropdown.wrappedComponent.propTypes = {
  RootStore: PropTypes.object.isRequired,
};

NetworkDropdown.defaultProps = {
  isUser: true,
};

export default withStyles(styles, { withTheme: true })(NetworkDropdown);
