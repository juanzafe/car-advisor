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
  motoBlacklist: [
    'R1250',
    'R1200',
    'F850',
    'F750',
    'S1000',
    'K1600',
    'G310',
    'CE 04',
    'CBR',
    'CBF',
    'VFR',
    'CRF',
    'FORZA',
    'PCX',
    'SH125',
    'AFRICA TWIN',
    'GSX',
    'V-STROM',
    'HAYABUSA',
    'BURGMAN',
    'KATANA',
    'NINJA',
    'Z900',
    'Z650',
    'VERSYS',
    'VULCAN',
    'MT-07',
    'MT-09',
    'TMAX',
    'XMAX',
    'TENERE',
    'YZF',
    'DUCATI',
    'TRIUMPH',
    'HARLEY',
    'VESPA',
  ],

  isMoto(model: string): boolean {
    const m = model.toUpperCase();
    return this.motoBlacklist.some((term) => m.includes(term));
  },

  calculateSmartData(
    hp: number,
    fuelType: string,
    weight: number,
    make: string
  ) {
    let topSpeed: number;
    if (hp <= 110) topSpeed = 155 + hp * 0.25;
    else if (hp <= 210) topSpeed = 175 + hp * 0.18;
    else if (hp <= 450) topSpeed = 210 + hp * 0.12;
    else topSpeed = 260 + hp * 0.06;
    if (fuelType.toLowerCase().includes('eléctrico') && hp < 500) {
      topSpeed = Math.min(topSpeed, 210);
    }

    const ratio = weight / hp;
    const acceleration = Number(Math.max(2.2, ratio * 0.85).toFixed(1));
    const brand = make.toLowerCase();
    let basePrice = 18000;

    const isLuxury =
      /(ferrari|lamborghini|porsche|mclaren|bugatti|bentley|rolls)/.test(brand);
    const isPremium = /(bmw|mercedes|audi|lexus|volvo|tesla|land rover)/.test(
      brand
    );

    if (isLuxury) basePrice = 120000 + hp * 150;
    else if (isPremium) basePrice = 35000 + hp * 90;
    else basePrice = 15000 + hp * 65;

    const finalPrice = fuelType.toLowerCase().includes('eléctrico')
      ? basePrice * 1.25
      : basePrice;

    return {
      topSpeed: Math.round(topSpeed),
      acceleration,
      estimatedPrice: Math.round(finalPrice / 100) * 100,
    };
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
        if (this.isMoto(car.model)) return;
        const spec = this.mapToCarSpec(car, i);
        const key = `${spec.brand}-${spec.model}`.toUpperCase();
        if (!uniqueMap.has(key)) uniqueMap.set(key, spec);
      });

      if (nhtsaRes.ok) {
        const nhtsaData: NHTSAResponse = await nhtsaRes.json();
        nhtsaData.Results.forEach((item, i) => {
          if (this.isMoto(item.Model_Name)) return;
          const key = `${item.Make_Name}-${item.Model_Name}`.toUpperCase();
          if (!uniqueMap.has(key))
            uniqueMap.set(
              key,
              this.generateSmartSpecs(item.Make_Name, item.Model_Name, i)
            );
        });
      }
      return Array.from(uniqueMap.values());
    } catch {
      return Array.from(uniqueMap.values());
    }
  },

  mapToCarSpec(car: NinjaCarResponse, index: number): CarSpec {
    const hp = car.horsepower || (car.fuel_type === 'electricity' ? 200 : 120);
    const consumption =
      car.combination_mpg > 0
        ? Number((235.21 / car.combination_mpg).toFixed(1))
        : 0;
    const fuelType = car.fuel_type === 'electricity' ? 'Eléctrico' : 'Gasolina';
    const weight = Math.round(1100 + hp * 1.5);

    const smartData = this.calculateSmartData(hp, fuelType, weight, car.make);

    return {
      id: `ninja-${index}-${car.model}`,
      brand: car.make.toUpperCase(),
      model: car.model.toUpperCase(),
      year: car.year,
      hp,
      consumption: consumption || 6.5,
      weight,
      price: smartData.estimatedPrice,
      traction: (car.drive?.toLowerCase().includes('all') ||
      car.drive?.includes('4')
        ? 'AWD'
        : 'FWD') as Traction,
      acceleration: smartData.acceleration,
      topSpeed: smartData.topSpeed,
      fuelType,
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
    const fuel = 'Gasolina'; // Corregido: 'fuel' ahora es const
    let hp = 110,
      cons = 5.4,
      weight = 1300;

    if (/(ferrari|lamborghini|porsche|911|huracan)/.test(fullSearch)) {
      hp = 600;
      cons = 14.5;
      weight = 1650;
    } else if (/( m2| m3| m4| rs| amg| gti| cupra)/.test(fullSearch)) {
      hp = 420;
      cons = 10.2;
      weight = 1550;
    } else if (
      /( q7| x5| cayenne| range rover| tucson| sportage)/.test(fullSearch)
    ) {
      hp = 190;
      cons = 7.5;
      weight = 1900;
    } else if (/( 500| aygo| yaris| polo| clio| sandero)/.test(fullSearch)) {
      hp = 85;
      cons = 4.5;
      weight = 1050;
    }

    hp += (index % 10) * 5;
    const smartData = this.calculateSmartData(hp, fuel, weight, make);

    return {
      id: `smart-${index}-${model}`,
      brand: make.toUpperCase(),
      model: model.toUpperCase(),
      year: 2024,
      hp,
      consumption: cons,
      acceleration: smartData.acceleration,
      weight,
      price: smartData.estimatedPrice,
      topSpeed: smartData.topSpeed,
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
