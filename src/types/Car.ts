export type Traction = 'FWD' | 'RWD' | 'AWD'; 

export interface CarSpec {
  traction: string;
  id: string;
  brand: string;
  model: string;
  year: number;
  hp: number;
  weight: number;
  consumption: number;
  price: number;
  image: string;
  score?: number;
}

export interface Preferences {
  minPower: number;
  maxConsumption: number;
  maxWeight: number;
  maxPrice: number;
  preferredTraction: string;
}
