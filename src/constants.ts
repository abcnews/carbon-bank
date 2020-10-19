// Blobs

import { BlobSpec, LimitSpec } from './components/Bank';
import { EmissionsSeries } from './components/YearlyEmissions';
import data from './data.tsv';

type BlobUpdate = {
  emissions?: number;
  opacity?: number;
};

export type Mark = {
  blobs: BlobSpec[];
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
    blobs: [{ id: 'carbon', emissions: 20 }]
  },
  {
    blobs: [{ id: 'carbon', emissions: 200 }]
  },
  {
    blobs: [
      { id: 'sink', emissions: 200 },
      { id: 'carbon', emissions: 100 }
    ]
  },
  {
    blobs: [{ id: 'carbon', emissions: 100 }]
  },
  {
    blobs: [{ id: 'carbon', emissions: 100 }]
  },
  {
    blobs: [
      { id: 'carbon', emissions: 50 },
      { id: 'sink', emissions: 20 },
      { id: 'future', emissions: 20 }
    ],
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
    blobs: [
      { id: 'carbon', emissions: 20 },
      { id: 'sink', emissions: 20 },
      { id: 'future', emissions: 20 }
    ]
  }
];
