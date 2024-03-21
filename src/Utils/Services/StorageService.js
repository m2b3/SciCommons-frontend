import Cookies from 'js-cookie';

export const cookies = {
  set: (key, value) => {
    Cookies.set(key, value);
  },
  get: (key) => {
    return Cookies.get(key);
  },
  remove: (key) => {
    Cookies.remove(key);
  }
};
