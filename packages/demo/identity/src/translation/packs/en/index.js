/* @flow */
import Language from '../../models/Language';
import Translation from '../../models/Translation';

import general from './general.json';

const en: Translation = new Translation(
  new Language('EN', 'en'),
  {
    general,
  },
);

export default en;
