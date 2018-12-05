interface IKeyMirror {
  [key: string]: string;
}
export const keyMirror = (obj: object, namespace: string): IKeyMirror => {
  const res = {};
  for (const type in obj) {
    if (namespace) { // tslint:disable-line:prefer-conditional-expression
      res[type] = `${namespace}:${type}`;
    } else {
      res[type] = type;
    }
  }

  Object.freeze(res);
  return res;
};
export interface IAction<Payload = any, Meta = any> {
  type: string;
  payload?: Payload;
  meta?: Meta;
}
export const createAction = <Payload, Meta>(type: string) =>
  (payload?: Payload, meta?: Meta): IAction<Payload, Meta> =>
    ({ type, payload, meta });
