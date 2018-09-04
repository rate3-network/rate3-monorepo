import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import TranslationsHandler from '../translation/TranslationHandler';

const language = 'lang';

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
    backgroundColor: 'inherit',
    color: 'inherit',
  },
});

class LanguageDropDown extends React.Component {
  // constructor() {
  //   super();
  //   this.state = {
  //     currentLanguage: {},
  //   };
  // }
  componentDidMount() {
    const savedLang = sessionStorage.getItem(language);
    if (savedLang) {

      TranslationsHandler.setLanguage(savedLang);
    }
  }

  // updateCurrentLanguage = (l) => {
  //   this.setState({ currentLanguage: l });
  // }

  handleChange = (e) => {
    TranslationsHandler.setLanguage(e.target.value);
    sessionStorage.setItem(language, e.target.value);
  }

  render() {
    const { classes } = this.props;
    const currentLanguage = TranslationsHandler.getLanguage();
    const languages = TranslationsHandler.getSupportedLanguages();

    return (
      <form className={classes.root} autoComplete="off">
        <FormControl className={classes.formControl}>
          <Select
            value={currentLanguage.getCodeName()}
            // value={language}
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
                  <div className={classes.itemText}>{lang.getCodeName()}</div>
                </MenuItem>
              ))
            }
          </Select>
        </FormControl>
        <p>{TranslationsHandler.getLanguage().getCodeName()}</p>
      </form>
    );
  }
}

LanguageDropDown.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(LanguageDropDown);
