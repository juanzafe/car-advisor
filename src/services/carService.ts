import type { CarSpec, Preferences } from '../types/car';

const NINJA_API_KEY = import.meta.env.VITE_NINJA_API_KEY;

interface NinjaCar {
  make: string;
  model: string;
  year: number;
  horsepower: number;
  combination_mpg: number;
  drive: string;
  fuel_type: string;
  transmission: string;
}

const LOCAL_DATA: Record<string, { hp: number; cons: number; weight: number }> =
  {
    A1: { hp: 110, cons: 5.4, weight: 1180 },
    A3: { hp: 150, cons: 5.8, weight: 1395 },
    A4: { hp: 204, cons: 6.4, weight: 1560 },
    A6: { hp: 265, cons: 7.2, weight: 1780 },
    Q3: { hp: 150, cons: 6.7, weight: 1580 },
    Q5: { hp: 204, cons: 7.5, weight: 1840 },
    TT: { hp: 245, cons: 7.0, weight: 1350 },
    'SERIE 1': { hp: 136, cons: 5.7, weight: 1395 },
    'SERIE 3': { hp: 184, cons: 6.1, weight: 1575 },
    GOLF: { hp: 130, cons: 5.2, weight: 1340 },
    LEON: { hp: 150, cons: 5.6, weight: 1360 },
  };

const EUROPEAN_MODELS: Record<string, string[]> = {
  audi: ['A1', 'A3', 'A4', 'A6', 'Q3', 'Q5', 'TT'],
  bmw: ['Serie 1', 'Serie 3', 'Serie 5', 'X1', 'X3', 'X5'],
  volkswagen: ['Polo', 'Golf', 'Passat', 'Tiguan'],
  seat: ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Formentor'],
  mercedes: ['Clase A', 'Clase C', 'Clase E', 'GLA', 'GLC'],
};

export const carService = {
  angles: ['01', '05', '09', '13', '17', '21', '25', '29'],
  colorList: ['white', 'black', 'silver', 'blue', 'red'],

  getCarImage(
    make: string,
    model: string,
    year: number,
    angle: string = '01',
    color: string = 'white'
  ): string {
    const normalizedModel = model
      .toLowerCase()
      .replace(/serie\s?/i, '')
      .replace(/clase\s?/i, '')
      .replace(/\s+/g, '');
    const url = new URL('https://cdn.imagin.studio/getimage');
    url.searchParams.append(
      'customer',
      import.meta.env.VITE_IMAGIN_CUSTOMER_ID || 'hrjavascript-mastery'
    );
    url.searchParams.append('make', make.toLowerCase());
    url.searchParams.append('modelFamily', normalizedModel);
    url.searchParams.append('zoomType', 'fullscreen');
    url.searchParams.append('modelYear', year.toString());
    url.searchParams.append('angle', angle);
    url.searchParams.append('paintDescription', color);
    return url.toString();
  },

  async fetchCars(make: string): Promise<CarSpec[]> {
    const cleanMake = make.trim().toLowerCase();

    try {
      const response = await fetch(
        `https://api.api-ninjas.com/v1/cars?make=${encodeURIComponent(cleanMake)}&limit=10`,
        { headers: { 'X-Api-Key': NINJA_API_KEY || '' } }
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((car: NinjaCar, index: number) =>
            this.mapToCarSpec(car, index)
          );
        }
      }
    } catch {
      console.warn('Error API, usando base de datos local');
    }

    const models = EUROPEAN_MODELS[cleanMake] || [];
    return models.map((m, i) => {
      const spec = LOCAL_DATA[m.toUpperCase()] || {
        hp: 115,
        cons: 6.0,
        weight: 1400,
      };
      return this.mapToCarSpec(
        {
          make: cleanMake,
          model: m,
          year: 2024,
          horsepower: spec.hp,
          combination_mpg: Number((235.21 / spec.cons).toFixed(1)),
          drive: 'fwd',
          fuel_type: 'gas',
          transmission: 'm',
        } as NinjaCar,
        i
      );
    });
  },

  mapToCarSpec(car: NinjaCar, index: number): CarSpec {
    const hp = car.horsepower || 115;
    const consumption = car.combination_mpg
      ? Number((235.21 / car.combination_mpg).toFixed(1))
      : 6.0;

    return {
      id: `${car.make}-${car.model}-${index}`,
      brand: car.make.toUpperCase(),
      model: car.model.toUpperCase(),
      year: car.year,
      hp: hp,
      consumption: consumption,
      weight: 1200 + hp * 1.3,
      price: 0,
      traction: car.drive?.toLowerCase().includes('awd') ? 'AWD' : 'FWD',
      acceleration: Number((12 - hp / 40).toFixed(1)),
      topSpeed: 165 + Math.round(hp / 3),
      fuelType: car.fuel_type === 'gas' ? 'Gasolina' : 'Diésel',
      transmission: car.transmission === 'a' ? 'Auto' : 'Manual',
      image: this.getCarImage(car.make, car.model, car.year),
      ecoScore: Math.round(Math.max(0, 100 - consumption * 9)),
      sportScore: Math.round(Math.min(100, hp / 3.5)),
      familyScore: 75,
    };
  },

  calculateScore(car: CarSpec, prefs: Preferences): number {
    let score = 100;
    if (car.hp < prefs.minPower) score -= (prefs.minPower - car.hp) * 0.5;
    if (car.consumption > prefs.maxConsumption)
      score -= (car.consumption - prefs.maxConsumption) * 10;
    return Math.max(0, Math.min(100, Math.round(score)));
  },
};
