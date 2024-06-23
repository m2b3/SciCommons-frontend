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

export const localStorage = {
  set: (key, value) => {
    window.localStorage.setItem;
  },
  get: (key) => {
    return window.localStorage.getItem(key);
  },
  remove: (key) => {
    window.localStorage.removeItem(key);
  }
};
