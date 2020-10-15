// Blobs

import { BlobSpec, LimitSpec } from './components/Bank';
import { EmissionsSeries } from './components/YearlyEmissions';
import data from './data.tsv';

type BlobUpdate = {
  emissions?: number;
  opacity?: number;
};

export type Mark = {
  carbon: BlobSpec;
  sink?: BlobSpec;
  future?: BlobSpec;
  series?: EmissionsSeries[];
  limits?: number[];
  labels?: string[];
};

export const limits: LimitSpec[] = [
  { emissions: 600, label: '0.5 degrees' },
  { emissions: 1200, label: '1 degree' },
  { emissions: 1800, label: '1.5 degrees' }
];

export const marks: Mark[] = [
  {
    labels: ['carbon'],
    carbon: { id: 'carbon', emissions: 600 }
  },
  {
    labels: ['carbon'],
    limits: [0, 1, 2],
    carbon: { id: 'carbon', emissions: 500 }
  },
  {
    carbon: { id: 'carbon', emissions: 50 },
    sink: { id: 'sink', emissions: 20 },
    future: { id: 'future', emissions: 20 },
    series: [
      {
        data: data,
        meta: {
          color: '#000'
        }
      }
    ]
  },
  {
    carbon: { id: 'carbon', emissions: 20 },
    sink: { id: 'sink', emissions: 20 },
    future: { id: 'future', emissions: 20 }
  }
];
