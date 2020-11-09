import React from 'react';
import styles from './styles.scss';
import LiquidBlob from '../LiquidBlob';
import { scaleSqrt } from 'd3-scale';
import useDimensions from 'react-cool-dimensions';
import { limits } from '../../constants';
import BankLimit from '../BankLimit';
import { NodeGroup } from 'react-move';

export type BlobSpec = {
  id: string;
  emissions: number;
  opacity?: number;
  fill?: string;
  stroke?: string;
  strokeDasharray?: string;
  label?: string;
};

export type LimitSpec = {
  emissions: number;
  label: string;
};

export type BankProps = {
  budget: number; // The number that defines 100% for the rendered blob
  limits: number[] | undefined;
  blobs: BlobSpec[];
  nextBlobs: BlobSpec[];
  progress?: number | false;
};

const Bank: React.FC<BankProps> = ({ blobs, nextBlobs, budget, limits: visibleLimits = [], progress }) => {
  const { ref, width, height } = useDimensions<HTMLDivElement>();
  const verticalSpaceAvailable = 0.8;
  const dim = Math.min(width, height * verticalSpaceAvailable);
  const cx = width / 2;
  const cy = (height * verticalSpaceAvailable) / 2;
  const scale = scaleSqrt()
    .domain([0, budget * 1.2])
    .range([0, 1]);

  return (
    <div ref={ref} className={styles.stage}>
      <svg width={width} height={height}>
        <NodeGroup
          data={blobs}
          keyAccessor={d => d.id}
          start={blob => ({ r: (scale(blob.emissions) * dim) / 2, opacity: 1 })}
          enter={blob => ({ r: (scale(blob.emissions) * dim) / 2, opacity: 1 })}
          update={blob => {
            const nextBlob = nextBlobs.find(d => d.id === blob.id);

            return progress && progress > 0
              ? nextBlob
                ? {
                    r: (scale(blob.emissions + (nextBlob.emissions - blob.emissions) * progress) * dim) / 2,
                    opacity: 1
                  }
                : { scale: (scale(blob.emissions) * dim) / 2, opacity: 1 - progress }
              : { scale: (scale(blob.emissions) * dim) / 2, opacity: 1 };
          }}
          leave={blob => ({ r: (scale(blob.emissions) * dim) / 2, opacity: 1 })}
        >
          {nodes => (
            <>
              {nodes.map(({ key, data, state: { opacity, r } }) => (
                <g key={key} style={{ opacity }}>
                  <LiquidBlob cx={cx} cy={cy} r={r} attrs={{ fill: data.id === 'sink' ? '#0A594D' : '#000' }} />
                </g>
              ))}
            </>
          )}
        </NodeGroup>

        {limits.map(({ emissions, label }, i) => {
          return (
            <BankLimit
              key={`id-${i}`}
              r={(scale(emissions) * dim) / 2}
              cx={cx}
              cy={cy}
              label={label}
              visible={visibleLimits.includes(i)}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default Bank;
