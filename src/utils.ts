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
