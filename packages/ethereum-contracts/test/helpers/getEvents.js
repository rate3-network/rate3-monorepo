import _filter from 'lodash.filter';

const getEvents = (contract, filter) => (
    new Promise((resolve) => {
        const event = contract[filter.event]();
        event.watch();
        event.get((error, logs) => {
            const filtered = _filter(logs, filter);
            if (filtered) {
                resolve(filtered);
            } else {
                throw Error(`Failed to find filtered event for ${filter.event}`);
            }
        });
        event.stopWatching();
    })
);

export default getEvents;
