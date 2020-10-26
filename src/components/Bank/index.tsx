import React from 'react';
import styles from './styles.scss';
import LiquidBlob from '../LiquidBlob';
import { scaleSqrt } from 'd3-scale';
import useDimensions from 'react-cool-dimensions';
import { useSpring, animated, useTransition } from 'react-spring';
import { limits } from '../../constants';
import BankLimit from '../BankLimit';
import { usePrevious } from '../../utils';

const AnimatedLiquidBlob = animated(LiquidBlob);

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
  limits: number[];
  blobs: BlobSpec[];
  progress?: number | false;
};

const Bank: React.FC<BankProps> = ({ blobs, budget, limits: visibleLimits, progress }) => {
  const { ref, width, height } = useDimensions<HTMLDivElement>();
  const oldBlobs = usePrevious(blobs);
  const oldLimits = usePrevious(visibleLimits);

  const verticalSpaceAvailable = 0.8;
  const dim = Math.min(width, height * verticalSpaceAvailable);
  const cx = width / 2;
  const cy = (height * verticalSpaceAvailable) / 2;
  const scale = scaleSqrt()
    .domain([0, budget * 1.2])
    .range([0, 1]);

  // Springy things
  const blobTransitions = useTransition(blobs, {
    keys: blob => blob.id,
    initial: ({ emissions }) => ({ scale: (scale(emissions) * dim) / 2, opacity: 0 }),
    enter: ({ emissions }) => ({ scale: (scale(emissions) * dim) / 2, opacity: 1 }),
    from: ({ emissions }) => ({ scale: (scale(emissions) * dim) / 2, opacity: 0 }),
    update: blob => {
      const oldBlob = oldBlobs.find(d => d.id === blob.id);

      return oldBlob && progress && progress > 0
        ? {
            scale: (scale(oldBlob.emissions + (blob.emissions - oldBlob.emissions) * progress) * dim) / 2,
            opacity: 1
          }
        : { scale: (scale(blob.emissions) * dim) / 2, opacity: 1 };
    },
    leave: ({ emissions }) => ({ scale: (scale(emissions) * dim) / 2, opacity: 0 })
  });

  return (
    <div ref={ref} className={styles.stage}>
      <svg width={width} height={height}>
        {blobTransitions(({ scale, opacity }, blob) => {
          return (
            <animated.g style={{ opacity: opacity }}>
              <AnimatedLiquidBlob cx={cx} cy={cy} r={scale} attrs={{ fill: blob.id === 'sink' ? '#0A594D' : '#000' }} />
            </animated.g>
          );
        })}

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
