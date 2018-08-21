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
import { genStyle } from '../../utils';

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
    padding: theme.spacing.unit * 3,
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
    className={isUser ? classes.userLink : classes.trusteeLink}
    activeClassName={isUser ? classes.userActiveLink : classes.trusteeActiveLink}
  >
    <ListItem classes={{ button: isUser ? classes.userItem : classes.trusteeItem }} button>
      <div className={
        `nav-highlight ${isUser ? classes.userHighlight : classes.trusteeHighlight}`
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
