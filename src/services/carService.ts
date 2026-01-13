import type { CarSpec } from "../types/Car";


// Interfaz interna para entender lo que viene de la API de Ninjas
interface ApiNinjaCar {
  make: string;
  model: string;
  year: number;
  combination_mpg: number;
  displacement: number;
  drive: string;
}

const API_KEY = import.meta.env.VITE_CARS_API_KEY;
const BASE_URL = 'https://api.api-ninjas.com/v1/cars';

export const fetchCars = async (model: string): Promise<CarSpec[]> => {
  // 1. Llamada a la API
  const response = await fetch(`${BASE_URL}?model=${model}`, {
    headers: { 'X-Api-Key': API_KEY }
  });

  if (!response.ok) throw new Error('Error al buscar coches o API Key inválida');

  const data: ApiNinjaCar[] = await response.json();

  // 2. Mapeo y transformación a tu formato CarSpec
  return data.map((car: ApiNinjaCar, index: number): CarSpec => {
    
    // Convertimos la tracción de la API al formato de tu interfaz
    let traccion: 'FWD' | 'RWD' | 'AWD' = 'FWD';
    if (car.drive === 'rwd') traccion = 'RWD';
    if (car.drive === 'awd' || car.drive === '4wd') traccion = 'AWD';

    return {
      id: `${car.model}-${index}-${car.year}`, 
      brand: car.make,
      model: car.model,
      year: car.year,
      // Estimación de caballos (HP) basada en cilindrada, ya que la API no los da
      hp: car.displacement ? Math.floor(car.displacement * 70) : 150, 
      consumption: car.combination_mpg, 
      weight: 1400 + (index * 20), // Dato simulado por ahora
      price: 22000 + (index * 1000), // Dato simulado por ahora
      image: `https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800`,
      traction: traccion
    };
  });
};