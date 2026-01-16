export type Traction = 'FWD' | 'RWD' | 'AWD';

export interface CarSpec {
  id: string;
  brand: string;
  model: string;
  year: number;
  hp: number;
  weight: number;
  consumption: number;
  price: number;
  traction: Traction;
  image: string;

  score?: number;
  ecoScore: number;
  sportScore: number;
  familyScore: number;
}

export interface Preferences {
  minPower: number;
  maxConsumption: number;
  maxWeight: number;
  maxPrice: number;
  preferredTraction: Traction | 'any';
}
