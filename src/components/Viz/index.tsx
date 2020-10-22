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

const Viz: React.FC<VizProps> = ({ current }) => {
  const previous = usePrevious<Mark>(current);
  const carbonLabel = useTransition(current.labels?.includes('carbon'), null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  });
  console.log('viz');
  return (
    <div className={styles.root}>
      <Bank budget={budget} limits={current.limits || []} blobs={current.blobs} />

      {carbonLabel.map(
        ({ item, key, props }) =>
          item && (
            <animated.div key={key} className={styles.carbonLabel} style={props}>
              This is carbon
            </animated.div>
          )
      )}

      {current.chart && <YearlyEmissions {...current.chart} />}
    </div>
  );
};

export default Viz;
