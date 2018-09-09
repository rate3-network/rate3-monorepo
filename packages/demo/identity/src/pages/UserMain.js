import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import ExpandablePanel from '../components/ExpandablePanel';

const styles = (theme) => {
  return ({
    container: {
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      letterSpacing: '0.02em',
    },
    descriptionBox: {
      width: '65%',
      fontSize: '1.2em',
      lineHeight: '1.55em',
      fontWeight: '400',
    },
  });
};
const UserMain = (props) => {
  const { classes } = props;
  return (
    <div className={classes.container}>
      <h1 className={classes.title}>My Identity</h1>
      <div className={classes.descriptionBox}>
        <p>This is your reusuable identity that is improved by verifications which authenticates a part of your identity.</p>
        <ExpandablePanel>test</ExpandablePanel>
      </div>
      
    </div>
  );
};

UserMain.propTypes = {
  
};

export default withStyles(styles)(UserMain);
