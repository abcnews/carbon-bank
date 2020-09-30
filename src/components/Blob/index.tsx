import React from 'react';
import styles from './styles.scss';
import Path from 'svgpath';
import { reverse } from 'svg-path-reverse';

interface BlobProps {
  id?: string;
  cx?: number;
  cy?: number;
  r?: number;
  r2?: number;
  scale?: number;
  attrs?: {
    className?: string;
    stroke?: string;
    strokeWidth?: string;
    strokeDasharray?: string;
    fill?: string;
  };
}

const blobPathDiameter = 100;
const blobPathRadius = blobPathDiameter / 2;
const blobPath: string = `M42.914 99.497C41.101 99.209 39.316 98.756 37.58 98.142 32.446 96.298 27.986 92.912 23.613 89.573 16.831 84.393 9.766 78.847 5.158 71.394 0.347 63.618 0.248 54.594 0.043 45.625-0.073 40.56-0.111 35.267 2.071 30.731 4.209 26.284 8.201 23.153 12.054 20.189 24.594 10.542 38.217 0.489 53.836 0.017 65.072-0.323 75.803 4.401 86.113 9.035 88.976 10.323 91.935 11.68 94.003 14.1 96.024 16.463 96.972 19.589 97.697 22.655 100.933 36.393 100.756 50.756 97.182 64.404 95.185 71.987 92.042 79.432 86.806 85.12 77.252 95.493 57.576 101.895 42.914 99.497Z`;
const scaleFn = (r: number): number => r / blobPathRadius;

const Blob: React.FC<BlobProps> = ({ cx = 0, cy = 0, r = 0, r2 = 0, attrs = {}, scale = 1, id }) => {
  const d1 = Path(blobPath)
    .scale(r / blobPathRadius)
    .translate(cx - r, cy - r)
    .toString();
  const d2 =
    r2 <= 0
      ? ''
      : Path(reverse(blobPath))
          .scale(r2 / blobPathRadius)
          .translate(cx - r2, cy - r2)
          .toString();

  return (
    <path
      id={id}
      d={d1 + d2}
      style={{
        transform: `translate(${cx}px, ${cy}px) scale(${scale}) translate(${-cx}px, ${-cy}px)`
      }}
      vectorEffect="non-scaling-stroke"
      className={styles.blob}
      {...attrs}
    />
  );
};

export default Blob;
