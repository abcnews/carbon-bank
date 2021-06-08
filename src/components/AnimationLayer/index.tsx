import React from 'react';
import { Layer, TKeyframe, TweenableProperty } from '../ParallaxGraphic/types';
import styles from './styles.scss';
import useDimensions from 'react-cool-dimensions';

type AnimationLayerProps = {
  progress: number;
  layer: Layer;
  stageWidth: number;
  stageHeight: number;
};

export type Tween = {
  property: TweenableProperty;
  keyframes: TKeyframe[];
};

export const tweenablePropertyLabel = (p: TweenableProperty): string => {
  switch (p) {
    case TweenableProperty.X:
      return 'x position';
    case TweenableProperty.Y:
      return 'y position';
    case TweenableProperty.O:
      return 'opacity';
    case TweenableProperty.S:
      return 'scale';
  }
};

export const getTweenKeyframes = (
  tweens: Tween[],
  property: TweenableProperty,
  time: number
): [TKeyframe, TKeyframe] => {
  const tween = tweens.find(d => d.property === property);
  const defaultValue = property === TweenableProperty.O || property === TweenableProperty.S ? 1 : 0;
  return getKeyframes(tween, time, defaultValue);
};

export const getKeyframes = (tween: Tween | undefined, time: number, defaultValue = 0): [TKeyframe, TKeyframe] => {
  let from: TKeyframe = { id: 'tmp', time: 0, value: defaultValue };
  let to: TKeyframe = { id: 'tmp', time: 1, value: defaultValue };

  // If there is no tween of this type, return the default keyframes
  if (typeof tween === 'undefined') {
    return [from, to];
  }

  for (const keyframe of tween.keyframes) {
    if (keyframe.time <= time) from = keyframe;
    if (keyframe.time >= time) {
      to = keyframe;
      break;
    }
  }

  return [from, to];
};

export const interpolate = (time: number, [from, to]: [TKeyframe, TKeyframe]): number => {
  if (to.time === from.time) {
    return from.value;
  }
  const totalTime = to.time - from.time;
  const totalValue = to.value - from.value;
  const result = ((time - from.time) / totalTime) * totalValue + from.value;
  return result;
};

const AnimationLayer: React.FC<AnimationLayerProps> = ({ progress, layer, stageWidth, stageHeight }) => {
  const { observe, width: layerWidth, height: layerHeight } = useDimensions<HTMLDivElement | null>();

  const x = interpolate(progress, getTweenKeyframes(layer.tweens, TweenableProperty.X, progress));
  const y = interpolate(progress, getTweenKeyframes(layer.tweens, TweenableProperty.Y, progress));
  const o = interpolate(progress, getTweenKeyframes(layer.tweens, TweenableProperty.O, progress));
  const s = interpolate(progress, getTweenKeyframes(layer.tweens, TweenableProperty.S, progress));

  const style: {
    maxWidth: string;
    transform: string;
    opacity: number;
    width?: string;
    height?: string;
    objectFit?: typeof layer.objectFit;
  } = {
    maxWidth: 'none',
    opacity: o,
    transform: `translate(${x * stageWidth - layerWidth * -x}px, ${y * stageHeight - layerHeight * -y}px) scale(${s})`
  };

  if (layer.constrainWidth) {
    style.width = `clamp(${layer.widthConstraint.min}px, ${stageWidth * (layer.widthConstraint.target / 100)}px, ${
      layer.widthConstraint.max
    }px)`;
  }

  if (layer.constrainHeight) {
    style.height = `clamp(${layer.heightConstraint.min}px, ${stageHeight * (layer.heightConstraint.target / 100)}px, ${
      layer.heightConstraint.max
    }px)`;
  }

  if (layer.constrainHeight && layer.constrainWidth) {
    style.objectFit = layer.objectFit;
  }

  return layer.src ? (
    <div className={styles.layer} ref={observe}>
      <img style={style} src={layer.src} alt={layer.name} />
    </div>
  ) : null;
};

export default AnimationLayer;
