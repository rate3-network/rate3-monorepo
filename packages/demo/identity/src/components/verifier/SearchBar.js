import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';

const styles = (theme) => {
  return ({
    container: {
      backgroundColor: 'white',
      width: '100%',
      height: '2em',
    },
    textField: {
      width: '80%',
      height: '2em',
      marginTop: 0,
      marginBottom: 0,
    },
    inputRoot: {
      color: 'pink',
    },
    buttonRoot: {
      width: '20%',
      height: '2em',
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
      />
      <Button variant="contained" color="primary" classes={{ root: classes.buttonRoot }}>Go To User</Button>
    </div>
  );
};

SearchBar.propTypes = {
  
};

export default withStyles(styles)(SearchBar);
