import type { CarSpec, Preferences } from "../types/car";

const NINJA_API_KEY = 'c65zZAz4PsZ8YT2W11vfKe1ZY56dmoN9wH6poLff'; 

interface NinjaCar {
  make: string;
  model: string;
  year: number;
  combination_mpg: number;
  displacement: number;
  drive: string;
  class: string;
  cylinders: number;
}

export const carService = {
  angles: ['01', '05', '09', '13', '17', '21', '25', '29', '33'] as const,

  getCarImage(make: string, model: string, year: number, angle = '01', color = 'grey'): string {
    const url = new URL('https://cdn.imagin.studio/getimage');
    url.searchParams.append('customer', 'hrjavascript-mastery');
    url.searchParams.append('make', make.toLowerCase());
    const modelFamily = model.split(' ').slice(0, 2).join(' ').toLowerCase();
    url.searchParams.append('modelFamily', modelFamily);
    url.searchParams.append('zoomType', 'fullscreen');
    url.searchParams.append('modelYear', year.toString());
    url.searchParams.append('angle', angle);
    url.searchParams.append('paintId', color);
    return url.toString();
  },

  async fetchCars(make: string): Promise<CarSpec[]> {
    const cleanMake = make.trim();
    
    // Eliminamos el filtro de año para traer TODO el catálogo
    const res = await fetch(
      `https://api.api-ninjas.com/v1/cars?make=${cleanMake}`,
      {
        method: 'GET',
        headers: {
          'X-Api-Key': NINJA_API_KEY,
          'Content-Type': 'application/json'
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error servidor:", errorText);
      throw new Error(`Error: ${res.status}`);
    }

    const data: NinjaCar[] = await res.json();

    // Ordenamos por año (más nuevos primero) para que la lista tenga sentido
    const sortedCars = data.sort((a, b) => b.year - a.year);

    return sortedCars.slice(0, 20).map((c, i) => {
      // Conversión MPG a L/100km
      const consumptionL = c.combination_mpg 
        ? (235.21 / c.combination_mpg) 
        : (c.displacement ? 5 + c.displacement * 1.5 : 8.0);
      
      const isLuxury = c.class?.toLowerCase().includes('luxury') || 
                       c.class?.toLowerCase().includes('sports');

      // Precio estimado dinámico (baja si el coche es antiguo)
      const isClassic = c.year < 2005;
      const basePrice = isLuxury ? 50000 : 20000;
      const engineBonus = (c.displacement || 2.0) * 5000;
      
      // Factor de depreciación: los coches viejos valen menos (a menos que sean muy clásicos)
      const ageFactor = Math.max(0.1, 1 - (2025 - c.year) * 0.05);
      const finalPrice = (basePrice + engineBonus) * (isClassic ? 0.3 : ageFactor);

      const tractionMap: Record<string, string> = {
        'fwd': 'FWD', 'rwd': 'RWD', 'awd': 'AWD', '4wd': 'AWD'
      };

      return {
        // Incluimos el año en el ID para que modelos iguales de años distintos no choquen
        id: `${c.make}-${c.model}-${c.year}-${i}`,
        brand: c.make.toUpperCase(),
        model: c.model.toUpperCase(),
        year: c.year,
        hp: Math.round((c.displacement || 1.6) * 90 + (c.cylinders || 4) * 8), 
        consumption: Number(consumptionL.toFixed(1)),
        weight: c.class?.toLowerCase().includes('suv') ? 1900 : 1400,
        price: Math.round(finalPrice),
        traction: tractionMap[c.drive?.toLowerCase()] || 'FWD',
        image: this.getCarImage(c.make, c.model, c.year)
      };
    });
  },

  calculateScore(car: CarSpec, prefs: Preferences): number {
    let score = 100;
    if (car.hp < prefs.minPower) score -= (prefs.minPower - car.hp) * 0.4;
    if (car.consumption > prefs.maxConsumption) score -= (car.consumption - prefs.maxConsumption) * 8;
    if (car.price > prefs.maxPrice) score -= ((car.price - prefs.maxPrice) / 1000) * 2;
    if (prefs.preferredTraction !== 'any' && car.traction === prefs.preferredTraction) score += 15;
    return Math.min(100, Math.max(0, Math.round(score)));
  }
};