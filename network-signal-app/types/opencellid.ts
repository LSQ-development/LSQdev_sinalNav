export interface OpenCelliDCell {
  cell: string;
  mcc: number;
  mnc: number;
  lac: number;
  cid: number;
  lat: string;
  lon: string;
  range?: number;
  radio: "GSM" | "UMTS" | "LTE" | "NR" | string;
  samples?: number;
  changeable?: boolean;
  created?: string;
  updated?: string;
}

export interface OpenCelliDResponse {
  cells?: OpenCelliDCell[];
}

export interface CellTower {
  id: string;
  mcc: number;
  mnc: number;
  lac: number;
  cid: number;
  lat: number;
  lon: number;
  range?: number;
  radio: string;
  samples?: number;
  changeable?: boolean;
  created?: string;
  updated?: string;
  distance: number;
}

export interface CellTowerApiResponse {
  success: boolean;
  count: number;
  towers: CellTower[];
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface Location {
  lat: string;
  lng: string;
}

export interface LocationInput {
  lat:string;
  lng:string;
}

export interface CellTowersPageProps{
  initialLocation?:Location
}

export interface ApiQuery {
  lat?: string;
  lon?: string;
  radius?: string;
  limit?: string;
}
