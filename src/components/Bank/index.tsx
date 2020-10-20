import React from 'react';
import styles from './styles.scss';
import LiquidBlob from '../LiquidBlob';
import { scaleSqrt } from 'd3-scale';
import useDimensions from 'react-cool-dimensions';
import { useSpring, animated, useTransition } from 'react-spring';
import { limits } from '../../constants';
import BankLimit from '../BankLimit';

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
  carbon?: BlobSpec;
  sink?: BlobSpec;
  future?: BlobSpec;
};

const Bank: React.FC<BankProps> = ({ blobs, budget, limits: visibleLimits }) => {
  const { ref, width, height } = useDimensions<HTMLDivElement>();
  const verticalSpaceAvailable = 0.8;
  const dim = Math.min(width, height * verticalSpaceAvailable);
  const cx = width / 2;
  const cy = (height * verticalSpaceAvailable) / 2;
  const scale = scaleSqrt()
    .domain([0, budget * 1.2])
    .range([0, 1]);

  // Springy things
  const blobTransitions = useTransition(blobs, blob => blob.id, {
    initial: ({ emissions }) => ({ scale: (scale(emissions) * dim) / 2, opacity: 0 }),
    enter: ({ emissions }) => ({ scale: (scale(emissions) * dim) / 2, opacity: 1 }),
    from: ({ emissions }) => ({ scale: (scale(emissions) * dim) / 2, opacity: 0 }),
    update: ({ emissions }) => ({ scale: (scale(emissions) * dim) / 2, opacity: 1 }),
    leave: ({ emissions }) => ({ scale: (scale(emissions) * dim) / 2, opacity: 0 }),
    unique: true
  });

  return (
    <div ref={ref} className={styles.stage}>
      <svg width={width} height={height}>
        {blobTransitions.map(({ item, key, props, props: { scale, opacity } }) => {
          return (
            <animated.g style={{ opacity: opacity }} key={key}>
              <AnimatedLiquidBlob
                cx={cx}
                cy={cy}
                r={scale as number}
                attrs={{ fill: key === 'sink' ? '#0A594D' : '#000' }}
              />
            </animated.g>
          );
        })}

        {limits.map(({ emissions, label }, i) => (
          <BankLimit
            key={`id-${i}`}
            r={(scale(emissions) * dim) / 2}
            cx={cx}
            cy={cy}
            label={label}
            visible={visibleLimits.includes(i)}
          />
        ))}
      </svg>
    </div>
  );
};

export default Bank;
