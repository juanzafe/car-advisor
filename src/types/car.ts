export type Traction = 'FWD' | 'RWD' | 'AWD';

export interface CarSpec {
  id: string;
  brand: string;
  model: string;
  year: number;
  hp: number;
  consumption: number;
  weight: number;
  price: number;
  traction: Traction;
  acceleration: number;
  topSpeed: number;
  image: string;
  fuelType: string;
  transmission: string;
  score?: number;
  ecoScore: number;
  sportScore: number;
  familyScore: number;
  selectedColor?: string;
}

export interface Preferences {
  minPower: number;
  maxConsumption: number;
  maxWeight: number;
  maxPrice: number;
  preferredTraction: Traction | 'any';
}
