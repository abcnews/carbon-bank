// This is a simple wrapper for the main <Viz> component which provides the scrollyteller data.

import React, { useState } from 'react';
import { marks, Mark } from '../../constants';
import Scrollyteller, { PanelDefinition } from '@abcnews/scrollyteller';
import { PanelData } from '../../common.d';
import './styles.scss';

import Viz from '../Viz';

interface AppProps {
  panels: PanelDefinition<PanelData>[];
}

const App: React.FC<AppProps> = ({ panels }) => {
  const [current, setCurrent] = useState<Mark>(null!);
  const [next, setNext] = useState<Mark>(null!);
  const [progress, setProgress] = useState<number>(null!);

  const onMarker = (data: PanelData) => {
    // Get the data that relates to this mark
    setCurrent(marks[data.index]);
    // Set data for the next mark, but default to the current mark if there is no next
    setNext(data.next ? marks[data.next?.index] : current);
  };

  const onProgress = (measurements: { pctAboveFold: number }) => {
    setProgress(measurements.pctAboveFold);
  };

  return (
    <Scrollyteller panels={panels} onMarker={onMarker} onProgress={onProgress}>
      {current && <Viz current={current} next={next} progress={progress} />}
    </Scrollyteller>
  );
};

export default App;
