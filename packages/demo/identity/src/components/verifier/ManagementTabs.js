import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

import { searchBarButtonColor, toggleGrey, identityHeavyGrey, tabsUnselectedText, rippleColor } from '../../constants/colors';
import PendingUserTable from './PendingUserTable';

function TabContainer({ children, dir }) {
  return (
    <div>
      {children}
    </div>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  dir: PropTypes.string.isRequired,
};

const styles = theme => ({
  root: {
    marginTop: '2em',
    flexGrow: 1,
    backgroundColor: toggleGrey,
    borderRadius: '0.7em 0.7em 0.7em 0.7em',
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
let counter = 100;
function createData(blockie, address) {
  counter += 1;
  return { blockie, address: `${address}-${counter}` };
}
class ManagementTabs extends React.Component {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  render() {
    console.log('rendered');
    const { classes, theme } = this.props;
    const pendingUserList = [createData('bl', 'add'),createData('bl', 'add'),createData('bl', 'add'),createData('bl', 'add'),createData('bl', 'add'),createData('bl', 'add'),createData('bl', 'add'),createData('bl', 'add'),createData('bl', 'add'),createData('bl', 'add'),createData('bl', 'add'),createData('bl', 'add'),createData('bl', 'add'),createData('bl', 'add'),createData('bl', 'add'),createData('bl', 'add')];
    return (
      <div className={classes.root}>

        <Tabs
          value={this.state.value}
          onChange={this.handleChange}
          indicatorColor="primary"
          fullWidth
          classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
        >
          <Tab TouchRippleProps={{ classes: { ripple: classes.ripple } }} classes={{ root: classes.tabRoot, selected: classes.tabSelected, label: classes.label }} label="Request Pending" />
          <Tab TouchRippleProps={{ classes: { ripple: classes.ripple } }} classes={{ root: classes.tabRoot, selected: classes.tabSelected, label: classes.label }} label="Verified by Me" />
        </Tabs>

        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={this.state.value}
          onChangeIndex={this.handleChangeIndex}
        >
          <TabContainer dir={theme.direction}>
            <PendingUserTable pendingList={pendingUserList} />
          </TabContainer>
          <TabContainer dir={theme.direction}>Item Two</TabContainer>
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
