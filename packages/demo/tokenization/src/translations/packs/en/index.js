import Language from '../../models/Language';
import Translation from '../../models/Translation';

// Import translated resources
import navigator from './navigator';
import tokenization from './tokenization';
import wallet from './wallet';
import withdrawal from './withdrawal';

const en = new Translation(
  new Language('EN', 'en'),
  {
    navigator,
    tokenization,
    wallet,
    withdrawal,
  },
);

export default en;
