import React, { useMemo } from 'react';
import styles from './styles.scss';
import LiquidBlob from '../LiquidBlob';
import useDimensions from 'react-cool-dimensions';
import { animationDuration, limits } from '../../constants';
import BankLimit from '../BankLimit';
import { NodeGroup } from 'react-move';
import { easeQuadOut } from 'd3-ease';

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
  scale: (emissions: number) => number; // The number that defines 100% for the rendered blob
  limits: number[] | undefined;
  blobs: BlobSpec[];
  nextBlobs: BlobSpec[];
  progress?: number | false;
};

const Bank: React.FC<BankProps> = ({ blobs, nextBlobs, scale, limits: visibleLimits = [], progress }) => {
  const { observe, width, height } = useDimensions<HTMLDivElement | null>();
  const dim = Math.min(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const empty: BlobSpec[] = [];

  const renderedLimits = useMemo(
    () =>
      limits.map(({ emissions, label }, i) => {
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
      }),
    [visibleLimits, cx, cy, scale]
  );

  return (
    <div ref={observe} className={styles.stage}>
      <svg width="100%" height="100%">
        {renderedLimits}
        <NodeGroup
          data={dim > 0 ? [...blobs.filter(d => d.emissions > 0)] : empty}
          keyAccessor={d => d.id}
          start={(blob: BlobSpec) => ({
            r: scale(blob.emissions),
            opacity: 1,
            timing: { duration: animationDuration, ease: easeQuadOut }
          })}
          enter={(blob: BlobSpec) => ({
            r: [scale(blob.emissions)],
            opacity: [1],
            timing: { duration: animationDuration, ease: easeQuadOut }
          })}
          update={(blob: BlobSpec) => {
            const nextBlob = nextBlobs.filter(d => d.emissions > 0).find(d => d.id === blob.id);
            if (progress && progress > 0) {
              return nextBlob
                ? {
                    r: [scale(blob.emissions + (nextBlob.emissions - blob.emissions) * progress)],
                    opacity: [1],
                    timing: { duration: animationDuration, ease: easeQuadOut }
                  }
                : {
                    r: [scale(blob.emissions)],
                    opacity: [1 - progress],
                    timing: { duration: animationDuration, ease: easeQuadOut }
                  };
            } else {
              return {
                r: [scale(blob.emissions)],
                opacity: [1],
                timing: { duration: animationDuration, ease: easeQuadOut }
              };
            }
          }}
          leave={(blob: BlobSpec) => {
            return {
              r: [scale(blob.emissions)],
              opacity: [0],
              timing: { duration: animationDuration, ease: easeQuadOut }
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
                      attrs={{ fill: data.id === 'sink' ? '#538472' : data.id === 'future' ? '#DD7936' : '#000' }}
                      showControlPoints={false}
                    />
                  </g>
                );
              })}
            </>
          )}
        </NodeGroup>
      </svg>
    </div>
  );
};

export default Bank;
