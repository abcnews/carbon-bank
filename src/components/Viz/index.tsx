import React, { useEffect, useState } from 'react';
import YearlyEmissions from '../YearlyEmissions';
import Bank from '../Bank';
import styles from './styles.scss';
import { Mark, budget } from '../../constants';
import { useTransition, animated, config } from 'react-spring';

import { emissionsTo } from '../../utils';

interface VizProps {
  current: Mark;
  next: Mark;
  progress?: number;
}

const Viz: React.FC<VizProps> = ({ current, next, progress }) => {
  const carbonLabel = useTransition(progress && progress < 0, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  });

  // This is what's specified in the data
  const limits = current.limits || [];
  const from = current.blobs;
  const to = next?.blobs || [];

  // If we have a chart too, we want to auto-add (or override) some blob values.
  if (current.chart && current.chart.stopAt) {
    const carbonBlob = from.find(d => d.id === 'carbon');
    if (carbonBlob) carbonBlob.emissions = emissionsTo(current.chart.stopAt) / 1000000000;

    if (current.chart.extend) {
      const futureBlob = from.find(d => d.id === 'future');
      if (futureBlob) futureBlob.emissions = budget;
    }
  }

  return (
    <div className={styles.root}>
      <Bank
        budget={budget}
        limits={limits}
        blobs={from}
        nextBlobs={to}
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
