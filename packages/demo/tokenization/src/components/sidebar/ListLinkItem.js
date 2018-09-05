import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { ListItem, ListItemText } from '@material-ui/core';
import {
  trusteeNavEmphasisPrimary,
  trusteeNavEmphasisSecondary,
  trusteeNavPrimary,
  userNavEmphasisPrimary,
  userNavEmphasisSecondary,
  userNavPrimary,
} from '../../constants/colors';
import { genStyle, getClass } from '../../utils';

const styles = theme => ({
  ...genStyle('link', isUser => ({
    textDecoration: 'none',
    color: isUser ? userNavPrimary : trusteeNavPrimary,
  })),
  ...genStyle('activeLink', isUser => ({
    backgroundColor: isUser ? userNavEmphasisPrimary : trusteeNavEmphasisPrimary,
    '& .nav-highlight': {
      display: 'block !important',
    },
  })),
  ...genStyle('highlight', isUser => ({
    backgroundColor: isUser ? userNavEmphasisSecondary : trusteeNavEmphasisSecondary,
    position: 'absolute',
    left: 0,
    width: '8px',
    height: '100%',
    display: 'none',
  })),
  ...genStyle('item', isUser => ({
    color: 'inherit',
    backgroundColor: 'inherit',
    textAlign: 'center',
    minHeight: '4em',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px`,
    '&:hover': {
      backgroundColor: 'inherit',
    },
  })),
  text: {
    color: 'inherit',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: '1.25em',
  },
});

const ListLinkItem = ({
  classes,
  to,
  primary,
  isUser,
}) => (
  <NavLink
    to={to}
    className={getClass(classes, 'link', isUser)}
    activeClassName={getClass(classes, 'activeLink', isUser)}
  >
    <ListItem classes={{ button: getClass(classes, 'item', isUser) }} button>
      <div className={
        `nav-highlight ${getClass(classes, 'highlight', isUser)}`
      }
      />
      <ListItemText
        primary={primary}
        classes={{ primary: classes.text }}
      />
    </ListItem>
  </NavLink>
);

ListLinkItem.propTypes = {
  classes: PropTypes.object.isRequired,
  to: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]).isRequired,
  primary: PropTypes.string.isRequired,
  isUser: PropTypes.bool.isRequired,
};

export default withStyles(styles, { withTheme: true })(ListLinkItem);
