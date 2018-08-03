import React from 'react';
import PropTypes from 'prop-types';
import {
  EventsContext,
  DocTypesContext,
  withContext,
} from '../context';
import EventsList from './EventsList';

const ReceiptsPanel = ({ docTypes, events }) => {
  const {
    fromBlock,
    toBlock,
    items,
  } = events.received;
  if (fromBlock == null || toBlock == null) {
    return null;
  }
  const itemsToRender = [...items].reverse();
  return (
    <EventsList
      fromBlock={fromBlock}
      toBlock={toBlock}
      eventItems={itemsToRender}
      docTypes={docTypes}
    />
  );
};

ReceiptsPanel.propTypes = {
  docTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  events: PropTypes.object.isRequired,
};

export default withContext(EventsContext, DocTypesContext)(ReceiptsPanel);
