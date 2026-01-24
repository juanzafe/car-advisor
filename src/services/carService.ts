import type { CarSpec, Preferences, Traction } from '../types/car';
import carsDb from '../data/carsdb.json';

const NINJA_API_KEY = import.meta.env.VITE_NINJA_API_KEY;

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

interface NHTSAResult {
  Make_Name: string;
  Model_Name: string;
}
interface NHTSAResponse {
  Results: NHTSAResult[];
}

const imageCache = new Map<string, string>();

export const carService = {
  angles: ['01', '05', '09', '13', '17', '21', '25', '29'],
  colorList: ['white', 'black', 'silver', 'blue', 'red'],

  // LISTA NEGRA DE MOTOS (Términos que indican que NO es un coche)
  motoBlacklist: [
    'R1250',
    'R1200',
    'F850',
    'F750',
    'S1000',
    'K1600',
    'G310',
    'CE 04', // BMW Motos
    'CBR',
    'CBF',
    'VFR',
    'CRF',
    'FORZA',
    'PCX',
    'SH125',
    'AFRICA TWIN', // Honda
    'GSX',
    'V-STROM',
    'HAYABUSA',
    'BURGMAN',
    'KATANA', // Suzuki
    'NINJA',
    'Z900',
    'Z650',
    'VERSYS',
    'VULCAN', // Kawasaki
    'MT-07',
    'MT-09',
    'TMAX',
    'XMAX',
    'TENERE',
    'YZF', // Yamaha
    'DUCATI',
    'TRIUMPH',
    'HARLEY',
    'VESPA', // Marcas puras
  ],

  isMoto(model: string): boolean {
    const m = model.toUpperCase();
    return this.motoBlacklist.some((term) => m.includes(term));
  },

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
    url.searchParams.append('width', isFull ? '1200' : '500');
    url.searchParams.append('zoomLevel', '0');
    const finalUrl = url.toString();
    imageCache.set(cacheKey, finalUrl);
    return finalUrl;
  },

  async fetchCars(query: string): Promise<CarSpec[]> {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    const uniqueMap = new Map<string, CarSpec>();

    // 1. Locales
    const local = (carsDb as CarSpec[]).filter(
      (c) =>
        c.brand.toLowerCase().includes(term) ||
        c.model.toLowerCase().includes(term)
    );
    local.forEach((c) =>
      uniqueMap.set(`${c.brand}-${c.model}`.toUpperCase(), {
        ...c,
        image: this.getCarImage(c.brand, c.model, c.year, '01', 'white', false),
      })
    );

    try {
      const [resByMake, resByModel, nhtsaRes] = await Promise.all([
        fetch(`https://api.api-ninjas.com/v1/cars?make=${term}&limit=30`, {
          headers: { 'X-Api-Key': NINJA_API_KEY || '' },
        }),
        fetch(`https://api.api-ninjas.com/v1/cars?model=${term}&limit=30`, {
          headers: { 'X-Api-Key': NINJA_API_KEY || '' },
        }),
        fetch(
          `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${term}/modelyear/2024?format=json`
        ),
      ]);

      const ninjaData: NinjaCarResponse[] = [];
      if (resByMake.ok) ninjaData.push(...(await resByMake.json()));
      if (resByModel.ok) ninjaData.push(...(await resByModel.json()));

      ninjaData.forEach((car, i) => {
        // FILTRO ANTI-MOTO APLICADO AQUÍ
        if (this.isMoto(car.model)) return;

        const spec = this.mapToCarSpec(car, i);
        const key = `${spec.brand}-${spec.model}`.toUpperCase();
        if (!uniqueMap.has(key)) uniqueMap.set(key, spec);
      });

      if (nhtsaRes.ok) {
        const nhtsaData: NHTSAResponse = await nhtsaRes.json();
        nhtsaData.Results.forEach((item, i) => {
          // FILTRO ANTI-MOTO APLICADO AQUÍ TAMBIÉN
          if (this.isMoto(item.Model_Name)) return;

          const key = `${item.Make_Name}-${item.Model_Name}`.toUpperCase();
          if (!uniqueMap.has(key)) {
            uniqueMap.set(
              key,
              this.generateSmartSpecs(item.Make_Name, item.Model_Name, i)
            );
          }
        });
      }

      return Array.from(uniqueMap.values());
    } catch (error) {
      console.error('Error fetching cars:', error);
      return Array.from(uniqueMap.values());
    }
  },

  mapToCarSpec(car: NinjaCarResponse, index: number): CarSpec {
    const baseHp = car.horsepower || 0;
    const consumption =
      car.combination_mpg > 0
        ? Number((235.21 / car.combination_mpg).toFixed(1))
        : 0;

    let hp = baseHp;
    let cons = consumption;

    if (baseHp === 0) {
      const smart = this.generateSmartSpecs(car.make, car.model, index);
      hp = smart.hp;
      cons = smart.consumption;
    }

    return {
      id: `ninja-${index}-${car.model}`,
      brand: car.make.toUpperCase(),
      model: car.model.toUpperCase(),
      year: car.year,
      hp,
      consumption: cons || 6.5,
      weight: Math.round(1100 + hp * 1.5),
      price: 0,
      traction: (car.drive?.toLowerCase().includes('all') ||
      car.drive?.includes('4')
        ? 'AWD'
        : 'FWD') as Traction,
      acceleration: Number((12 - hp / 45).toFixed(1)),
      topSpeed: Math.round(150 + hp / 2),
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
      ecoScore: car.fuel_type === 'electricity' ? 95 : 65,
      sportScore: Math.min(99, Math.round(hp / 4.5)),
      familyScore: 70,
    };
  },

  generateSmartSpecs(make: string, model: string, index: number): CarSpec {
    const fullSearch = `${make} ${model}`.toLowerCase();
    let hp = 110;
    let cons = 5.4;
    let acc = 10.5;
    let weight = 1300;
    let fuel = 'Híbrido';

    const isSuperSport =
      /(ferrari|lamborghini|porsche|mclaren|bugatti|911|huracan|aventador)/.test(
        fullSearch
      );
    const isSport =
      /( m2| m3| m4| m5| rs| amg| gti| cupra| type r| mustang| camaro| corvette| supra)/.test(
        fullSearch
      );
    const isBigSUV =
      /( q7| q8| x5| x6| x7| cayenne| range rover| land cruiser| touareg| tucson| sportage)/.test(
        fullSearch
      );
    const isSmall =
      /( 500| aygo| i10| yaris| polo| corsa| micra| sandero| clio| c3| picanto)/.test(
        fullSearch
      );

    if (isSuperSport) {
      hp = 600;
      cons = 14.5;
      acc = 3.2;
      weight = 1650;
      fuel = 'Gasolina';
    } else if (isSport) {
      hp = 420;
      cons = 10.2;
      acc = 4.3;
      weight = 1550;
      fuel = 'Gasolina';
    } else if (isBigSUV) {
      hp = 190;
      cons = 7.5;
      acc = 8.5;
      weight = 1900;
    } else if (isSmall) {
      hp = 85;
      cons = 4.5;
      acc = 12.8;
      weight = 1050;
    }

    const variation = (index % 10) * 5;
    hp += variation;

    return {
      id: `smart-${index}-${model}`,
      brand: make.toUpperCase(),
      model: model.toUpperCase(),
      year: 2024,
      hp,
      consumption: cons,
      acceleration: acc,
      weight,
      price: 0,
      topSpeed: Math.round(hp * 0.7 + 115),
      fuelType: fuel,
      transmission: hp > 170 ? 'Auto' : 'Manual',
      traction: (hp > 280 || weight > 1800 ? 'AWD' : 'FWD') as Traction,
      image: this.getCarImage(make, model, 2024, '01', 'white', false),
      ecoScore: hp < 120 ? 85 : 50,
      sportScore: Math.round(hp / 5),
      familyScore: weight > 1600 ? 85 : 45,
    };
  },

  calculateScore(car: CarSpec, prefs: Preferences): number {
    let score = 100;
    if (car.hp < prefs.minPower) score -= (prefs.minPower - car.hp) * 0.5;
    if (car.consumption > prefs.maxConsumption)
      score -= (car.consumption - prefs.maxConsumption) * 10;
    return Math.max(0, Math.min(100, Math.round(score)));
  },

  preloadColors(make: string, model: string, year: number): void {
    this.colorList.forEach((color) => {
      const img = new Image();
      img.src = this.getCarImage(make, model, year, '01', color, false);
    });
  },

  preloadFullCar(make: string, model: string, year: number): void {
    this.preloadColors(make, model, year);
    this.angles.forEach((angle) => {
      const img = new Image();
      img.src = this.getCarImage(make, model, year, angle, 'white', true);
    });
  },
};
