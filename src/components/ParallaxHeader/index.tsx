import React, { useEffect, useState, useRef } from 'react';
import layers from './animation.json';
import Scrollyteller, { PanelDefinition, ScrollytellerConfig } from '@abcnews/scrollyteller';
import styles from './styles.scss';
import ParallaxGraphic from '../ParallaxGraphic';
import { Layer } from '../ParallaxGraphic/types';
import { reduceMotion } from '../../constants';

interface ParallaxHeaderProps {
  panels: PanelDefinition<Record<string, unknown>>[];
  config: ScrollytellerConfig;
}

layers.reverse();

const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({ config, panels }) => {
  const [progressPct, setProgresPct] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = document.querySelector('.Header.u-full');
    if (header) {
      header.classList.remove(styles.visible, styles.hidden);
      header.classList.add(reduceMotion ? styles.visible : styles.hidden);
    }
  }, []);

  useEffect(() => {
    const parent = ref.current?.parentElement;
    panels.forEach(p => p.nodes.forEach(n => parent?.parentElement?.insertBefore(n, parent)));
  }, [panels]);

  if (reduceMotion) {
    return <div ref={ref} />;
  }

  return (
    <Scrollyteller
      {...config}
      waypoint={0}
      panels={panels}
      panelClassName={styles.panel}
      onProgress={({ overall: { pctAboveFold } }) => {
        setProgresPct(pctAboveFold > 0 ? pctAboveFold : 0);
      }}
      theme="light"
    >
      <ParallaxGraphic pct={progressPct} layers={layers as Layer[]} />
    </Scrollyteller>
  );
};

export default ParallaxHeader;
