import type { CarSpec, Preferences } from "../types/car";

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
  citroen: ['C3', 'C4', 'C5 Aircross', 'Berlingo', 'SpaceTourer'],
  fiat: ['500', 'Panda', 'Tipo', '500X', '500L', 'Ducato'],
  alfa: ['Giulia', 'Stelvio', 'Giulietta', 'Tonale'],
  skoda: ['Fabia', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq'],
  dacia: ['Sandero', 'Duster', 'Logan', 'Spring', 'Jogger'],
  opel: ['Corsa', 'Astra', 'Insignia', 'Crossland', 'Grandland', 'Mokka'],
  bmw: ['Serie 1', 'Serie 3', 'Serie 5', 'Serie 7', 'X1', 'X3', 'X5', 'X7', 'Z4', 'M3', 'M5'],
  audi: ['A1', 'A3', 'A4', 'A6', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'TT', 'R8'],
  mercedes: ['Clase A', 'Clase C', 'Clase E', 'Clase S', 'GLA', 'GLC', 'GLE', 'GLS'],
  volkswagen: ['Polo', 'Golf', 'Passat', 'Tiguan', 'Touareg', 'T-Roc'],
  volvo: ['XC40', 'XC60', 'XC90', 'S60', 'S90', 'V60'],
  porsche: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan']
};

/* ============================
   Random estable (determinista)
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
  angles: ['01', '05', '09', '13', '17', '21', '25', '29', '33'] as const,

  getCarImage(make: string, model: string, year: number, angle = '01', color = 'grey'): string {
    const url = new URL('https://cdn.imagin.studio/getimage');
    url.searchParams.append('customer', 'hrjavascript-mastery');
    url.searchParams.append('make', make.toLowerCase());
    url.searchParams.append('modelFamily', model.split(' ')[0].toLowerCase());
    url.searchParams.append('zoomType', 'fullscreen');
    url.searchParams.append('modelYear', year.toString());
    url.searchParams.append('angle', angle);
    url.searchParams.append('paintId', color);
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

        if (!res.ok) throw new Error("NHTSA error");

        const data: NhtsaResponse = await res.json();
        models = [...new Set(data.Results.map(m => m.Model_Name))].slice(0, 15);
      } catch {
        return [];
      }
    }

    const allCars: CarSpec[] = [];

    models.forEach(modelName => {
      const seed = `${cleanMake}-${modelName}`;
      const rnd = seededRandom(seed);
      const year = 2023;

      const name = modelName.toUpperCase();

      const isSports = ['M', 'AMG', 'RS', '911', 'R8', 'CAYMAN', 'Z4'].some(k => name.includes(k));
      const isLuxury = ['SERIE 7', 'CLASE S', 'A8', 'PANAMERA', 'XC90'].some(k => name.includes(k));
      const isSUV = ['X', 'Q', 'GL', 'SUV', 'TIGUAN', 'KODIAQ', 'ATECA', 'DUSTER', 'XC'].some(k => name.includes(k));
      const isCompact = ['IBIZA', 'POLO', 'CLIO', '208', '500', 'A1', 'CORSA'].some(k => name.includes(k));

      let hp, consumption, price, weight, traction;

      if (isSports) {
        hp = 320 + rnd * 150;
        consumption = 9 + rnd * 3;
        price = 60000 + rnd * 25000;
        weight = 1600;
        traction = 'RWD';
      } else if (isLuxury) {
        hp = 250 + rnd * 100;
        consumption = 8 + rnd * 2;
        price = 65000 + rnd * 20000;
        weight = 1800;
        traction = 'AWD';
      } else if (isSUV) {
        hp = 160 + rnd * 90;
        consumption = 7 + rnd * 2.5;
        price = 30000 + rnd * 15000;
        weight = 1700;
        traction = rnd > 0.65 ? 'AWD' : 'FWD';
      } else if (isCompact) {
        hp = 95 + rnd * 45;
        consumption = 4.8 + rnd * 1.2;
        price = 16000 + rnd * 7000;
        weight = 1150;
        traction = 'FWD';
      } else {
        hp = 130 + rnd * 70;
        consumption = 6 + rnd * 1.5;
        price = 23000 + rnd * 12000;
        weight = 1400;
        traction = 'FWD';
      }

      allCars.push({
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
      });
    });

    return allCars;
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
  }
};
