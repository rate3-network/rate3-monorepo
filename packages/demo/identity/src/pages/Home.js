import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';

import HomeSidebar from '../components/HomeSidebar';
import { homeBg } from '../constants/colors';
import UserMain from './UserMain';
import VerifierMain from './VerifierMain';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    overflow: 'auto',
    height: '100%',
    backgroundColor: homeBg,
  },
  main: {
    padding: '5.5em 4em 10em 4em',
    marginLeft: '20rem',
  },
});

const Home = inject('RootStore')(observer((props) => {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <HomeSidebar />
      <div className={classes.main}>
        {props.RootStore.commonStore.getIsUser()
        ?
          <UserMain />
        :
          <VerifierMain />
        }
      </div>
    </div>
  );
}));

Home.propTypes = {
  
};

export default withStyles(styles)(Home);
