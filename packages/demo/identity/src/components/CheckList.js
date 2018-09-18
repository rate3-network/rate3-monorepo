import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import { observer, inject } from 'mobx-react';

import SelectedBox from '../assets/selectedBox.svg';
import UnselectedBox from '../assets/unselectedBox.svg';
import NetworkBox from './NetworkBox';
import NetworkDropdown from './NetworkDropdown';

const styles = theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  listItem: {
    padding: '0px 0px 0px 0px',
    margin: '0.5em 0em 0.5em 0em',
    alignItems: 'flex-start',
  },
  listItemButton: {
    display: 'flex',
    flexDirection: 'column',
  },
  checkboxIcon: {
    height: '1em',
  },
  checkboxRoot: {
    display: 'flex',
    alignItems: 'flex-start',
  },
});

@inject('RootStore') @observer
class CheckList extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <List>
          {this.props.list.map((item, id) => (
            <ListItem
              key={item.value}
              dense
              className={classes.listItem}
            >
              <Checkbox
                checked={this.props.RootStore.commonStore.getSetupWalletProgress(id)}
                checkedIcon={<img src={SelectedBox} alt="finished" className={classes.checkboxIcon} />}
                icon={<img src={UnselectedBox} alt="not finished" className={classes.checkboxIcon} />}
                classes={{ root: classes.checkboxRoot }}
                disableRipple
              />
              <div className={classes.listItemButton}>
                {item.value}
                {this.props.RootStore.commonStore.shouldUseCommonNetwork ?
                  item.hasStyledText && <NetworkDropdown buttonText="text" /> :
                  item.hasStyledText && <NetworkBox />
                }
              </div>
            </ListItem>
          ))}
        </List>
      </div>
    );
  }
}

CheckList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CheckList);
