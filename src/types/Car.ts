export interface CarSpec {
  id: string;
  brand: string;
  model: string;
  year: number;
  hp: number;
  weight: number;
  consumption: number;
  price: number;
  image?: string;
  traction?: 'FWD' | 'RWD' | 'AWD';
}