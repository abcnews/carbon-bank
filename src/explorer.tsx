import { selectMounts } from '@abcnews/mount-utils';
import React from 'react';
import { render } from 'react-dom';
import Explorer from './components/Explorer';

let mountEl;
export const renderExplorer = () => {
  mountEl = selectMounts('explorer', { exact: true })[0];

  if (!mountEl) {
    return;
  }

  render(<Explorer />, mountEl);
};

if (module.hot) {
  module.hot.accept('./components/Explorer', () => {
    try {
      renderExplorer();
    } catch (err) {
      import('./components/ErrorBox').then(({ default: ErrorBox }) => {
        render(<ErrorBox error={err} />, mountEl);
      });
    }
  });
}

const domready = fn => {
  /in/.test(document.readyState) ? setTimeout(() => domready(fn), 9) : fn();
};

domready(renderExplorer);
