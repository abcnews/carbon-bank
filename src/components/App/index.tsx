// This is a simple wrapper for the main <Viz> component which provides the scrollyteller data.

import React, { useState } from 'react';
import { marks, Mark } from '../../constants';
import Scrollyteller, { PanelDefinition } from '@abcnews/scrollyteller';
import { PanelData } from '../../common.d';
import './styles.scss';

import Viz from '../Viz';
import { XAxisExtent } from '../YearlyEmissions';

interface AppProps {
  panels: PanelDefinition<PanelData>[];
}

const panelDataToMark = (panelData: PanelData) => {
  // Start with the hardcoded data by index
  const mark: Mark = { blobs: [{ id: 'carbon', emissions: 0 }] };

  // Should vis be tied to scroll?
  mark.useProgress = panelData.useprogress || mark.useProgress;

  // Limits
  mark.limits = panelData.limits
    ? Array.isArray(panelData.limits)
      ? panelData.limits
      : [panelData.limits]
    : mark.limits;

  // BLOBS

  // The carbon blob
  if (panelData.carbon) {
    const carbonBlob = mark.blobs.find(d => d.id === 'carbon');
    if (carbonBlob) {
      carbonBlob.emissions = panelData.carbon;
    } else {
      mark.blobs.push({ id: 'carbon', emissions: panelData.carbon });
    }
  }

  // The sink blob
  if (panelData.sink) {
    const sinkBlob = mark.blobs.find(d => d.id === 'sink');
    if (sinkBlob) {
      sinkBlob.emissions = panelData.sink;
    } else {
      mark.blobs.push({ id: 'sink', emissions: panelData.sink });
    }
  }

  // CHART

  // xAxisExtent
  if (panelData.xmin || panelData.xmax) {
    const xAxisExtent: XAxisExtent = [
      panelData.xmin || mark.chart?.xAxisExtent[0],
      panelData.xmax || mark.chart?.xAxisExtent[1]
    ];

    if (mark.chart) {
      mark.chart.xAxisExtent = xAxisExtent;
    } else {
      mark.chart = { xAxisExtent };
    }
  }

  // Label years
  if (panelData.labelyear && mark.chart) {
    const labelYears = Array.isArray(panelData.labelyear) ? panelData.labelyear : [panelData.labelyear];
    mark.chart.labelYears = labelYears;
  }

  // stopAt
  if (panelData.stopat && mark.chart) {
    mark.chart.stopAt = panelData.stopat;
  }

  // Method for auto-extending into future
  if (panelData.extend && mark.chart) {
    mark.chart.extend = panelData.extend;
  }

  return mark;
};

const App: React.FC<AppProps> = ({ panels }) => {
  const [current, setCurrent] = useState<Mark>(null!);
  const [next, setNext] = useState<Mark>(null!);
  const [progress, setProgress] = useState<number>(null!);

  const onMarker = (data: PanelData) => {
    const current = panelDataToMark(data);
    const next = data.next ? panelDataToMark(data.next) : current;

    // Get the data that relates to this mark
    setCurrent(current);

    // // Set data for the next mark, but default to the current mark if there is no next
    setNext(next);
  };

  const onProgress = (measurements: { pctAboveFold: number }) => {
    setProgress(measurements.pctAboveFold);
  };

  return (
    <Scrollyteller panels={panels} onMarker={onMarker} onProgress={onProgress} theme="light">
      {current && <Viz current={current} next={next} progress={progress} />}
    </Scrollyteller>
  );
};

export default App;
