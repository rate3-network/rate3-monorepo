/* @flow */
import Language from '../../models/Language';
import Translation from '../../models/Translation';

import general from './general';
import instructions from './instructions';

const en: Translation = new Translation(
  new Language('EN', 'en'),
  {
    general,
    instructions,
  },
);

export default en;
