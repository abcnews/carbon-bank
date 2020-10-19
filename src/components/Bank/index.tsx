import React from 'react';
import styles from './styles.scss';
import LiquidBlob from '../LiquidBlob';
import { scaleSqrt } from 'd3-scale';
import useDimensions from 'react-cool-dimensions';
import { useSpring, animated } from 'react-spring';
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
  carbon: BlobSpec;
  sink?: BlobSpec;
  future?: BlobSpec;
};

const Bank: React.FC<BankProps> = ({ budget, carbon, future, sink, limits: visibleLimits }) => {
  const { ref, width, height } = useDimensions<HTMLDivElement>();
  const verticalSpaceAvailable = 0.8;
  const dim = Math.min(width, height * verticalSpaceAvailable);
  const cx = width / 2;
  const cy = (height * verticalSpaceAvailable) / 2;
  const scale = scaleSqrt().domain([0, budget]).range([0, 1]);

  // Springy things
  const sprungCarbon = useSpring({ r: (scale(carbon.emissions) * dim) / 2 });
  const sprungSink = useSpring({ r: (scale(sink?.emissions || 0) * dim) / 2 });
  const sprungFuture = useSpring({ r: (scale(future?.emissions || 0) * dim) / 2 });

  return (
    <div ref={ref} className={styles.stage}>
      <svg width={width} height={height}>
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

        <AnimatedLiquidBlob cx={cx} cy={cy} r={sprungCarbon.r} />
        {sprungSink.r && <LiquidBlob cx={cx} cy={cy} r={sprungSink.r} attrs={{ fill: '#0A594D' }} />}
        {sprungFuture.r && <LiquidBlob cx={cx} cy={cy} r={sprungFuture.r} />}
      </svg>
    </div>
  );
};

export default Bank;
