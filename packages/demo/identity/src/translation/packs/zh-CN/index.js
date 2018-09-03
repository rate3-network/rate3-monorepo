/* @flow */
import Language from '../../models/Language';
import Translation from '../../models/Translation';


const zhCN: Translation = new Translation(
  new Language('简体中文', 'zh-CN'),
  {
    testNS: {
      test: 'chinese text',
    },
  },
);

export default zhCN;
