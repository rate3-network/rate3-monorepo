import React from 'react';
import PropTypes from 'prop-types';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CheckCircle from '@material-ui/icons/CheckCircle';

const CustomRadioGroup = ({ classes, items, ...props }) => (
  <RadioGroup
    {...props}
  >
    {
      items.map(item => (
        <FormControlLabel
          key={item.key}
          value={item.value}
          control={(
            <Radio
              checkedIcon={<CheckCircle />}
              color="default"
              classes={{
                root: classes.radio,
              }}
            />
          )}
          label={item.label}
          classes={{
            root: classes.label,
          }}
        />
      ))
    }
  </RadioGroup>
);

CustomRadioGroup.propTypes = {
  classes: PropTypes.object.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
  })).isRequired,
};

export default CustomRadioGroup;
