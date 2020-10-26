import React, { useEffect, useState } from 'react';
import { useAnimateProps } from 'react-animate-props';
import { usePrevious } from '../../utils';
import YearlyEmissions from '../YearlyEmissions';
import Bank from '../Bank';
import styles from './styles.scss';
import { Mark, budget } from '../../constants';
import { useTransition, animated, config } from 'react-spring';

interface VizProps {
  current: Mark;
  next: Mark;
  progress?: number;
}

const Viz: React.FC<VizProps> = ({ current, progress }) => {
  // const previous = usePrevious<Mark>(current);

  const carbonLabel = useTransition(current.labels?.includes('carbon'), {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  });

  return (
    <div className={styles.root}>
      <Bank
        budget={budget}
        limits={current.limits || []}
        blobs={current.blobs}
        progress={current.useProgress ? progress : false}
      />

      {carbonLabel(
        (props, item) =>
          item && (
            <animated.div className={styles.carbonLabel} style={props}>
              This is carbon
            </animated.div>
          )
      )}

      {current.chart && <YearlyEmissions {...current.chart} />}
    </div>
  );
};

export default Viz;
