import {
  onboardText,
  onboardRadio,
  onboardRadioLabel,
} from '../../constants/colors';

const verifyAndSetUpStyles = theme => ({
  root: {
    flexGrow: 1,
    color: onboardText,
  },
  subheader: {
    marginTop: '2em',
  },
  radioGroup: {
    marginBottom: '2em',
  },
  buttonsGroup: {
    textAlign: 'right',
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
