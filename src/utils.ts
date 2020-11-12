import { useEffect, useRef } from 'react';
import { PanelData } from './common.d';
import { Mark, presets } from './constants';
import data from './data.tsv';

export const min = (data, accessor = d => d) =>
  data.reduce((min, d) => (accessor(d) < min ? accessor(d) : min), Infinity);

export const max = (data, accessor = d => d) =>
  data.reduce((max, d) => (accessor(d) > max ? accessor(d) : max), -Infinity);

export const generateSeries = (allowedEmissions: number, peak: number, reduce: boolean = true) => {
  const years = reduce ? (allowedEmissions * 2) / peak : allowedEmissions / peak;
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
  const mark: Mark = {
    ...{ blobs: [{ id: 'carbon', emissions: 0 }], useProgress: true },
    ...(panelData.preset && presets[panelData.preset] ? presets[panelData.preset] : {})
  };

  // Should vis be tied to scroll?
  mark.useProgress = panelData.useprogress || mark.useProgress;

  // Limits
  mark.limits = panelData.limits
    ? Array.isArray(panelData.limits)
      ? panelData.limits
      : [panelData.limits]
    : mark.limits;

  // Other custom labels
  mark.labels = Array.isArray(panelData.labels) ? panelData.labels : panelData.labels ? [panelData.labels] : [];

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
    // If we have a chart, don't use progress
    mark.useProgress = false;
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

// Hook

export const usePrevious = <T extends unknown>(value: T) => {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
