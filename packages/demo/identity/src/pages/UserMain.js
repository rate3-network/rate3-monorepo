import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';

import ExpandablePanel from '../components/ExpandablePanel';
import FixedPanel from '../components/FixedPanel';

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
      marginBottom: '5em',
    },
  });
};
const UserMain = inject('RootStore')(observer((props) => {
  const { classes } = props;
  return (
    <div className={classes.container}>
      <h1 className={classes.title}>My Identity</h1>
      <div className={classes.descriptionBox}>
        <p>This is your reusuable identity that is improved by verifications which authenticates a part of your identity.</p>
        {props.RootStore.userStore.getIdentityNames().length > 0 ?
          <ExpandablePanel title="Name" items={props.RootStore.userStore.getIdentityNames()} /> :
          <FixedPanel title="Name"></FixedPanel>
        }
        {props.RootStore.userStore.getIdentityAddresses().length > 0 ?
          <ExpandablePanel title="Address" items={props.RootStore.userStore.getIdentityAddresses()} /> :
          <FixedPanel title="Address"></FixedPanel>
        }
        {props.RootStore.userStore.getIdentitySocialIds().length > 0 ?
          <ExpandablePanel title="Social ID" items={props.RootStore.userStore.getIdentitySocialIds()} /> :
          <FixedPanel title="Social ID"></FixedPanel>
        }
      </div>
      
    </div>
  );
}));

UserMain.propTypes = {
  
};

export default withStyles(styles)(UserMain);
