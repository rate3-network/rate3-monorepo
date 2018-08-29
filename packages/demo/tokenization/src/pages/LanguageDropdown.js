import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import TranslationsHandler from '../translations';
import {
  languageMenuSelectedBg,
  languageMenuSelectedText,
} from '../constants/colors';

const styles = theme => ({
  inputRoot: {
    color: 'inherit',
  },
  selectIcon: {
    color: 'inherit',
  },
  selectMenu: {
    paddingTop: 0,
    paddingBottom: 0,
    '&:focus': {
      backgroundColor: 'inherit',
    },
  },
  itemRoot: {
    padding: '0.2em 1em',
  },
  itemText: {
    margin: 'auto',
  },
  selectedItem: {
    backgroundColor: `${languageMenuSelectedBg} !important`,
    color: languageMenuSelectedText,
  },
});

class LanguageDropDown extends React.Component {
  componentDidMount() {
    const savedLang = sessionStorage.getItem('lang');
    if (savedLang) {
      TranslationsHandler.setLanguage(savedLang);
    }
  }

  handleChange = (e) => {
    TranslationsHandler.setLanguage(e.target.value);
    sessionStorage.setItem('lang', e.target.value);
  }

  render() {
    const { classes } = this.props;
    const currentLanguage = TranslationsHandler.getLanguage();
    const languages = TranslationsHandler.getSupportedLanguages();

    return (
      <form className={classes.root} autoComplete="off">
        <FormControl className={classes.formControl}>
          <Select
            value={currentLanguage}
            onChange={this.handleChange}
            input={(
              <Input
                disableUnderline
                classes={{
                  root: classes.inputRoot,
                }}
              />
            )}
            MenuProps={{
              PaperProps: {
                square: false,
              },
            }}
            classes={{
              selectMenu: classes.selectMenu,
              icon: classes.selectIcon,
            }}
          >
            {
              languages.map(lang => (
                <MenuItem
                  key={lang.getCodeName()}
                  value={lang.getCodeName()}
                  classes={{
                    root: classes.itemRoot,
                    selected: classes.selectedItem,
                  }}
                >
                  <div className={classes.itemText}>{lang.getName()}</div>
                </MenuItem>
              ))
            }
          </Select>
        </FormControl>
      </form>
    );
  }
}

LanguageDropDown.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(LanguageDropDown);
