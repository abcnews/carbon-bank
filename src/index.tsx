import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import { loadScrollyteller, PanelDefinition, ScrollytellerDefinition } from '@abcnews/scrollyteller';
import { PanelData } from './common.d';
import { panelDataToMark } from './utils';
import { Mark } from './constants';
const PROJECT_NAME: string = 'carbon-bank';
let scrollyData: ScrollytellerDefinition<PanelData>;

function renderApp() {
  scrollyData = scrollyData || loadScrollyteller<PanelData>('', 'u-full');
  const panels: PanelDefinition<Mark>[] = scrollyData.panels
    .map(d => ({
      ...d,
      data: panelDataToMark(d.data)
    }))
    .map((d, index, arr) => ({
      ...d,
      data: { ...d.data, next: arr[index + 1]?.data }
    }));

  render(<App panels={panels} />, scrollyData.mountNode);
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
      renderApp();
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
