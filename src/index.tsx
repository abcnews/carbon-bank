import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import { loadScrollyteller, ScrollytellerDefinition } from '@abcnews/scrollyteller';
import { PanelData } from './common.d';
let scrollyData: ScrollytellerDefinition<PanelData>;
const PROJECT_NAME: string = 'carbon-bank';

function renderApp() {
  if (!scrollyData) {
    scrollyData = loadScrollyteller('', 'u-full');
  }

  scrollyData.panels = scrollyData.panels
    .map((d, index) => ({
      ...d,
      data: { ...d.data, index }
    }))
    .map((d, index, arr) => ({
      ...d,
      data: { ...d.data, next: arr[index + 1]?.data }
    }));

  render(<App panels={scrollyData.panels} />, scrollyData.mountNode);
}

init();

function init() {
  if (window.__ODYSSEY__) {
    renderApp();
  } else {
    window.addEventListener('odyssey:api', renderApp);
  }
}

if (module.hot) {
  module.hot.accept('./components/App', () => {
    try {
      init();
    } catch (err) {
      import('./components/ErrorBox').then(({ default: ErrorBox }) => {
        render(<ErrorBox error={err} />, scrollyData.mountNode);
      });
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
