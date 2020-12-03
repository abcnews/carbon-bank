import 'regenerator-runtime/runtime.js';
import 'core-js/features/symbol';
import 'core-js/features/symbol/iterator';
import { ResizeObserver, ResizeObserverEntry } from '@juggle/resize-observer';

if (!('ResizeObserver' in window)) {
  // @ts-ignore
  window.ResizeObserver = ResizeObserver;
  // @ts-ignore
  window.ResizeObserverEntry = ResizeObserverEntry;
}

// @ts-ignore
if (!window.crypto) window.crypto = window.msCrypto;
if (!Object.entries) {
  Object.entries = function (obj) {
    var ownProps = Object.keys(obj),
      i = ownProps.length,
      resArray = new Array(i); // preallocate the Array
    while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
  };
}

export {};
