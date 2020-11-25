import React, { useMemo } from 'react';
import YearlyEmissions from '../YearlyEmissions';
import Bank from '../Bank';
import styles from './styles.scss';
import { Mark, budget } from '../../constants';
import { emissionsTo, getEmissionsForYear, getRemainingBudget, timeLeft } from '../../utils';
import Label from '../Label';
import { greatest } from 'd3-array';
import { Animate } from 'react-move';

interface VizProps {
  current: Mark;
  progress?: number;
  className?: string;
}

const Viz: React.FC<VizProps> = ({ current: _current, progress, className }) => {
  const current = JSON.parse(JSON.stringify(_current)) as Mark;

  const limitReachedIn = useMemo(() => {
    if (!current.chart || !current.chart.extend) return null;
    const {
      chart: { stopAt, maxYear, steady, extend }
    } = current;

    const year = stopAt || maxYear;
    const remainingBudget = getRemainingBudget(year);
    const peak = getEmissionsForYear(year);
    if (!peak) {
      console.error('Error calculating when limit reached');
      return null;
    }
    const budget = steady && steady > 0 ? remainingBudget - steady * peak : remainingBudget;
    return Math.floor(timeLeft(budget, peak, extend === 'reduce')) + year;
  }, [current]);

  // This is what's specified in the data
  const limits = current.limits;
  const from = current.blobs.filter(d => d.id !== 'future');
  const to = current.next?.blobs.filter(d => d.id !== 'future') || from;

  // Handle years for the carbon blob
  from.forEach(blob => {
    if (blob.emissions >= 1800) blob.emissions = emissionsTo(blob.emissions) / 1000000000;
  });
  to.forEach(blob => {
    if (blob.emissions >= 1800) blob.emissions = emissionsTo(blob.emissions) / 1000000000;
  });

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
    <div className={`${styles.root} ${className}`}>
      <Animate
        show={!!limitReachedIn}
        start={{ opacity: 1, year: limitReachedIn || 0 }}
        update={{ opacity: 1, year: [limitReachedIn || 0] }}
        leave={{ opacity: 0, year: limitReachedIn || 0 }}
      >
        {({ year, opacity }) => (
          <div style={{ opacity }} className={styles.limitReached}>
            {Math.floor(year)}
          </div>
        )}
      </Animate>
      <Bank budget={budget} limits={limits} blobs={from} nextBlobs={to} progress={progress} />
      <Label
        arrow="curved"
        visible={!!(current.labels || []).includes('carbon')}
        className={styles.carbonLabel}
        text="This is carbondioxide"
        direction={160}
      />
      {current.chart && <YearlyEmissions {...current.chart} />}
    </div>
  );
};

export default Viz;
