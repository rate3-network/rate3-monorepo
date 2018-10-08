import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { translate } from 'react-i18next';
import ChevronLeft from '@material-ui/icons/ChevronLeftRounded';
import IconButton from '@material-ui/core/IconButton';
import { observer, inject } from 'mobx-react';

import UserMain from '../pages/UserMain';
import VerifierMain from '../pages/VerifierMain';

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
      width: '65%',
      fontSize: '1.2em',
      lineHeight: '1.55em',
      fontWeight: '400',
      marginBottom: '5em',
    },
  });
};
@inject('RootStore') @observer
class Faq extends React.Component {
  componentDidMount() {
    window.analytics.page('faq');
    this.props.RootStore.initNetwork();
  }
  render() {
    const { classes, t } = this.props;
    return (
      <div>
        <h1 className={classes.title}>
          <IconButton
            onClick={() => {this.props.history.goBack()}}
          >
            <ChevronLeft className={classes.label} />
          </IconButton>
        
          <div>{t('faqTitle')}</div>
        </h1>
        <div className={classes.descriptionBox}>
          <h3>{t('whatIsThis')}</h3>
          <p>{t('whatIsThisPara1')}</p>
          <p>{t('whatIsThisPara2')}</p>
          <p>{t('whatIsThisPara3')}</p>
  
          <h3>{t('howDoesItWork')}</h3>
          <p>{t('howDoesItWorkPara1')}</p>
          <p>{t('howDoesItWorkPara2')}</p>
          <p>{t('howDoesItWorkPara3')}</p>
          <p>{t('howDoesItWorkPara4')}</p>
  
          <h3>{t('whyImportant')}</h3>
          <p>{t('whyImportantPara1')}</p>
        </div>
      </div>
    );
  }
}

Faq.propTypes = {
  
};

export default translate('general')(withStyles(styles)(Faq));