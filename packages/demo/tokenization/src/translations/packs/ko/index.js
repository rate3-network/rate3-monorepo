import Language from '../../models/Language';
import Translation from '../../models/Translation';

// Import translated resources
import navigator from './navigator';
import onboarding from './onboarding';
import transactions from './transactions';
import wallet from './wallet';
import completion from './completion';
import fields from './fields';
import stepper from './stepper';
import faq from './faq';

const en = new Translation(
  new Language('KO', 'ko'),
  {
    navigator,
    onboarding,
    transactions,
    wallet,
    completion,
    fields,
    stepper,
    faq,
  },
);

export default en;
