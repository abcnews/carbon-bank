import React, { useState } from 'react';
import layers from './animation.json';
import Scrollyteller, { PanelDefinition, ScrollytellerConfig } from '@abcnews/scrollyteller';
import styles from './styles.scss';
import ParallaxGraphic from '../ParallaxGraphic';
import { Layer } from '../ParallaxGraphic/types';

interface ParallaxHeaderProps {
  panels: PanelDefinition<{}>[];
  config: ScrollytellerConfig;
}

const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({ config, panels }) => {
  const [progressPct, setProgresPct] = useState<number>(0);

  return (
    <Scrollyteller
      {...config}
      waypoint={0}
      panels={panels}
      panelClassName={styles.panel}
      onProgress={({ overall: { pctAboveFold }, height }) => {
        setProgresPct(pctAboveFold > 0 ? pctAboveFold : 0);
      }}
      theme="light"
    >
      <ParallaxGraphic pct={progressPct} layers={layers as Layer[]} />
    </Scrollyteller>
  );
};

export default ParallaxHeader;
