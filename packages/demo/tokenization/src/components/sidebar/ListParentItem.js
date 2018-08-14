import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { ListItem, ListItemText } from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { sidebarEmphasis, sidebarPrimaryText, sidebarHover } from '../../constants/colors';

const styles = {
  itemOpen: {
    backgroundColor: sidebarEmphasis,
  },
  item: {
    borderRadius: '0.5em',
    '&:hover': {
      backgroundColor: sidebarHover,
    },
    color: sidebarPrimaryText,
  },
  text: {
    color: 'inherit',
  },
};

const ListParentItem = ({
  classes, isOpen, onClick, primary,
}) => (
  <ListItem
    classes={{
      button: classnames(classes.item, { [classes.itemOpen]: isOpen }),
    }}
    button
    onClick={onClick}
  >
    <ListItemText
      inset
      primary={primary}
      classes={{ primary: classes.text }}
    />
    {isOpen ? <ExpandLess /> : <ExpandMore />}
  </ListItem>
);

ListParentItem.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  primary: PropTypes.string.isRequired,
};

export default withStyles(styles)(ListParentItem);
