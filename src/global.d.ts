declare module '*data.tsv' {
  const content: { year: number; emissions: number }[];
  export default content;
}

declare module 'svg-path-reverse' {
  export function reverse(path: string): string;
}

interface Window {
  __ODYSSEY__?: any;
  setStartYear: any;
}
