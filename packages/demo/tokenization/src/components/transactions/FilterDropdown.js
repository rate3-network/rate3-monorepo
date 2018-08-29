import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';
import Typography from '@material-ui/core/Typography';

import {
  filterButtonText,
  filterButtonBg,
  filterDropdownText,
} from '../../constants/colors';

const styles = theme => ({
  paper: {
    padding: '1em 2em',
    borderRadius: '20px',
    letterSpacing: 0,
  },
  formGroupHeader: {
    fontWeight: 500,
    marginBottom: '5px',
    color: filterDropdownText,
  },
  formGroupRoot: {
    marginBottom: '1em',
    color: filterDropdownText,
  },
  formControlRoot: {
    margin: 0,
    marginLeft: '-8px',
    '& span:first-child': {
      width: '32px',
      height: '32px',
      '& svg': {
        width: '0.8em',
        height: '0.8em',
      },
    },
  },
  formControlLabel: {
    color: filterDropdownText,
  },
  filterButtonRoot: {
    height: '3em',
    borderRadius: '1.5em',
    width: '120px',
    backgroundColor: filterButtonBg,
    color: filterButtonText,
    '&:hover': {
      backgroundColor: filterButtonBg,
    },
    '&:focus': {
      backgroundColor: filterButtonBg,
    },
    '&:active': {
      backgroundColor: filterButtonBg,
    },
  },
  dismissButtonRoot: {
    marginBottom: '1em',
    '&:hover': {
      backgroundColor: 'inherit',
    },
    '&:focus': {
      backgroundColor: 'inherit',
    },
    '&:active': {
      backgroundColor: 'inherit',
    },
  },
  buttonText: {
    textTransform: 'none',
    fontWeight: 'bold',
    fontSize: '1.2em',
  },
  checkboxRoot: {
    color: `${filterDropdownText} !important`,
  },
});

class FilterDropdown extends React.Component {
  state = {
    anchorEl: null,
  };

  handleClick = (event) => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  handleClose = () => {
    this.setState({
      anchorEl: null,
    });
  };

  handleChange = (filter, currentOpt) => (e, newValue) => {
    const newFilter = {};
    filter.options.forEach((option) => {
      newFilter[option.value] = option.value === currentOpt.value
        ? newValue
        : option.checked;
    });
    filter.onChange(newFilter);
  }

  render() {
    const { classes, buttonText, filters } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div>
        <Button
          variant="contained"
          color="primary"
          disableRipple
          disableFocusRipple
          disableTouchRipple
          onClick={this.handleClick}
          classes={{
            root: classes.filterButtonRoot,
          }}
        >
          <Typography classes={{ root: classes.buttonText }}>
            {buttonText}
          </Typography>
          <KeyboardArrowDown />
        </Button>
        <Popover
          id="simple-popper"
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          classes={{
            paper: classes.paper,
          }}
        >
          <Button
            disableRipple
            disableFocusRipple
            disableTouchRipple
            onClick={this.handleClose}
            fullWidth
            classes={{
              root: classes.dismissButtonRoot,
            }}
          >
            <Typography classes={{ root: classes.buttonText }}>
              {buttonText}
            </Typography>
            <KeyboardArrowUp />
          </Button>
          {
            filters.map(filter => (
              <React.Fragment key={filter.group}>
                <div className={classes.formGroupHeader}>{filter.group}</div>
                <FormGroup
                  classes={{
                    root: classes.formGroupRoot,
                  }}
                >
                  {
                    filter.options.map(opt => (
                      <FormControlLabel
                        key={`${filter.group}_${opt.value}`}
                        control={(
                          <Checkbox
                            checked={opt.checked}
                            onChange={this.handleChange(filter, opt)}
                            value={`${opt.value}`}
                            classes={{
                              root: classes.checkboxRoot,
                            }}
                          />
                        )}
                        label={opt.label}
                        classes={{
                          root: classes.formControlRoot,
                          label: classes.formControlLabel,
                        }}
                      />
                    ))
                  }
                </FormGroup>
              </React.Fragment>
            ))
          }
        </Popover>
      </div>
    );
  }
}

FilterDropdown.propTypes = {
  classes: PropTypes.object.isRequired,
  buttonText: PropTypes.node.isRequired,
  filters: PropTypes.arrayOf(PropTypes.shape({
    group: PropTypes.node.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      value: PropTypes.any.isRequired,
      checked: PropTypes.bool.isRequired,
    })).isRequired,
    onChange: PropTypes.func.isRequired,
  })).isRequired,
};

export default withStyles(styles, { withTheme: true })(FilterDropdown);
