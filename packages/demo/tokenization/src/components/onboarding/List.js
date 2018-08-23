import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Icon from '@material-ui/icons/FiberManualRecord';
import { onboardingUnorderedListBullet } from '../../constants/colors';

const styles = theme => ({
  iconRoot: {
    fontSize: '16px',
    color: onboardingUnorderedListBullet,
  },
});

const CustomList = ({ classes, children }) => (
  <List component="nav">
    {
      ((children.length === undefined) ? [children] : children).map((item, idx) => (
        <ListItem key={item.key || idx}>
          <ListItemIcon>
            <Icon classes={{ root: classes.iconRoot }} />
          </ListItemIcon>
          <ListItemText inset primary={item} />
        </ListItem>
      ))
    }
  </List>
);

CustomList.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default withStyles(styles, { withTheme: true })(CustomList);
