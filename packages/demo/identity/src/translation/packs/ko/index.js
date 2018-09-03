/* @flow */
import Language from '../../models/Language';
import Translation from '../../models/Translation';

const en: Translation = new Translation(
  new Language('한국어', 'ko'),
  {
    testNS: {
      test: 'korean text',
    },
  },
);

export default en;
