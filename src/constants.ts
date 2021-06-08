import { BlobSpec, LimitSpec } from './components/Bank';
import { ExtendMethod } from './components/YearlyEmissions';

type Label = {
  id: string;
  text: string;
  direction: number;
  curved: boolean;
};

export type Mark = {
  blobs: BlobSpec[];
  useProgress?: boolean;
  chart?: { minYear: number; maxYear: number; stopAt?: number; labelYears?: number[]; extend?: ExtendMethod };
  limits?: number[];
  labels?: string[];
  next?: Mark;
  standalone?: boolean;
};

export const budget = 2118.671;

export const limits: LimitSpec[] = [
  { emissions: (budget * 1) / 3, label: '0.5 degrees' },
  { emissions: (budget * 2) / 3, label: '1 degree' },
  { emissions: budget, label: '1.5 degrees' }
];

export const presets: { [key: string]: Mark } = {};

export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const animationDuration = reduceMotion ? 0 : 750;

export const SNAPSHOTS_LOCALSTORAGE_KEY = 'bank-viz-snap';

export const labelList: Label[] = [
  { id: 'carbon', text: 'This is carbon dioxide', curved: true, direction: 160 },
  { id: 'budget', text: 'Carbon budget', curved: true, direction: 45 },
  { id: 'limit', text: '1.5 degree carbon limit', curved: true, direction: 45 },
  { id: 'emissions1940', text: 'Emissions by 1940', curved: true, direction: 340 },
  { id: 'sink', text: 'Absorbed by carbon sinks', curved: true, direction: 340 },
  { id: 'arrow', text: '', curved: false, direction: 190 }
];
