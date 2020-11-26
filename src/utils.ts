import { decode } from '@abcnews/base-36-props';
import { ScalePower } from 'd3-scale';
import { useEffect, useRef } from 'react';
import { PanelData } from './common.d';
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
  const years = timeLeft(allowedEmissions, peak, reduce);
  const slope = reduce ? peak / -years : 1;
  const series: number[] = [];
  for (let i = 1; i <= years; i++) {
    series.push(i * slope + peak);
  }
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

  // Method for auto-extending into future
  if (panelData.steady && mark.chart) {
    mark.chart.steady = panelData.steady;
  }

  return mark;
};

export const getUsedBudget = (year: number) =>
  data.reduce((t, d) => (d.year <= year ? t + d.emissions : t), 0) / 1000000000;
export const getRemainingBudget = (year: number) => (budget - getUsedBudget(year)) * 1000000000;
export const getEmissionsForYear = (year: number) =>
  data.find(d => d.year === year)?.emissions || data[data.length - 1].emissions;

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

// Hook

export const usePrevious = <T extends unknown>(value: T) => {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
