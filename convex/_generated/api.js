/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 */

export const api = new Proxy(
  {},
  {
    get(target, prop) {
      return new Proxy(
        {},
        {
          get(target2, prop2) {
            return `${String(prop)}:${String(prop2)}`;
          },
        }
      );
    },
  }
);

export const internal = new Proxy(
  {},
  {
    get(target, prop) {
      return new Proxy(
        {},
        {
          get(target2, prop2) {
            return `${String(prop)}:${String(prop2)}`;
          },
        }
      );
    },
  }
);
