import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { compose } from '../../utils';
import {
  onboardRoleCardShadow,
  onboardText,
  onboardTrusteeRoleCardAccent,
  onboardTrusteeRoleCardBg,
  onboardTrusteeRoleCardCircle,
  onboardTrusteeRoleCardText,
  onboardUserRoleCardAccent,
  onboardUserRoleCardBg,
  onboardUserRoleCardCircle,
  onboardUserRoleCardText,
} from '../../constants/colors';

const styles = theme => ({
  root: {
    flexGrow: 1,
    color: onboardText,
  },
  roleSelectionContainer: {
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
  },
  roleCardContainer: {
    flex: '1 0 calc(50% - 10px)',
    minWidth: '300px',
    margin: '5px',
    cursor: 'pointer',
  },
  userRoleCardRoot: {
    boxShadow: `3.41539px 3.41539px 6.83079px ${onboardRoleCardShadow}`,
    backgroundColor: onboardUserRoleCardBg,
    color: onboardUserRoleCardText,
  },
  trusteeRoleCardRoot: {
    boxShadow: `3.41539px 3.41539px 6.83079px ${onboardRoleCardShadow}`,
    backgroundColor: onboardTrusteeRoleCardBg,
    color: onboardTrusteeRoleCardText,
  },
  userRoleCardAccent: {
    backgroundColor: onboardUserRoleCardAccent,
  },
  trusteeRoleCardAccent: {
    backgroundColor: onboardTrusteeRoleCardAccent,
  },
  userRoleCardCircle: {
    backgroundColor: onboardUserRoleCardCircle,
  },
  trusteeRoleCardCircle: {
    backgroundColor: onboardTrusteeRoleCardCircle,
  },
});

const RoleCard = ({
  classes,
  onClick,
  label,
  description,
}) => (
  <div
    className={classes.root}
    style={{ height: '100%' }}
    onClick={onClick}
  >
    <div
      className={classes.accent}
      style={{ width: '100%', height: '8px' }}
    />
    <div style={{ padding: '2em' }}>
      <div
        className={classes.circle}
        style={{
          width: '50%',
          height: 'auto',
          borderRadius: '50%',
          paddingTop: '50%',
          margin: '2em auto',
        }}
      />
      <h1
        className={classes.label}
        style={{
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </h1>
      <div
        style={{
          padding: '1em',
        }}
      >
        {description}
      </div>
    </div>
  </div>
);

RoleCard.propTypes = {
  classes: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  label: PropTypes.node.isRequired,
  description: PropTypes.node.isRequired,
};

const RoleSelection = ({
  classes,
  t,
  handleNextStep,
  setContext,
}) => (
  <div className={classes.root}>
    <h1>Step 1: Choose Your Role</h1>
    <div className={classes.roleSelectionContainer}>
      <div className={classes.roleCardContainer}>
        <RoleCard
          label={t('user')}
          classes={{
            root: classes.userRoleCardRoot,
            accent: classes.userRoleCardAccent,
            circle: classes.userRoleCardCircle,
          }}
          description={(
            <Grid container spacing={24}>
              <Grid item xs={6} style={{ fontWeight: 'bold' }}>
                {t('onboarding:tokenize')}
              </Grid>
              <Grid item xs={6}>
                {t('onboarding:tokenizeDesc')}
              </Grid>
              <Grid item xs={6} style={{ fontWeight: 'bold' }}>
                {t('onboarding:withdraw')}
              </Grid>
              <Grid item xs={6}>
                {t('onboarding:withdrawDesc')}
              </Grid>
            </Grid>
          )}
          onClick={() => {
            setContext(ctx => ({ ...ctx, isUser: true }));
            handleNextStep();
          }}
        />
      </div>
      <div className={classes.roleCardContainer}>
        <RoleCard
          label={t('trustee')}
          classes={{
            root: classes.trusteeRoleCardRoot,
            accent: classes.trusteeRoleCardAccent,
            circle: classes.trusteeRoleCardCircle,
          }}
          description={(
            <Grid container spacing={24}>
              <Grid item xs={6} style={{ fontWeight: 'bold' }}>
                {t('onboarding:approve')}
              </Grid>
              <Grid item xs={6}>
                {t('onboarding:approveDesc')}
              </Grid>
              <Grid item xs={6} style={{ fontWeight: 'bold' }}>
                {t('onboarding:monitor')}
              </Grid>
              <Grid item xs={6}>
                {t('onboarding:monitorDesc')}
              </Grid>
            </Grid>
          )}
          onClick={() => {
            setContext(ctx => ({ ...ctx, isUser: false }));
            handleNextStep();
          }}
        />
      </div>
    </div>
  </div>
);

RoleSelection.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  handleNextStep: PropTypes.func.isRequired,
  setContext: PropTypes.func.isRequired,
};

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  translate(['navigator', 'onboarding']),
);

export default enhance(RoleSelection);
