/* @flow */
import Language from '../../models/Language';
import Translation from '../../models/Translation';


const en: Translation = new Translation(
  new Language('EN', 'en'),
  {
    testNS: {
      test: 'english text',
    },
  },
);

export default en;
