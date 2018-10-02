import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { translate } from 'react-i18next';
import ChevronLeft from '@material-ui/icons/ChevronLeftRounded';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const styles = (theme) => {
  return ({
    title: {
      letterSpacing: '0.02em',
      display: 'flex',
      alignItems: 'center',
      left: '-1.5em',
      position: 'relative',
      justifyContent: 'flex-start',
    },
    label: {
      fontSize: '1.5em',
      lineHeight: '1.5em',
    },
    descriptionBox: {
      width: '100%',
      fontSize: '1.2em',
      lineHeight: '1.55em',
      fontWeight: '400',
      marginBottom: '5em',
    },
    root: {
      width: '100%',
    },
  });
};
const Settings = (props) => {
  const { classes, t } = props;
  return (
    <div>
      <h1 className={classes.title}>
        <IconButton
          onClick={() => {props.history.goBack()}}
        >
          <ChevronLeft className={classes.label} />
        </IconButton>
      
        <div>{t('Settings')}</div>
      </h1>
      <div className={classes.descriptionBox}>
      <Paper className={classes.root}>
        <Tabs
          value={1}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Item One" />
          <Tab label="Item Two" />
          <Tab label="Item Three" />
        </Tabs>
      </Paper>
      </div>
    </div>
  );
};

Settings.propTypes = {
  
};

export default translate('general')(withStyles(styles)(Settings));
