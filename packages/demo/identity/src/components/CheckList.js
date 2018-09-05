import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';

import NetworkBox from './NetworkBox';

const styles = theme => ({
  root: {
    width: '100%',
    // maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  listItem: {
    padding: '0px 0px 0px 0px',
    margin: '1em 0em 1em 0em',
  },
  listItemButton: {
    display: 'flex',
    flexDirection: 'column',
  },
});

class CheckList extends React.Component {
  state = {
    checked: [0],
  };

  handleToggle = value => () => {
    const { checked } = this.state;
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    this.setState({
      checked: newChecked,
    });
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <List>
          {this.props.list.map(item => (
            <ListItem
              key={item.value}
              role={undefined}
              dense
              button
              onClick={this.handleToggle(item.value)}   
              disableRipple
              className={classes.listItem}
            >
              <Checkbox
                checked={this.state.checked.indexOf(item.value) !== -1}
                tabIndex={-1}
                disableRipple
              />
              <div className={classes.listItemButton}>
                {item.value}
                {item.hasStyledText && <NetworkBox />}
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
