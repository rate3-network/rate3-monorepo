import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Blockies from 'react-blockies';
import { observer, inject } from 'mobx-react';

import { userBlockieSeed, verifierBlockieSeed } from '../constants/general';

const styles = (theme) => {
  return ({
    container: {
      overflow: 'hidden',
      width: '6.3rem',
      height: '6.3rem',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};

const ProfilePic = inject('RootStore')(observer((props) => {
  const seed = props.RootStore.commonStore.getIsUser() ? userBlockieSeed : verifierBlockieSeed;
  const { classes } = props;
  return (
    <div className={classes.container}>
      <Blockies
        seed={seed}
        scale={10}
        size={11}
      />
    </div>
  );
}));

ProfilePic.propTypes = {

};

export default withStyles(styles)(ProfilePic);
