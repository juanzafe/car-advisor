import type { CarSpec, Preferences, Traction } from "../types/car";

interface NhtsaResponse {
  Results: Array<{
    Make_Name: string;
    Model_Name: string;
    Model_ID: number;
  }>;
}

/* ============================
   Base de datos europea local
============================ */
const EUROPEAN_MODELS: Record<string, string[]> = {
  seat: ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco', 'Formentor'],
  renault: ['Clio', 'Megane', 'Captur', 'Kadjar', 'Scenic', 'Talisman'],
  peugeot: ['208', '308', '2008', '3008', '5008', '508'],
  citroen: ['C3', 'C4', 'C5 Aircross', 'Berlingo'],
  fiat: ['500', 'Panda', 'Tipo', '500X'],
  skoda: ['Fabia', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq'],
  dacia: ['Sandero', 'Duster', 'Jogger'],
  bmw: ['Serie 1', 'Serie 3', 'Serie 5', 'X1', 'X3', 'X5', 'M3'],
  audi: ['A1', 'A3', 'A4', 'A6', 'Q3', 'Q5', 'TT'],
  mercedes: ['Clase A', 'Clase C', 'Clase E', 'GLA', 'GLC'],
  volkswagen: ['Polo', 'Golf', 'Passat', 'Tiguan'],
  volvo: ['XC40', 'XC60', 'S60'],
  porsche: ['911', 'Cayenne', 'Macan']
};

/* ============================
   Random determinista
============================ */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 1000) / 1000;
}

export const carService = {
  getCarImage(make: string, model: string, year: number): string {
    const url = new URL('https://cdn.imagin.studio/getimage');
    url.searchParams.append('customer', 'hrjavascript-mastery');
    url.searchParams.append('make', make.toLowerCase());
    url.searchParams.append('modelFamily', model.split(' ')[0].toLowerCase());
    url.searchParams.append('zoomType', 'fullscreen');
    url.searchParams.append('modelYear', year.toString());
    url.searchParams.append('angle', '01');
    url.searchParams.append('paintId', 'grey');
    return url.toString();
  },

  async fetchCars(make: string): Promise<CarSpec[]> {
    const cleanMake = make.trim().toLowerCase();
    let models: string[] = [];

    if (EUROPEAN_MODELS[cleanMake]) {
      models = EUROPEAN_MODELS[cleanMake];
    } else {
      try {
        const res = await fetch(
          `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${cleanMake}?format=json`
        );
        const data: NhtsaResponse = await res.json();
        models = [...new Set(data.Results.map(m => m.Model_Name))].slice(0, 12);
      } catch {
        return [];
      }
    }

    return models.map(modelName => {
      const seed = `${cleanMake}-${modelName}`;
      const rnd = seededRandom(seed);
      const name = modelName.toUpperCase();
      const year = 2023;

      const isSport = ['M', 'AMG', 'RS', '911', 'TT'].some(k => name.includes(k));
      const isSUV = ['X', 'Q', 'GL', 'TIGUAN', 'XC'].some(k => name.includes(k));
      const isCompact = ['IBIZA', 'POLO', 'CLIO', '208', 'A1'].some(k => name.includes(k));

      let hp = 120, consumption = 6, price = 25000, weight = 1400;
      let traction: Traction = 'FWD';

      if (isSport) {
        hp = 300 + rnd * 120;
        consumption = 9 + rnd * 2;
        price = 55000 + rnd * 20000;
        weight = 1550;
        traction = 'RWD';
      } else if (isSUV) {
        hp = 170 + rnd * 80;
        consumption = 7 + rnd * 2;
        price = 32000 + rnd * 12000;
        weight = 1700;
        traction = rnd > 0.6 ? 'AWD' : 'FWD';
      } else if (isCompact) {
        hp = 95 + rnd * 45;
        consumption = 5 + rnd * 1;
        price = 16000 + rnd * 6000;
        weight = 1150;
      }

      const baseCar = {
        id: `${cleanMake}-${modelName.replace(/\s+/g, '-')}`,
        brand: cleanMake.toUpperCase(),
        model: name,
        year,
        hp: Math.round(hp),
        consumption: Number(consumption.toFixed(1)),
        weight,
        price: Math.round(price),
        traction,
        image: this.getCarImage(cleanMake, modelName, year)
      };

      return {
        ...baseCar,
        ecoScore: this.calculateEcoScore(baseCar),
        sportScore: this.calculateSportScore(baseCar),
        familyScore: this.calculateFamilyScore(baseCar)
      };
    });
  },

  calculateScore(car: CarSpec, prefs: Preferences): number {
    let score = 100;

    if (car.hp < prefs.minPower)
      score -= (prefs.minPower - car.hp) * 0.4;

    if (car.consumption > prefs.maxConsumption)
      score -= (car.consumption - prefs.maxConsumption) * 8;

    if (car.price > prefs.maxPrice)
      score -= ((car.price - prefs.maxPrice) / 1000) * 2;

    if (prefs.preferredTraction !== 'any' && car.traction === prefs.preferredTraction)
      score += 15;

    return Math.max(0, Math.min(100, Math.round(score)));
  },

  calculateEcoScore(car: Omit<CarSpec, 'ecoScore' | 'sportScore' | 'familyScore'>): number {
    return Math.max(0, 100 - car.consumption * 10 - car.weight / 60);
  },

  calculateSportScore(car: Omit<CarSpec, 'ecoScore' | 'sportScore' | 'familyScore'>): number {
    return Math.min(100, car.hp / 3 + (car.traction !== 'FWD' ? 20 : 0));
  },

  calculateFamilyScore(car: Omit<CarSpec, 'ecoScore' | 'sportScore' | 'familyScore'>): number {
    return Math.min(100, (car.weight > 1500 ? 30 : 15) + (car.price < 35000 ? 30 : 15));
  }
};
