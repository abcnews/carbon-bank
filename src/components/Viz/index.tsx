import React, { useMemo } from 'react';
import YearlyEmissions from '../YearlyEmissions';
import Bank from '../Bank';
import data from '../../data.tsv';
import styles from './styles.scss';
import { Mark, budget } from '../../constants';
import {
  emissionsTo,
  getBankLabelPosition,
  getCartesianCoordinates,
  getEmissionsForYear,
  getEmissionsSeries,
  getLabelVisibility,
  getRemainingBudget,
  timeLeft
} from '../../utils';
import Label from '../Label';
import { Animate } from 'react-move';
import useDimensions from 'react-cool-dimensions';
import { scaleSqrt } from 'd3-scale';

interface VizProps {
  current: Mark;
  progress?: number;
  className?: string;
}

const Viz: React.FC<VizProps> = ({ current: _current, progress, className }) => {
  const { ref: bankContainerRef, width: bankContainerWidth, height: bankContainerHeight } = useDimensions<
    HTMLDivElement
  >();
  const current = JSON.parse(JSON.stringify(_current)) as Mark;

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

  // Create the series
  const chartSeries = useMemo(() => {
    if (!current.chart) return null;
    const { minYear, maxYear, stopAt, extend } = current.chart;
    return getEmissionsSeries(minYear, maxYear, stopAt, extend);
  }, [current.chart]);

  const limitReachedIn = chartSeries && chartSeries[chartSeries.length - 1].year + 1;

  const bankScale = scaleSqrt()
    .domain([0, budget * 1.5])
    .range([0, Math.min(bankContainerHeight, bankContainerWidth) / 2]);

  return (
    <div className={styles.root}>
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
      <div className={`${styles.stage} ${className}`}>
        <div ref={bankContainerRef} className={styles.bank}>
          <Bank scale={bankScale} limits={limits} blobs={from} nextBlobs={to} progress={progress} />
        </div>
        <div className={styles.chart}>
          {chartSeries && current.chart && (
            <YearlyEmissions data={chartSeries} labelYears={current.chart.labelYears} maxYear={current.chart.maxYear} />
          )}
        </div>
        <div className={styles.labels}>
          <Label
            arrow="curved"
            visible={getLabelVisibility(current.labels, 'carbon')}
            className={styles.carbonLabel}
            direction={160}
            style={getBankLabelPosition(current.blobs.find(d => d.id === 'carbon')?.emissions || 0, -45, bankScale)}
          >
            This is carbondioxide
          </Label>
          <Label
            arrow="curved"
            visible={getLabelVisibility(current.labels, 'limit')}
            className={styles.limitLabel}
            direction={45}
            style={getBankLabelPosition(budget * 0.85, 20, bankScale)}
          >
            1.5 degree carbon limit
          </Label>
          <Label
            arrow="curved"
            visible={getLabelVisibility(current.labels, 'emissions1940')}
            className={styles.emissions1940Label}
            direction={340}
            style={getBankLabelPosition((emissionsTo(1940) / 1000000000) * 1.2, 120, bankScale)}
          >
            Emissions by 1940
          </Label>
        </div>
      </div>
    </div>
  );
};

export default Viz;
