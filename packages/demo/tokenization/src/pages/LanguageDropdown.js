import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import TranslationsHandler from '../translations';

const styles = theme => ({
  inputRoot: {
    color: 'inherit',
  },
  selectIcon: {
    color: 'inherit',
  },
  selectMenu: {
    '&:focus': {
      backgroundColor: 'inherit',
    },
  },
});

class LanguageDropDown extends React.Component {
  handleChange = (e) => {
    TranslationsHandler.setLanguage(e.target.value);
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
              MenuListProps: {
                disablePadding: true,
              },
            }}
            classes={{
              selectMenu: classes.selectMenu,
              icon: classes.selectIcon,
            }}
          >
            {
              languages.map(lang => (
                <MenuItem key={lang.getCodeName()} value={lang.getCodeName()}>
                  {lang.getName()}
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
