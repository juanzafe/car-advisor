import type { CarSpec, Preferences, Traction } from '../types/car';

const NINJA_API_KEY = import.meta.env.VITE_NINJA_API_KEY;

// --- Interfaces de Tipado ---
interface NHTSAResult {
  Make_Name: string;
  Model_Name: string;
}
interface NHTSADATA {
  Results: NHTSAResult[];
}
interface NinjaCarResponse {
  make: string;
  model: string;
  year: number;
  horsepower: number;
  combination_mpg: number;
  drive: string;
  fuel_type: string;
  transmission: string;
}

// Caché interna para evitar recálculos de URL
const imageCache = new Map<string, string>();

export const carService = {
  angles: ['01', '05', '09', '13', '17', '21', '25', '29'],
  colorList: ['white', 'black', 'silver', 'blue', 'red'],

  getCarImage(
    make: string,
    model: string,
    year: number,
    angle: string = '01',
    color: string = 'white',
    isFull: boolean = true
  ): string {
    const cacheKey = `${make}-${model}-${year}-${angle}-${color}-${isFull}`;
    if (imageCache.has(cacheKey)) return imageCache.get(cacheKey)!;

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
    url.searchParams.append('width', isFull ? '1200' : '500'); // Un poco más de margen para calidad

    const finalUrl = url.toString();
    imageCache.set(cacheKey, finalUrl);
    return finalUrl;
  },

  // PRECARGA ULTRA-RÁPIDA PARA COLORES (Miniaturas)
  preloadColors(make: string, model: string, year: number): void {
    this.colorList.forEach((color) => {
      const img = new Image();
      // Cargamos la versión pequeña (isFull: false) que es la que se usa en la lista
      img.src = this.getCarImage(make, model, year, '01', color, false);
    });
  },

  preloadFullCar(make: string, model: string, year: number): void {
    // Primero los colores de la lista para que el cambio sea inmediato
    this.preloadColors(make, model, year);

    // Luego los ángulos del modal
    this.angles.forEach((angle) => {
      const img = new Image();
      img.src = this.getCarImage(make, model, year, angle, 'white', true);
    });
  },

  async fetchCars(make: string): Promise<CarSpec[]> {
    const cleanMake = make.trim().toLowerCase();
    if (!cleanMake) return [];

    try {
      const [ninjaRes, nhtsaRes] = await Promise.all([
        fetch(`https://api.api-ninjas.com/v1/cars?make=${cleanMake}&limit=30`, {
          headers: { 'X-Api-Key': NINJA_API_KEY || '' },
        }),
        fetch(
          `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${cleanMake}/modelyear/2023?format=json`
        ),
      ]);

      let ninjaData: NinjaCarResponse[] = [];
      if (ninjaRes.ok) ninjaData = await ninjaRes.json();
      const nhtsaData: NHTSADATA = await nhtsaRes.json();
      const nhtsaModels = nhtsaData.Results || [];

      const uniqueMap = new Map<string, CarSpec>();

      ninjaData.forEach((car, i) => {
        const spec = this.mapToCarSpec(car, i);
        uniqueMap.set(`${spec.brand}-${spec.model}`.toUpperCase(), spec);
      });

      nhtsaModels.forEach((item, i) => {
        const key = `${item.Make_Name.toUpperCase()}-${item.Model_Name.toUpperCase()}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(
            key,
            this.createRealisticCar(item.Make_Name, item.Model_Name, 2023, i)
          );
        }
      });

      const final = Array.from(uniqueMap.values());
      // Precarga agresiva de colores para los primeros 6 coches de la lista
      final
        .slice(0, 6)
        .forEach((c) => this.preloadColors(c.brand, c.model, c.year));

      return final;
    } catch {
      return [];
    }
  },

  // ... (createRealisticCar y mapToCarSpec se mantienen igual que la versión anterior)
  createRealisticCar(
    make: string,
    model: string,
    year: number,
    index: number
  ): CarSpec {
    return {
      id: `fallback-${index}-${model}`,
      brand: make.toUpperCase(),
      model: model.toUpperCase(),
      year: year,
      hp: 120,
      consumption: 5.8,
      weight: 1400,
      price: 0,
      traction: 'FWD' as Traction,
      acceleration: 9.8,
      topSpeed: 205,
      fuelType: 'Gasolina',
      transmission: 'Manual',
      image: this.getCarImage(make, model, year, '01', 'white', false),
      ecoScore: 70,
      sportScore: 40,
      familyScore: 60,
    };
  },

  mapToCarSpec(car: NinjaCarResponse, index: number): CarSpec {
    const hp = car.horsepower || 115;
    const consumption =
      car.combination_mpg > 0
        ? Number((235.21 / car.combination_mpg).toFixed(1))
        : 6.0;
    return {
      id: `ninja-${index}-${car.model}`,
      brand: car.make.toUpperCase(),
      model: car.model.toUpperCase(),
      year: car.year,
      hp,
      consumption,
      weight: 1200 + hp * 1.2,
      price: 0,
      traction: 'FWD' as Traction,
      acceleration: Number((11 - hp / 50).toFixed(1)),
      topSpeed: 160 + hp / 2.5,
      fuelType: car.fuel_type === 'electricity' ? 'Eléctrico' : 'Gasolina',
      transmission: car.transmission === 'a' ? 'Auto' : 'Manual',
      image: this.getCarImage(
        car.make,
        car.model,
        car.year,
        '01',
        'white',
        false
      ),
      ecoScore: 70,
      sportScore: 50,
      familyScore: 70,
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
