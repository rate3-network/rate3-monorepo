import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import { homeTextGreyVerifier, searchBarShadow, searchBarButtonColor, buttonShadow, buttonHoverShadow } from '../../constants/colors';

const styles = (theme) => {
  return ({
    container: {
      width: '100%',
      height: '2em',
    },
    textField: {
      backgroundColor: 'white',
      width: '80%',
      height: '2.2em',
      marginTop: 0,
      marginBottom: 0,
      padding: '0px 0px 0px 0px',
      borderRadius: '0.5em 0 0 0.5em',
      boxShadow: searchBarShadow,
    },
    inputRoot: {
      paddingLeft: '1em',
      color: homeTextGreyVerifier,
      letterSpacing: '0.03em',
      fontWeight: '500',
      '&::placeholder': {
        fontWeight: 'bold',
      },
    },

    buttonRoot: {
      width: '20%',
      height: '2em',
      borderRadius: '0 0.5em 0.5em 0',
      boxShadow: buttonShadow,
      backgroundColor: searchBarButtonColor,
      '&:hover': {
        boxShadow: buttonHoverShadow,
        backgroundColor: searchBarButtonColor,
      },
    },
  });
};
const SearchBar = (props) => {
  const { classes } = props;
  return (
    <div className={classes.container}>
      <Input
        id="uncontrolled"
        label=""
        placeholder="ETH Wallet Address"
        className={classes.textField}
        classes={{ input: classes.inputRoot }}
        margin="normal"
        disableUnderline
        fullWidth
      />
      <Button variant="contained" color="primary" classes={{ root: classes.buttonRoot }}>Go To User</Button>
    </div>
  );
};

SearchBar.propTypes = {
  
};

export default withStyles(styles)(SearchBar);
