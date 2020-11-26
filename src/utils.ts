import { decode } from '@abcnews/base-36-props';
import { ScalePower } from 'd3-scale';
import { useEffect, useRef } from 'react';
import { PanelData } from './common.d';
import { ExtendMethod } from './components/YearlyEmissions';
import { budget, Mark, presets } from './constants';
import data from './data.tsv';

export const min = (data, accessor = d => d) =>
  data.reduce((min, d) => (accessor(d) < min ? accessor(d) : min), Infinity);

export const max = (data, accessor = d => d) =>
  data.reduce((max, d) => (accessor(d) > max ? accessor(d) : max), -Infinity);

export const timeLeft = (allowedEmissions: number, peak: number, reduce: boolean = true) => {
  return reduce ? (allowedEmissions * 2) / peak : allowedEmissions / peak;
};

export const generateSeries = (allowedEmissions: number, peak: number, reduce: boolean = true) => {
  const years = Math.ceil(timeLeft(allowedEmissions, peak, reduce));
  // console.log('years :>> ', years);
  const slope = reduce ? peak / -years : 1;
  // console.log('slope :>> ', slope);
  const series: number[] = [];
  let used = 0;
  for (let i = 1; i <= years; i++) {
    const yr = i * slope + peak;
    used += yr;
    series.push(yr);
  }
  // The remainder
  // series.push(allowedEmissions - used);
  return series;
};

export const interpolate = (start: number, end: number | undefined, progress: number): number =>
  typeof start === 'undefined' || typeof end === 'undefined' ? start : start + (end - start) * progress;

export const emissionsTo = (y: number) => data.reduce((t, { year, emissions }) => (year > y ? t : t + emissions), 0);

export const panelDataToMark = (panelData: PanelData) => {
  // Presets
  let preset: Mark | Object = {};
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

export const getUsedBudget = (year: number) =>
  data.reduce((t, d) => (d.year <= year ? t + d.emissions : t), 0) / 1000000000;
export const getRemainingBudget = (year: number) => (budget - getUsedBudget(year)) * 1000000000;
export const getEmissionsForYear = (year: number) => data.find(d => d.year === year)?.emissions;

export const getCartesianCoordinates = (r: number, deg: number) => {
  const deg2rad = deg => deg * (Math.PI / 180);
  return [r * Math.cos(deg2rad(deg)), r * Math.sin(deg2rad(deg))];
};

export const getBankLabelPosition = (emissions: number, deg: number, scale: ScalePower<number, number>) => {
  const cart = getCartesianCoordinates(scale(emissions) + 10, deg - 10);
  return {
    top: `calc(35% - ${cart[0]}px)`,
    left: `calc(50% + ${cart[1]}px)`
  };
};

export const getLabelVisibility = (labels: string[] | undefined, id: string) => {
  return !!(labels || []).includes(id);
};

export const getEmissionsSeries = (
  minYear: number,
  maxYear: number,
  stopAt: number | undefined,
  extend: ExtendMethod | undefined
) => {
  const endOfKnownEmissions = data[data.length - 1];
  const startOfKnownEmsissions = data[0];
  const startKnownSeries = Math.max(minYear, startOfKnownEmsissions.year);
  const endKnownSeries = Math.min(stopAt || Infinity, maxYear, endOfKnownEmissions.year);
  const endSeries = Math.min(stopAt || Infinity, maxYear);

  // Calculate the budget
  const remainingBudget = getRemainingBudget(endKnownSeries);

  // What's the final year of of known emissions we want to chart?
  const peak = getEmissionsForYear(endKnownSeries) || data[data.length - 1].emissions;

  const knownEmissions = data
    .filter(d => d.year >= startKnownSeries && d.year <= endKnownSeries)
    .map(d => ({ ...d, color: '#000' }));

  let futureEmissions: { year: number; emissions: number; color: string }[] = [];

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

export const usePrevious = <T extends unknown>(value: T) => {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
