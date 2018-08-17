export default (obj, namespace) => {
  const res = {};

  for (const type in obj) {
    if (namespace) {
      res[type] = `${namespace}:${type}`;
    } else {
      res[type] = type;
    }
  }

  Object.freeze(res);
  return res;
};
