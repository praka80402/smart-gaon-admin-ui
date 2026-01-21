// loaderStore.js
let activeRequests = 0;
const listeners = new Set();

export const loaderStore = {
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  show() {
    activeRequests++;
    listeners.forEach(fn => fn(activeRequests > 0));
  },
  hide() {
    activeRequests = Math.max(0, activeRequests - 1);
    listeners.forEach(fn => fn(activeRequests > 0));
  }
};
