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

export const budget = 1800;

export const limits: LimitSpec[] = [
  { emissions: 600, label: '0.5 degrees' },
  { emissions: 1200, label: '1 degree' },
  { emissions: 1800, label: '1.5 degrees' }
];

export const presets: { [key: string]: Mark } = {};
