import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { inject, observer } from 'mobx-react';

import { modalShadow, searchBarButtonColor, toggleGrey, identityHeavyGrey, tabsUnselectedText, rippleColor } from '../../constants/colors';
import PendingUserTable from './PendingUserTable';

const styles = theme => ({
  root: {
    marginTop: '2em',
    flexGrow: 1,
    backgroundColor: toggleGrey,
    borderRadius: '0.7em 0.7em 0.7em 0.7em',
    boxShadow: modalShadow,
  },
  swiper: {
    borderRadius: '0em 0em 0.7em 0.7em',
  },
  tabsRoot: {
    borderRadius: '0.7em 0.7em 0 0',
  },
  tabsIndicator: {
    backgroundColor: '#1890ff',
  },
  label: {
    fontSize: '1.4em',
  },
  tabRoot: {
    // minWidth: 72,
    textTransform: 'none',
    fontWeight: 'bold',
    // fontSize: '2em !important',
    backgroundColor: toggleGrey,
    color: tabsUnselectedText,
    // marginRight: theme.spacing.unit * 4,
    '&:hover': {
      color: searchBarButtonColor,
      opacity: 1,
    },
    '&$tabSelected': {
      color: identityHeavyGrey,
      backgroundColor: 'white',
    },
  },
  tabSelected: {},
  tabsIndicator: {
    display: 'none',
  },
  typography: {
    padding: theme.spacing.unit * 3,
  },
  ripple: {
    color: rippleColor,
    backgroundColor: rippleColor,
  },
});

function createData(blockie, address, num) {
  let counter = 0;
  const result = [];
  for (let i = 0; i < num; i += 1) {
    counter += 1;
    result.push({ blockie, address: `${address}-${counter}` });
  }
  return result;
}

@inject('RootStore') @observer
class ManagementTabs extends React.Component {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.props.RootStore.verifierStore.setCurrentTab(value);
  };

  handleChangeIndex = (index) => {
    this.props.RootStore.verifierStore.setCurrentTab(index);
  };

  render() {
    const { classes, theme } = this.props;
    const pendingUserList = createData('pic-', 'address', 3);
    const verifiedUserList = createData('pic-', 'verified', 13);
    const value = this.props.RootStore.verifierStore.getCurrentTab();
    return (
      <div className={classes.root}>

        <Tabs
          value={value}
          onChange={this.handleChange}
          indicatorColor="primary"
          fullWidth
          classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
        >
          <Tab TouchRippleProps={{ classes: { ripple: classes.ripple } }} classes={{ root: classes.tabRoot, selected: classes.tabSelected, label: classes.label }} label="Request Pending" />
          <Tab TouchRippleProps={{ classes: { ripple: classes.ripple } }} classes={{ root: classes.tabRoot, selected: classes.tabSelected, label: classes.label }} label="Verified by Me" />
        </Tabs>

        <SwipeableViews
          className={classes.swiper}
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={value}
          onChangeIndex={this.handleChangeIndex}
        >
          <div>
            {value === 0 && <PendingUserTable pendingList={pendingUserList} />}
          </div>
          <div>
            {value === 1 && <PendingUserTable pendingList={verifiedUserList} />}
          </div>
        </SwipeableViews>
      </div>
    );
  }
}

ManagementTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(ManagementTabs);
