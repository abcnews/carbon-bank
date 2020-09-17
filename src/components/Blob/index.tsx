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
    vectorEffect?: string;
  };
}

const blobPathDiameter = 100;
const blobPath: string = `M 57.0856265,0.503005335
     C 42.4235904,-1.89492963 22.7479956,4.50743086 13.1937981,14.879601
     C 7.95822555,20.567616 4.81505726,28.0131726 2.81845351,35.5956192
     C -0.756088302,49.2441708 -0.933429131,63.6069021 2.30295566,77.3454922
     C 3.02830219,80.4105692 3.97566254,83.5370106 5.99659657,85.9003298
     C 8.06467053,88.320293 11.0238411,89.6766053 13.8872111,90.9652593
     C 24.197168,95.5990641 34.928343,100.322555 46.1643712,99.9826906
     C 61.7828915,99.5106562 75.4063287,89.457896 87.9455477,79.8110855
     C 91.7988561,76.8467092 95.790543,73.7155474 97.9285665,69.2689829
     C 100.110689,64.7327319 100.072673,59.4396524 99.9571037,54.3747228
     C 99.751817,45.4060684 99.6529752,36.3823433 94.841662,28.6063626
     C 90.2341149,21.1529387 83.1692093,15.606534 76.3871432,10.4267428
     C 72.013775,7.08788581 67.5537303,3.70182541 62.4200408,1.85774419
     C 60.6840671,1.24400993 58.8989475,0.790657277 57.0856265,0.503005335
     Z`;

const Blob: React.FC<BlobProps> = ({ cx = 0, cy = 0, r = 0, r2 = 0, attrs = {}, scale = 1, id }) => {
  const d1 = Path(reverse(blobPath))
    .rotate(-90, blobPathDiameter / 2, blobPathDiameter / 2)
    .scale(r / (blobPathDiameter / 2))
    .translate(cx - r, cy - r)
    .toString();
  const d2 =
    r2 <= 0
      ? ''
      : Path(blobPath)
          .scale(r2 / (blobPathDiameter / 2))
          .translate(cx - r2, cy - r2)
          .toString();

  return (
    <path
      id={id}
      d={d1 + d2}
      style={{ transform: `scale(${scale})` }}
      {...attrs}
      transform-origin="center"
      className={styles.blob}
    />
  );
};

export default Blob;
