import React from 'react';
import styles from './styles.scss';
import LiquidBlob from '../LiquidBlob';
import { scaleSqrt } from 'd3-scale';
import useDimensions from 'react-cool-dimensions';
import { animationDuration, limits } from '../../constants';
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
    .range([0, dim / 2]);
  const empty: BlobSpec[] = [];

  return (
    <div ref={ref} className={styles.stage}>
      <svg width={width} height={height}>
        <NodeGroup
          data={dim > 0 ? [...blobs] : empty}
          keyAccessor={d => d.id}
          start={(blob: BlobSpec) => ({
            r: scale(blob.emissions),
            opacity: 1,
            timing: { duration: animationDuration }
          })}
          enter={(blob: BlobSpec) => ({
            r: [scale(blob.emissions)],
            opacity: [1],
            timing: { duration: animationDuration }
          })}
          update={(blob: BlobSpec) => {
            const nextBlob = nextBlobs.find(d => d.id === blob.id);

            if (progress && progress > 0) {
              return nextBlob
                ? {
                    r: [scale(blob.emissions + (nextBlob.emissions - blob.emissions) * progress)],
                    opacity: [1],
                    timing: { duration: animationDuration }
                  }
                : {
                    r: [scale(blob.emissions)],
                    opacity: [1 - progress],
                    timing: { duration: animationDuration }
                  };
            } else {
              return {
                r: [scale(blob.emissions)],
                opacity: [1],
                timing: { duration: animationDuration }
              };
            }
          }}
          leave={(blob: BlobSpec) => {
            return {
              r: [scale(blob.emissions)],
              opacity: [0],
              timing: { duration: animationDuration }
            };
          }}
        >
          {(nodes: { key: string; data: BlobSpec; state: { r: number; opacity: number } }[]) => (
            <>
              {nodes.map(({ key, data, state: { opacity, r } }) => {
                return (
                  <g key={key} style={{ opacity }}>
                    <LiquidBlob
                      cx={cx}
                      cy={cy}
                      r={r}
                      attrs={{ fill: data.id === 'sink' ? '#0A594D' : data.id === 'future' ? 'red' : '#000' }}
                      showControlPoints={false}
                    />
                  </g>
                );
              })}
            </>
          )}
        </NodeGroup>

        {limits.map(({ emissions, label }, i) => {
          return (
            <BankLimit
              key={`id-${i}`}
              r={scale(emissions)}
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
