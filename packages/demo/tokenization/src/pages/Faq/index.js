import React from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';

import { withStyles } from '@material-ui/core/styles';

import { ropsten, rinkeby, kovan } from '../../constants/addresses';
import { compose } from '../../utils';

const styles = theme => ({
  root: {
    letterSpacing: 0,
    '& p': {
      lineHeight: '1.5em',
    },
    '& li': {
      lineHeight: '1.5em',
      marginBottom: '0.5em',
    },
  },
  link: {
    color: 'inherit',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
});

const Faq = ({
  classes,
  t,
}) => {
  const questions = [
    {
      title: t('qWhatIsThis'),
      answer: (
        <React.Fragment>
          <p>
            <Trans i18nKey="aWhatIsThisPara1">
              {'This is a proof-of-concept demo to showcase the tokenization process, from the perspective of a user or a trustee. It is on '}
              <a
                className={classes.link}
                href={`${ropsten.etherscanAddr}${ropsten.operations}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ropsten
              </a>
              {', '}
              <a
                className={classes.link}
                href={`${rinkeby.etherscanAddr}${rinkeby.operations}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Rinkeby
              </a>
              {', and '}
              <a
                className={classes.link}
                href={`${kovan.etherscanAddr}${kovan.operations}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Kovan
              </a>
              {' Test Networks.'}
            </Trans>
          </p>

          <p>
            {t('aWhatIsThisPara2')}
          </p>
        </React.Fragment>
      ),
    },
    {
      title: t('qHowToTry'),
      answer: (
        <React.Fragment>
          <ol>
            <li>
              {t('qHowToTryPoint1')}
            </li>
            <li>
              {t('qHowToTryPoint2')}
            </li>
            <li>
              {t('qHowToTryPoint3')}
            </li>
          </ol>
        </React.Fragment>
      ),
    },
    {
      title: t('qWhyIsThisImportant'),
      answer: (
        <React.Fragment>
          <p>
            {t('qWhyIsThisImportantPara1')}
          </p>
        </React.Fragment>
      ),
    },
  ];

  return (
    <div className={classes.root}>
      {
        questions.map(q => (
          <div key={q.title}>
            <h2>{q.title}</h2>
            <div>{q.answer}</div>
          </div>
        ))
      }
    </div>
  );
};

Faq.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
};

const enhance = compose(
  translate('faq'),
  withStyles(styles, { withTheme: true }),
);

export default enhance(Faq);
