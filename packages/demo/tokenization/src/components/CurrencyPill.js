import React from 'react';
import PropTypes from 'prop-types';
import { sgdColor, currencyPillText, sgdrColor } from '../constants/colors';

const CurrencyPill = ({ text, backgroundColor, color }) => (
  <span>
    <div
      style={{
        backgroundColor,
        color,
        height: '1.2rem',
        width: '2.4rem',
        textAlign: 'center',
        letterSpacing: 0,
        fontSize: '0.6em',
        fontWeight: 'bold',
        borderRadius: '0.6rem',
        display: 'table-cell',
        verticalAlign: 'middle',
      }}
    >
      {text}
    </div>
  </span>
);

CurrencyPill.propTypes = {
  text: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

export const SgdPill = () => (
  <CurrencyPill
    text="SGD"
    backgroundColor={sgdColor}
    color={currencyPillText}
  />
);

export const SgdrPill = () => (
  <CurrencyPill
    text="SGDR"
    backgroundColor={sgdrColor}
    color={currencyPillText}
  />
);
