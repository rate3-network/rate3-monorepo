import {
  onboardText,
  onboardRadio,
  onboardRadioLabel,
  onboardingModalHeaderBg,
  onboardingModalHeaderText,
  onboardingModalBg,
} from '../../constants/colors';

const verifyAndSetUpStyles = theme => ({
  root: {
    flexGrow: 1,
    color: onboardText,
  },
  modalHeader: {
    backgroundColor: onboardingModalHeaderBg,
    color: onboardingModalHeaderText,
    textAlign: 'center',
    paddingTop: '1em',
    paddingBottom: '1em',
    margin: 0,
  },
  modalContent: {
    backgroundColor: onboardingModalBg,
    padding: '2em',
  },
  subheader: {
    marginTop: '2em',
  },
  radioGroup: {
    marginBottom: '2em',
  },
  buttonsGroup: {
    display: 'flex',
  },
  flexGrow: {
    flexGrow: 1,
  },
  labelRoot: {
    backgroundColor: onboardRadioLabel,
    borderRadius: '10px',
    padding: '1.5em',
    margin: 0,
  },
  radioRoot: {
    color: onboardRadio,
  },
});

export const verifyStepStyles = verifyAndSetUpStyles;
export const setUpStepStyles = verifyAndSetUpStyles;
