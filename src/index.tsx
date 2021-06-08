import './polyfill';
import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import { loadScrollyteller, PanelDefinition, ScrollytellerDefinition } from '@abcnews/scrollyteller';
import { PanelData } from './common.d';
import { panelDataToMark } from './utils';
import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { Mark } from './constants';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import Header from './components/Header';
import ParallaxHeader from './components/ParallaxHeader';
import { proxy } from '@abcnews/dev-proxy';

type ScrollyData = { [key: string]: ScrollytellerDefinition<Mark> };

const PROJECT_NAME = 'carbon-bank';
const align = 'right' as const;

const init = () => {
  const whenScrollytellersLoaded = new Promise<ScrollyData>((resolve, reject) => {
    whenOdysseyLoaded.then(() => {
      const scrollyDatas: ScrollyData = {};
      selectMounts('scrollytellerNAME', { markAsUsed: false })
        .map(mountEl => (getMountValue(mountEl).match(/NAME([a-z]+)/) || [])[1])
        .filter(name => typeof name === 'string')
        .forEach(name => {
          try {
            // Load scrollytellers
            const scrollyData = loadScrollyteller<PanelData>(name, 'u-full');

            // Convert panel data
            const panels: PanelDefinition<Mark>[] = scrollyData.panels
              .map(d => ({
                ...d,
                align: name !== 'header' ? align : undefined,
                data: {
                  ...panelDataToMark(d.data),
                  standalone:
                    d.nodes.length === 1 && d.nodes[0] instanceof Element && d.nodes[0].matches('.Quote') ? true : false
                }
              }))
              .map((d, index, arr) => ({
                ...d,
                data: { ...d.data, next: arr[index + 1]?.data }
              }));

            // Replace the panel definiton on the global scrollyteller object
            scrollyDatas[name] = { ...scrollyData, panels };
          } catch (e) {
            reject(e);
          }
          resolve(scrollyDatas);
        });
    });
  });

  const renderIllustrations = () => {
    const titleMount = selectMounts('cbillustration')[0];

    if (!titleMount) return;

    const parentEl = titleMount.parentElement;

    if (!parentEl) return;

    const titleEl = parentEl.querySelector('h1');

    if (titleEl && titleEl.parentElement === parentEl) {
      titleMount.removeAttribute('class');
      parentEl.insertBefore(titleMount, titleEl);
    }

    render(<Header />, titleMount);
  };

  function renderApp(scrollyData: ScrollyData) {
    for (const name in scrollyData) {
      const { panels, mountNode, config } = scrollyData[name];
      try {
        if (name === 'header') {
          render(<ParallaxHeader config={config} panels={panels} />, mountNode);
        } else {
          render(<App config={config} panels={panels} />, mountNode);
        }
      } catch (e) {
        import('./components/ErrorBox').then(({ default: ErrorBox }) => {
          render(<ErrorBox error={e} />, mountNode);
        });
      }
    }
  }

  whenOdysseyLoaded.then(renderIllustrations);
  whenScrollytellersLoaded.then(renderApp);

  if (module.hot) {
    module.hot.accept('./components/App', () => {
      whenScrollytellersLoaded.then(renderApp);
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.info(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
  }
};

proxy(PROJECT_NAME).then(init);
