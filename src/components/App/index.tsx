// This is a simple wrapper for the main <Viz> component which provides the scrollyteller data.
import React, { useCallback, useMemo, useState } from 'react';
import { Mark } from '../../constants';
import Scrollyteller, { PanelDefinition, ScrollytellerConfig } from '@abcnews/scrollyteller';
import styles from './styles.scss';
import Viz from '../Viz';

interface AppProps {
  panels: PanelDefinition<Mark>[];
  config: ScrollytellerConfig;
}

const App: React.FC<AppProps> = ({ panels, config }) => {
  const [current, setCurrent] = useState<Mark>(null!);
  const [progress, setProgress] = useState<number>(null!);
  const memoedPanels = useMemo(() => {
    return panels.map(d => ({ ...d, className: d.data.standalone ? styles.standalonePanel : undefined }));
  }, [panels]);
  console.log('memoedPanels :>> ', memoedPanels);
  const onMarker = useCallback((data: Mark) => {
    setCurrent(data);
  }, []);

  const onProgress = useCallback(
    (measurements: { pctAboveFold: number }) => current?.chart || setProgress(measurements.pctAboveFold),
    [current?.chart]
  );

  const currentProgress = !current?.chart && progress ? progress : undefined;

  return (
    <Scrollyteller
      {...config}
      className={styles.container}
      panels={memoedPanels}
      onMarker={onMarker}
      onProgress={onProgress}
      theme="light"
    >
      {current && <Viz className={styles.graphic} current={current} progress={currentProgress} />}
    </Scrollyteller>
  );
};

export default App;
