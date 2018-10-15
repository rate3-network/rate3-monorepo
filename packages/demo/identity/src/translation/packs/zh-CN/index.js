/* @flow */
import Language from '../../models/Language';
import Translation from '../../models/Translation';

import general from './general.json';

const zhCN: Translation = new Translation(
  new Language('简体中文', 'zh-CN'),
  {
    testNS: {
      test: 'chinese text',
    },
    general,
  },
);

export default zhCN;
