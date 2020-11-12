import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import { loadScrollyteller, PanelDefinition, ScrollytellerDefinition } from '@abcnews/scrollyteller';
import { PanelData } from './common.d';
import { panelDataToMark } from './utils';
import { Mark } from './constants';
const PROJECT_NAME: string = 'carbon-bank';
const tellers = ['a', 'b'];
let scrollyData: { [key: string]: ScrollytellerDefinition<PanelData> } = {};

function renderApp() {
  tellers.forEach(name => {
    scrollyData[name] = scrollyData[name] || loadScrollyteller<PanelData>(name, 'u-full');
    const panels: PanelDefinition<Mark>[] = scrollyData[name].panels
      .map(d => ({
        ...d,
        data: panelDataToMark(d.data)
      }))
      .map((d, index, arr) => ({
        ...d,
        data: { ...d.data, next: arr[index + 1]?.data }
      }));

    render(<App panels={panels} />, scrollyData[name].mountNode);
  });
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
        tellers.forEach(name => render(<ErrorBox error={err} />, scrollyData[name].mountNode));
      });
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
