import { decode } from '@abcnews/base-36-props';
import { ScalePower } from 'd3-scale';
import { useEffect, useRef } from 'react';
import { PanelData } from './common.d';
import { EmissionsSeries, ExtendMethod } from './components/YearlyEmissions';
import { budget, Mark, presets } from './constants';
import data from './data.tsv';

export const timeLeft = (allowedEmissions: number, peak: number, reduce = true): number => {
  return reduce ? (allowedEmissions * 2) / peak : allowedEmissions / peak;
};

export const generateSeries = (allowedEmissions: number, peak: number, reduce = true): number[] => {
  if (allowedEmissions === 0) return [];
  const years = timeLeft(allowedEmissions, peak, reduce);
  const slope = reduce ? -peak / years : 0;
  const series: number[] = [];
  for (let i = 1; i <= years; i++) series.push(i * slope + peak);
  return series;
};

export const interpolate = (start: number, end: number | undefined, progress: number): number =>
  typeof start === 'undefined' || typeof end === 'undefined' ? start : start + (end - start) * progress;

export const emissionsTo = (y: number): number =>
  data.reduce((t, { year, emissions }) => (year > y ? t : t + emissions), 0);

export const panelDataToMark = (panelData: PanelData): Mark => {
  // Presets
  let preset: Mark | Record<string, unknown> = {};
  if (panelData.preset) {
    try {
      preset = decode(panelData.preset) as Mark;
    } catch (e) {
      if (presets[panelData.preset]) {
        preset = presets[panelData.preset];
      }
    }
  }

  const mark: Mark = {
    ...{ blobs: [{ id: 'carbon', emissions: 0 }] },
    ...preset
  };

  // Limits
  mark.limits = panelData.limits
    ? Array.isArray(panelData.limits)
      ? panelData.limits
      : [panelData.limits]
    : mark.limits;

  // Other custom labels
  mark.labels = Array.isArray(panelData.labels)
    ? panelData.labels
    : panelData.labels
    ? [panelData.labels]
    : mark.labels;

  // BLOBS

  // The carbon blob
  if (panelData.carbon) {
    const carbonBlob = mark.blobs.find(d => d.id === 'carbon');
    if (carbonBlob) {
      carbonBlob.emissions = panelData.carbon;
    } else {
      mark.blobs.push({ id: 'carbon', emissions: panelData.carbon });
    }
  }

  // The sink blob
  if (panelData.sink) {
    const sinkBlob = mark.blobs.find(d => d.id === 'sink');
    if (sinkBlob) {
      sinkBlob.emissions = panelData.sink;
    } else {
      mark.blobs.unshift({ id: 'sink', emissions: panelData.sink });
    }
  }

  // CHART

  // xAxisExtent
  if (panelData.xmin || panelData.xmax) {
    const minYear = panelData.xmin || 0;
    const maxYear = panelData.xmax || 2157;

    if (mark.chart) {
      mark.chart.minYear = minYear;
      mark.chart.maxYear = maxYear;
    } else {
      mark.chart = { minYear, maxYear };
    }
  }

  // Label years
  if (panelData.labelyear && mark.chart) {
    const labelYears = Array.isArray(panelData.labelyear) ? panelData.labelyear : [panelData.labelyear];
    mark.chart.labelYears = labelYears;
  }

  // stopAt
  if (panelData.stopat && mark.chart) {
    mark.chart.stopAt = panelData.stopat;
  }

  // Method for auto-extending into future
  if (panelData.extend && mark.chart) {
    mark.chart.extend = panelData.extend;
  }

  return mark;
};

export const getUsedBudget = (year: number): number =>
  data.reduce((t, d) => (d.year <= year ? t + d.emissions : t), 0) / 1000000000;
export const getRemainingBudget = (year: number): number => (budget - getUsedBudget(year)) * 1000000000;
export const getEmissionsForYear = (year: number): number | undefined => data.find(d => d.year === year)?.emissions;

export const getCartesianCoordinates = (r: number, deg: number): [number, number] => {
  const deg2rad = deg => deg * (Math.PI / 180);
  return [r * Math.cos(deg2rad(deg)), r * Math.sin(deg2rad(deg))];
};

export const getBankLabelPosition = (
  emissions: number,
  deg: number,
  scale: ScalePower<number, number>
): { top: string; left: string } => {
  const cart = getCartesianCoordinates(scale(emissions) + 10, deg - 25);
  return {
    top: `calc(35% - ${cart[0]}px)`,
    left: `calc(50% + ${cart[1]}px)`
  };
};

export const getLabelVisibility = (labels: string[] | undefined, id: string): boolean => {
  return !!(labels || []).includes(id);
};

export const getEmissionsSeries = (
  minYear: number,
  maxYear: number,
  stopAt: number | undefined,
  extend: ExtendMethod | undefined
): EmissionsSeries[] => {
  const endOfKnownEmissions = data[data.length - 1];
  const startOfKnownEmsissions = data[0];
  const startKnownSeries = Math.max(minYear, startOfKnownEmsissions.year);
  const endKnownSeries = Math.min(stopAt || Infinity, maxYear, endOfKnownEmissions.year);
  const endSeries = Math.min(stopAt || Infinity, maxYear);

  // Calculate the budget
  const remainingBudget = getRemainingBudget(endKnownSeries);

  // What's the final year of of known emissions we want to chart?
  const peak = getEmissionsForYear(endKnownSeries) || data[data.length - 1].emissions;

  const knownEmissions: EmissionsSeries[] = data
    .filter(d => d.year >= startKnownSeries && d.year <= endKnownSeries)
    .map(d => ({ ...d, color: '#000' }));

  let futureEmissions: EmissionsSeries[] = [];

  // Next extend if we want it
  if (extend) {
    const steady = Math.min(endSeries - endKnownSeries, Math.floor(remainingBudget / peak));
    const budget = remainingBudget - steady * peak;
    const steadySeries = generateSeries(steady * peak, peak, false).map((d, i) => ({
      emissions: d,
      year: endKnownSeries + i + 1,
      color: '#599EB7'
    }));
    const remainingSeries = generateSeries(budget, peak, extend === 'reduce').map((d, i) => ({
      emissions: d,
      year: endKnownSeries + 1 + steady + i,
      color: '#DD7936'
    }));
    futureEmissions = [...steadySeries, ...remainingSeries];
  }

  return [...knownEmissions, ...futureEmissions];
};

// Hook

export const usePrevious = <T extends unknown>(value: T): T => {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

export const useTraceUpdate = (props: Record<string, unknown>): void => {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});
    if (Object.keys(changedProps).length > 0) {
      console.log('Changed props:', changedProps);
    }
    prev.current = props;
  });
};
