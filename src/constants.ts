// Blobs

import { BlobSpec, LimitSpec } from './components/Bank';
import { EmissionsSeries } from './components/YearlyEmissions';
import data from './data.tsv';

type BlobUpdate = {
  emissions?: number;
  opacity?: number;
};

type Mark = {
  blobs: { [key: string]: BlobUpdate };
  series?: EmissionsSeries[];
  limits?: number[];
};

export const limits: LimitSpec[] = [
  { emissions: 600, label: '0.5 degrees' },
  { emissions: 1200, label: '1 degree' },
  { emissions: 1800, label: '1.5 degrees' }
];

export const blobs: BlobSpec[] = [
  { id: 'coal', size: 20 },
  { id: 'sink', size: 80, fill: '#0A594D', opacity: 1 }
];
export const marks: Mark[] = [
  {
    blobs: { coal: { emissions: 20 } },
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
    blobs: { sink: { emissions: 80 }, coal: { emissions: 100 } }
  },
  {
    blobs: { sink: { emissions: 200 } }
  },
  {
    blobs: {}
  },
  {
    blobs: {},
    limits: [0]
  },
  {
    blobs: {},
    limits: [0, 1]
  },
  {
    blobs: { coal: { emissions: 200 } },
    limits: [0, 1, 2]
  }
];
