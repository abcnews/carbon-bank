import { ExtendMethod } from './components/YearlyEmissions';

export type EmissionsDatum = { emissions: number; year: number };
export type EmissionsData = EmissionsDatum[];
export type PanelData = {
  carbon?: number; // How big to display the main 'blob' in Gigatons of carbon dioxide
  sink?: number; // How big to display the carbons sink blob in Gigatons of carbon dioxide
  limits?: number[]; // Which limits to show: 0 = 0.5C, 1 = 1C, 2 = 1.5C
  labels?: string[]; // Custom labels to show
  useprogress?: boolean; // Should the viz be tied to scroll when transitioning to the next mark?
  xmin?: number; // Chart: the minimum value on the x axis
  xmax?: number; // Chart: the maximum value on the x axis
  labelyear?: number; // Chart: the years to label
  stopat?: number; // Chart: what year to stop the real-emissions series at
  extend?: ExtendMethod; // Chart: what method to use for extending into the future, either "reduce" or "steady"
};
