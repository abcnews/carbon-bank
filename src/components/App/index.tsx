// This is a simple wrapper for the main <Viz> component which provides the scrollyteller data.
import React, { useCallback, useState } from 'react';
import { Mark } from '../../constants';
import Scrollyteller, { PanelDefinition } from '@abcnews/scrollyteller';
import './styles.scss';
import Viz from '../Viz';

interface AppProps {
  panels: PanelDefinition<Mark>[];
}

const App: React.FC<AppProps> = ({ panels }) => {
  const [current, setCurrent] = useState<Mark>(null!);
  const [progress, setProgress] = useState<number>(null!);

  const onMarker = useCallback((data: Mark) => setCurrent(data), []);

  const onProgress = useCallback(
    (measurements: { pctAboveFold: number }) => current?.useProgress && setProgress(measurements.pctAboveFold),
    [current?.useProgress]
  );

  const currentProgress = current?.useProgress && progress ? progress : undefined;

  return (
    <Scrollyteller panels={panels} onMarker={onMarker} onProgress={onProgress} theme="light">
      {current && <Viz current={current} progress={currentProgress} />}
    </Scrollyteller>
  );
};

export default App;
