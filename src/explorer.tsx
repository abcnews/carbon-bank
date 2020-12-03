import './polyfill';
import { selectMounts } from '@abcnews/mount-utils';
import React from 'react';
import { render } from 'react-dom';
import Explorer from './components/Explorer';
import { whenDOMReady } from '@abcnews/env-utils';

const whenMountsReady = whenDOMReady.then(
  () => new Promise(resolve => resolve(selectMounts('explorer', { exact: true })[0]))
);

whenMountsReady.then(renderExplorer);

function renderExplorer(mountEl) {
  if (!mountEl) {
    console.error('Mount point not found.');
    return;
  }
  try {
    render(<Explorer />, mountEl);
  } catch (e) {
    import('./components/ErrorBox').then(({ default: ErrorBox }) => {
      render(<ErrorBox error={e} />, mountEl);
    });
  }
}

if (module.hot) {
  module.hot.accept('./components/Explorer', () => whenMountsReady.then(renderExplorer));
}
