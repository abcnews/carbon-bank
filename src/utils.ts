export const min = (data, accessor = d => d) =>
  data.reduce((min, d) => (accessor(d) < min ? accessor(d) : min), Infinity);

export const max = (data, accessor = d => d) =>
  data.reduce((max, d) => (accessor(d) > max ? accessor(d) : max), -Infinity);
