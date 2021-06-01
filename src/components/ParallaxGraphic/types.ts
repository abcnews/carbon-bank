export enum TweenableProperty {
  X = 'x',
  Y = 'y',
  O = 'o',
  S = 's'
}

export type TAnimation = {
  name: string;
  layers: Layer[];
};

export type TKeyframe = {
  id: string;
  time: number;
  value: number;
};

export type Layer = {
  id: string;
  name: string;
  src?: string;
  tweens: Tween[];
  constrainWidth: boolean;
  widthConstraint: SizeConstraint;
  constrainHeight: boolean;
  heightConstraint: SizeConstraint;
  objectFit: 'cover' | 'contain' | 'fill' | 'none';
};

export type Tween = {
  property: TweenableProperty;
  keyframes: TKeyframe[];
};

export type SizeConstraint = {
  min: number;
  max: number;
  target: number;
};
