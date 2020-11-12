import { BlobSpec, LimitSpec } from './components/Bank';
import { EmissionsSeries, YearlyEmissionsProps } from './components/YearlyEmissions';
import data from './data.tsv';

type BlobUpdate = {
  emissions?: number;
  opacity?: number;
};

export type Mark = {
  blobs: BlobSpec[];
  useProgress?: boolean;
  chart?: YearlyEmissionsProps;
  limits?: number[];
  labels?: string[];
  next?: Mark;
};

export const budget = 2118.671;

export const limits: LimitSpec[] = [
  { emissions: (budget * 1) / 3, label: '0.5 degrees' },
  { emissions: (budget * 2) / 3, label: '1 degree' },
  { emissions: budget, label: '1.5 degrees' }
];

export const presets: { [key: string]: Mark } = {};

export const animationDuration = 750;

export const SNAPSHOTS_LOCALSTORAGE_KEY = 'bank-viz-snap';
