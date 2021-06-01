import React, { useMemo } from 'react';
import YearlyEmissions from '../YearlyEmissions';
import Bank from '../Bank';
import data from '../../data.tsv';
import styles from './styles.scss';
import { Mark, budget, animationDuration, labelList, reduceMotion } from '../../constants';
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

type Label = {
  id: string;
  text: string;
  direction: number;
  curved: boolean;
};

const Viz: React.FC<VizProps> = ({ current: _current, progress, className }) => {
  const {
    observe: bankContainerRef,
    width: bankContainerWidth,
    height: bankContainerHeight
  } = useDimensions<HTMLDivElement | null>();
  const current = JSON.parse(JSON.stringify(_current)) as Mark;

  // This is what's specified in the data
  // TODO: refactor to remove all future blob stuff
  const limits = current.limits;
  const from = current.blobs.filter(d => d.id !== 'future');
  const to = current.next?.blobs.filter(d => d.id !== 'future') || from;

  // Handle years for the carbon blob
  // TODO: Take this out and just assume it's always years
  from.forEach(blob => {
    if (blob.emissions >= 1800) blob.emissions = emissionsTo(blob.emissions) / 1000000000;
  });
  to.forEach(blob => {
    if (blob.emissions >= 1800) blob.emissions = emissionsTo(blob.emissions) / 1000000000;
  });

  // If we have a chart too, we want to auto-add (or override) some blob values.
  if (current.chart && current.chart.stopAt) {
    const carbonBlobFrom = from.find(d => d.id === 'carbon');
    if (carbonBlobFrom) carbonBlobFrom.emissions = emissionsTo(current.chart.stopAt) / 1000000000;

    if (current.chart.extend) {
      const futureBlob = from.find(d => d.id === 'future');
      if (futureBlob) futureBlob.emissions = budget;
    }
  }

  if (current.next?.chart && current.next?.chart?.stopAt) {
    const carbonBlobTo = to.find(d => d.id === 'carbon');
    if (carbonBlobTo) carbonBlobTo.emissions = emissionsTo(current.next.chart.stopAt) / 1000000000;
  }

  // Create the series
  const chartSeries = useMemo(() => {
    if (!current.chart) return null;
    const { minYear, maxYear, stopAt, extend } = current.chart;
    return getEmissionsSeries(minYear, maxYear, stopAt, extend);
  }, [current.chart]);

  const limitReachedIn = chartSeries && chartSeries[chartSeries.length - 1].year + 1;

  const bankScale = useMemo(
    () =>
      scaleSqrt()
        .domain([0, budget * 1.5])
        .range([0, Math.min(bankContainerHeight, bankContainerWidth) / 2]),
    [budget, bankContainerHeight, bankContainerWidth]
  );

  const carbonEmissions =
    (from.find(d => d.id === 'carbon')?.emissions || 0) +
    ((to.find(d => d.id === 'carbon')?.emissions || 0) - (from.find(d => d.id === 'carbon')?.emissions || 0)) *
      Math.max((reduceMotion ? 0 : progress) || 0, 0);

  const getLabelStyle = (id: string) => {
    switch (id) {
      case 'carbon':
        return getBankLabelPosition(carbonEmissions, -45, bankScale);
      case 'budget':
      case 'limit':
        return getBankLabelPosition(budget * 0.85, 20, bankScale);
      case 'emissions1940':
        return getBankLabelPosition((emissionsTo(1940) / 1000000000) * 1.2, 120, bankScale);
      case 'sink':
        return getBankLabelPosition(carbonEmissions * 2, 120, bankScale);
      default:
        return {};
    }
  };

  return (
    <div className={styles.root}>
      <div className={`${styles.stage} ${className}`}>
        <div ref={bankContainerRef} className={styles.bank}>
          <Bank scale={bankScale} limits={limits} blobs={from} nextBlobs={to} progress={reduceMotion ? 0 : progress} />
        </div>
        <div className={styles.limitReached}>
          <Animate
            show={!!limitReachedIn && !!current.chart?.extend}
            start={{ opacity: 0, year: limitReachedIn || 0 }}
            enter={{ opacity: [1], year: limitReachedIn || 0 }}
            update={{ opacity: 1, year: [limitReachedIn || 0], timing: { duration: animationDuration * 2 } }}
            leave={[
              { opacity: [0], timing: { duration: animationDuration } },
              {
                year: [limitReachedIn || 0],
                timing: { delay: animationDuration }
              }
            ]}
          >
            {({ year, opacity }) => (
              <span style={{ opacity }}>
                1.5 degree limit reached in <strong>{Math.floor(year)}</strong>
              </span>
            )}
          </Animate>
        </div>
        <div className={styles.chart}>
          {chartSeries && current.chart && (
            <YearlyEmissions
              series={chartSeries}
              labelYears={current.chart.labelYears}
              maxYear={current.chart.maxYear}
            />
          )}
        </div>
        <div className={styles.labels}>
          {labelList.map(({ id, curved, direction, text }) => (
            <Label
              key={id}
              arrow={curved ? 'curved' : 'straight'}
              visible={getLabelVisibility(current.labels, id)}
              className={styles[id + 'Label']}
              direction={direction}
              style={getLabelStyle(id)}
            >
              {text}
            </Label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Viz;
