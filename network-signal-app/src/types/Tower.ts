export interface Tower {
  id: number;
  PSC: number;
  Radio_Type: string;
  MCC: number;
  MNC: number;
  LAC: number;
  Longitude: number;
  Latitude: number;
  Range: number;
  Landmark?: string;
  Traffic?: string;
}
