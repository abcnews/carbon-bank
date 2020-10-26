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
};

export const budget = 1800;

export const limits: LimitSpec[] = [
  { emissions: 600, label: '0.5 degrees' },
  { emissions: 1200, label: '1 degree' },
  { emissions: 1800, label: '1.5 degrees' }
];

export const marks: Mark[] = [
  {
    useProgress: true,
    labels: ['carbon'],
    blobs: [{ id: 'carbon', emissions: 20 }]
  },
  {
    useProgress: true,
    blobs: [{ id: 'carbon', emissions: 200 }]
  },
  {
    useProgress: true,
    blobs: [
      { id: 'sink', emissions: 200 },
      { id: 'carbon', emissions: 100 }
    ]
  },
  {
    useProgress: true,
    blobs: [{ id: 'carbon', emissions: 100 }]
  },
  {
    useProgress: true,
    blobs: [{ id: 'carbon', emissions: 600 }],
    limits: [0]
  },
  {
    useProgress: true,
    blobs: [{ id: 'carbon', emissions: 600 }],
    limits: [0, 1]
  },
  {
    useProgress: true,
    blobs: [{ id: 'carbon', emissions: 1200 }],
    limits: [0, 1, 2]
  },
  {
    blobs: [{ id: 'carbon', emissions: 50 }],
    chart: {
      xAxisExtent: [1850, 2020],
      labelYears: [1920],
      stopAt: 1920
    }
  },
  {
    blobs: [{ id: 'carbon', emissions: 50 }],
    chart: {
      xAxisExtent: [1900, 2150],
      labelYears: [1970],
      stopAt: 1970
    }
  },
  {
    blobs: [{ id: 'carbon', emissions: 50 }],
    chart: {
      xAxisExtent: [1900, 2150],
      labelYears: [1970],
      stopAt: 1970,
      extend: 'reduce'
    }
  },
  {
    blobs: [
      { id: 'carbon', emissions: 20 },
      { id: 'sink', emissions: 20 },
      { id: 'future', emissions: 20 }
    ]
  }
];
