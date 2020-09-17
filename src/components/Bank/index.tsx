import React from 'react';
import styles from './styles.scss';
import Blob from '../Blob';
import { scaleSqrt } from 'd3-scale';
import { arc } from 'd3-shape';
import useDimensions from 'react-cool-dimensions';

export type BlobSpec = {
  size: number;
  id?: string;
  fill?: string;
  stroke?: string;
  strokeDasharray?: string;
  label?: string;
};

export type BankProps = {
  budget: number;
  blobs: BlobSpec[];
};

const Bank: React.FC<BankProps> = ({ blobs, budget }) => {
  const { ref, width } = useDimensions<HTMLDivElement>();

  const margin: number = 10;

  const scale = scaleSqrt()
    .domain([0, budget * 1.2])
    .range([0, 1]);

  const progress = arc()
    .innerRadius(scale(budget))
    .outerRadius(scale(budget))
    .startAngle(0)
    .endAngle(Math.PI / 3);

  return (
    <div ref={ref} className={styles.stage}>
      <svg width={width} height={width}>
        <defs>
          {blobs.map(({ id, size, fill, stroke, strokeDasharray, label }, i) => (
            <Blob
              id={'blob-' + (id || i)}
              key={id || i}
              attrs={{ fill, stroke, strokeDasharray }}
              cx={width / 2}
              cy={width / 2}
              r={((scale(budget) * width) / 2) * size + 10}
              scale={1}
            />
          ))}
        </defs>

        {blobs.map(({ id, size, fill, stroke, strokeDasharray, label }, i) => (
          <g key={id || i}>
            <Blob
              attrs={{ fill, stroke, strokeDasharray }}
              cx={width / 2}
              cy={width / 2}
              r={(scale(budget) * width) / 2}
              scale={size}
            />
            <text textAnchor="middle" fill="pink">
              <textPath startOffset="23%" href={'#blob-' + (id || i)}>
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
