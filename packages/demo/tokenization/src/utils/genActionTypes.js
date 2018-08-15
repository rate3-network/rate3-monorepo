export default (obj, namespace) => {
  const actionTypes = {};

  for (const type in obj) {
    if (namespace) {
      actionTypes[type] = `${namespace}:${type}`;
    } else {
      actionTypes[type] = type;
    }
  }

  Object.freeze(actionTypes);
  return actionTypes;
};
