import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { ListItem, ListItemText } from '@material-ui/core';
import { sidebarHover, sidebarPrimaryText } from '../../constants/colors';

const styles = {
  link: {
    textDecoration: 'none',
    color: sidebarPrimaryText,
  },
  item: {
    color: 'inherit',
    borderRadius: '0.5em',
    '&:hover': {
      color: sidebarHover,
    },
  },
  text: {
    color: 'inherit',
  },
};

const ListChildLinkItem = ({ classes, to, primary }) => (
  <Link to={to} className={classes.link}>
    <ListItem classes={{ button: classes.item }} button>
      <ListItemText
        inset
        primary={primary}
        classes={{ primary: classes.text }}
      />
    </ListItem>
  </Link>
);

ListChildLinkItem.propTypes = {
  classes: PropTypes.object.isRequired,
  to: PropTypes.string.isRequired,
  primary: PropTypes.string.isRequired,
};

export default withStyles(styles)(ListChildLinkItem);
