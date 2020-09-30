import React from 'react';
import styles from './styles.scss';
import LiquidBlob from '../LiquidBlob';
import { scaleSqrt } from 'd3-scale';
import { arc } from 'd3-shape';
import useDimensions from 'react-cool-dimensions';

export type BlobSpec = {
  size: number;
  opacity?: number;
  id: string;
  fill?: string;
  stroke?: string;
  strokeDasharray?: string;
  label?: string;
};

export type BankProps = {
  budget: number; // The number that defines 100% for the rendered
  begin: BlobSpec[];
  end: BlobSpec[] | null;
  progress: number;
};

const interp = (start: number | undefined, end: number | undefined, progress: number): number | undefined =>
  typeof start === 'undefined' || typeof end === 'undefined' ? start : start + (end - start) * progress;

const Bank: React.FC<BankProps> = ({ begin, end, progress, budget }) => {
  const { ref, width, height } = useDimensions<HTMLDivElement>();
  const verticalSpaceAvailable = 0.7;
  const dim = Math.min(width, height * verticalSpaceAvailable);
  const cx = width / 2;
  const cy = (height * verticalSpaceAvailable) / 2;
  const scale = scaleSqrt().domain([0, budget]).range([0, 1]);
  const blobs = begin.map(current => {
    const next = end && end.find(d => d.id === current.id);
    if (!next || progress < 0) return current;
    const result: BlobSpec = {
      ...current,
      size: interp(current.size, next.size, progress) || current.size,
      opacity: interp(current.opacity, next.opacity, progress)
    };
    return result;
  });

  console.log('begin, end :>> ', begin, end);

  return (
    <div ref={ref} className={styles.stage}>
      <svg width={width} height={height}>
        <defs>
          {blobs.map(({ id, size }) => (
            <LiquidBlob id={'blob-' + id} key={id} cx={cx} cy={cy} r={((scale(budget) * dim) / 2) * scale(size) + 10} />
          ))}
        </defs>

        {blobs.map(({ id, size, fill, stroke, strokeDasharray, opacity, label }, i) => (
          <g key={id}>
            <LiquidBlob
              showControlPoints={false}
              attrs={{ fill, stroke, strokeDasharray, opacity }}
              cx={cx}
              cy={cy}
              r={((scale(budget) * dim) / 2) * scale(size)}
            />

            <text textAnchor="middle" fill="pink">
              <textPath startOffset="48%" href={'#blob-' + (id || i)}>
                {label}
              </textPath>
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default Bank;
