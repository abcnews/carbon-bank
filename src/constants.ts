// Blobs

import { BlobSpec } from './components/Bank';

type Mark = {
  label: string;
  blobs: BlobSpec[];
};

export const marks: Mark[] = [
  {
    label: '1',
    blobs: [{ id: 'coal', size: 20 }]
  },
  {
    label: '2',
    blobs: [
      { id: 'sink', size: 80, fill: '#0A594D', opacity: 1 },
      { id: 'coal', size: 100 }
    ]
  },
  {
    label: '3',
    blobs: [
      { id: 'sink', size: 200, fill: '#0A594D', opacity: 1 },
      { id: 'coal', size: 100 }
    ]
  },
  {
    label: '4',
    blobs: [
      { id: 'sink', size: 200, fill: '#0A594D', opacity: 0 },
      { id: 'coal', size: 100 }
    ]
  },
  {
    label: '5',
    blobs: [
      { id: 'coal', size: 100 },
      { id: 'halfdeg', size: 105, strokeDasharray: '3 3', fill: 'none', stroke: '#aaa', label: '0.5 degrees' }
    ]
  },
  {
    label: '6',
    blobs: [
      { id: 'coal', size: 100 },
      { id: 'halfdeg', size: 600, strokeDasharray: '3 3', fill: 'none', stroke: '#aaa', label: '0.5 degrees' },
      { id: 'onedeg', size: 1200, strokeDasharray: '3 3', fill: 'none', stroke: '#888', label: '1 degree' }
    ]
  },
  {
    label: '7',
    blobs: [
      { id: 'coal', size: 200 },
      { id: 'halfdeg', size: 600, strokeDasharray: '3 3', fill: 'none', stroke: '#aaa', label: '0.5 degrees' },
      { id: 'onedeg', size: 1200, strokeDasharray: '3 3', fill: 'none', stroke: '#888', label: '1 degree' },
      { id: 'onepointfivedeg', size: 1800, strokeDasharray: '3 3', fill: 'none', stroke: '#888', label: '1.5 degree' }
    ]
  }
];
