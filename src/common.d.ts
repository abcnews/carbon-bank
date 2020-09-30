export type EmissionsDatum = { emissions: number; year: number };
export type EmissionsData = EmissionsDatum[];
export type PanelData = {
  id: number;
  index: number;
  next?: PanelData;
};
