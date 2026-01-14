import type { CarSpec, Preferences } from "../types/car";
import type { NhtsaResponse } from "../types/nhtsa";


export const carService = {
  angles: ['01', '05', '09', '13', '17', '21', '25', '29', '33'] as const,

  colors: [
    { name: 'Blanco', hex: 'ffffff', code: 'white' },
    { name: 'Negro', hex: '000000', code: 'black' },
    { name: 'Gris', hex: '808080', code: 'grey' },
    { name: 'Rojo', hex: 'ff0000', code: 'red' },
    { name: 'Azul', hex: '0000ff', code: 'blue' }
  ] as const,

  getCarImage(
    make: string,
    model: string,
    year: number,
    angle: string = '01',
    color: string = 'grey'
  ): string {
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
  const res = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${make}?format=json`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch cars");
  }

  const data: NhtsaResponse = await res.json();

  const tractions = ['FWD', 'RWD', 'AWD'] as const;

  return data.Results.slice(0, 12).map((c, i) => {
    const hp = 150 + Math.random() * 250;
    const year = 2024 - Math.floor(Math.random() * 3);

    return {
      id: `${c.Model_ID}-${i}`,
      brand: c.Make_Name,
      model: c.Model_Name,
      year,
      hp: Math.round(hp),
      weight: Math.round(1300 + Math.random() * 500),
      consumption: Math.round((5 + Math.random() * 5) * 10) / 10,
      price: Math.round(20000 + hp * 120),
      traction: tractions[Math.floor(Math.random() * tractions.length)],
      image: this.getCarImage(c.Make_Name, c.Model_Name, year)
    };
  });
},


  calculateScore(car: CarSpec, prefs: Preferences): number {
    let score = 100;

    if (car.hp < prefs.minPower) score -= (prefs.minPower - car.hp) / 10;
    if (car.consumption > prefs.maxConsumption) score -= (car.consumption - prefs.maxConsumption) * 5;
    if (car.weight > prefs.maxWeight) score -= (car.weight - prefs.maxWeight) / 50;
    if (car.price > prefs.maxPrice) score -= (car.price - prefs.maxPrice) / 1000;

    if (
      prefs.preferredTraction !== 'any' &&
      car.traction === prefs.preferredTraction
    ) {
      score += 10;
    }

    return Math.max(0, Math.round(score));
  }
};
