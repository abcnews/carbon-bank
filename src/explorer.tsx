import './polyfill';
import { selectMounts } from '@abcnews/mount-utils';
import React from 'react';
import { render } from 'react-dom';
import Explorer from './components/Explorer';
import { whenDOMReady } from '@abcnews/env-utils';
import { proxy } from '@abcnews/dev-proxy';

const init = () => {
  const whenMountsReady = whenDOMReady.then(
    () => new Promise(resolve => resolve(selectMounts('explorer', { exact: true })[0]))
  );

  whenMountsReady.then(renderExplorer);

  if (module.hot) {
    module.hot.accept('./components/Explorer', () => whenMountsReady.then(renderExplorer));
  }
};

proxy('carbon-bank').then(init);

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
