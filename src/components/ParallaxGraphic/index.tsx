import React, { useEffect, useRef } from 'react';
import styles from './styles.scss';
import { Layer } from './types';
import AnimationLayer from '../AnimationLayer';
import useDimensions from 'react-cool-dimensions';

interface ParallaxGraphicProps {
  pct: number;
  layers: Layer[];
}

const ParallaxGraphic: React.FC<ParallaxGraphicProps> = ({ pct, layers }) => {
  const { observe, width, height } = useDimensions<HTMLDivElement | null>();
  return (
    <div className={styles.root} ref={observe}>
      {layers.map(layer => (
        <AnimationLayer key={layer.id} layer={layer} stageWidth={width} stageHeight={height} progress={pct} />
      ))}
    </div>
  );
};

export default ParallaxGraphic;
