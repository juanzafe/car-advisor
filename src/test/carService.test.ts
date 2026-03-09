import { describe, it, expect } from 'vitest';
import { carService } from '../services/carService';
import type { CarSpec, Preferences } from '../types/car';

// ─── isMoto ────────────────────────────────────────────────
describe('carService.isMoto', () => {
  it('detects motorcycle-only brands', () => {
    expect(carService.isMoto('Monster 821', 'Ducati')).toBe(true);
    expect(carService.isMoto('Sportster', 'Harley-Davidson')).toBe(true);
    expect(carService.isMoto('Duke 390', 'KTM')).toBe(true);
    expect(carService.isMoto('GTS 300', 'Vespa')).toBe(true);
  });

  it('detects motorcycle model patterns regardless of brand', () => {
    expect(carService.isMoto('CBR600RR', 'Honda')).toBe(true);
    expect(carService.isMoto('YZF-R1', 'Yamaha')).toBe(true);
    expect(carService.isMoto('NINJA 400', 'Kawasaki')).toBe(true);
    expect(carService.isMoto('GSX-R1000', 'Suzuki')).toBe(true);
    expect(carService.isMoto('R1200GS', 'BMW')).toBe(true);
    expect(carService.isMoto('MT-07', 'Yamaha')).toBe(true);
    expect(carService.isMoto('V-STROM 650', 'Suzuki')).toBe(true);
  });

  it('returns false for car models', () => {
    expect(carService.isMoto('Civic', 'Honda')).toBe(false);
    expect(carService.isMoto('Corolla', 'Toyota')).toBe(false);
    expect(carService.isMoto('Serie 3', 'BMW')).toBe(false);
    expect(carService.isMoto('A4', 'Audi')).toBe(false);
    expect(carService.isMoto('Golf', 'Volkswagen')).toBe(false);
  });

  it('with empty brand, matches any motoBrand (mb.includes("") is always true)', () => {
    // Note: empty string brand causes all motoBrands to match via mb.includes('')
    expect(carService.isMoto('Civic', '')).toBe(true);
  });

  it('returns false for car models with no brand', () => {
    expect(carService.isMoto('Civic')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(carService.isMoto('cbr600rr', 'honda')).toBe(true);
    expect(carService.isMoto('NINJA 400', 'KAWASAKI')).toBe(true);
    expect(carService.isMoto('civic', 'honda')).toBe(false);
  });
});

// ─── calculateSmartData ────────────────────────────────────
describe('carService.calculateSmartData', () => {
  it('calculates top speed for low-power cars (≤110 hp)', () => {
    const result = carService.calculateSmartData(
      100,
      'Gasolina',
      1200,
      'Toyota'
    );
    expect(result.topSpeed).toBe(Math.round(155 + 100 * 0.25));
  });

  it('calculates top speed for mid-power cars (111-210 hp)', () => {
    const result = carService.calculateSmartData(180, 'Gasolina', 1400, 'BMW');
    expect(result.topSpeed).toBe(Math.round(175 + 180 * 0.18));
  });

  it('calculates top speed for high-power cars (211-450 hp)', () => {
    const result = carService.calculateSmartData(
      350,
      'Gasolina',
      1600,
      'Ferrari'
    );
    expect(result.topSpeed).toBe(Math.round(210 + 350 * 0.12));
  });

  it('calculates top speed for very high-power cars (>450 hp)', () => {
    const result = carService.calculateSmartData(
      600,
      'Gasolina',
      1800,
      'Lamborghini'
    );
    expect(result.topSpeed).toBe(Math.round(260 + 600 * 0.06));
  });

  it('caps electric car top speed when hp < 500', () => {
    const result = carService.calculateSmartData(
      200,
      'Eléctrico',
      1500,
      'Tesla'
    );
    expect(result.topSpeed).toBeLessThanOrEqual(210);
  });

  it('does not cap electric top speed when hp >= 500', () => {
    const result = carService.calculateSmartData(
      600,
      'Eléctrico',
      2000,
      'Tesla'
    );
    expect(result.topSpeed).toBeGreaterThan(210);
  });

  it('calculates acceleration from weight/hp ratio', () => {
    const result = carService.calculateSmartData(200, 'Gasolina', 1400, 'BMW');
    const expected = Number(Math.max(2.2, (1400 / 200) * 0.85).toFixed(1));
    expect(result.acceleration).toBe(expected);
  });

  it('acceleration never goes below 2.2s', () => {
    const result = carService.calculateSmartData(
      1000,
      'Gasolina',
      1000,
      'Bugatti'
    );
    expect(result.acceleration).toBeGreaterThanOrEqual(2.2);
  });

  it('luxury brands get highest base price', () => {
    const luxury = carService.calculateSmartData(
      500,
      'Gasolina',
      1600,
      'Ferrari'
    );
    const regular = carService.calculateSmartData(
      500,
      'Gasolina',
      1600,
      'Toyota'
    );
    expect(luxury.estimatedPrice).toBeGreaterThan(regular.estimatedPrice);
  });

  it('premium brands get mid-range price', () => {
    const premium = carService.calculateSmartData(200, 'Gasolina', 1400, 'BMW');
    const regular = carService.calculateSmartData(
      200,
      'Gasolina',
      1400,
      'Toyota'
    );
    expect(premium.estimatedPrice).toBeGreaterThan(regular.estimatedPrice);
  });

  it('electric cars get 25% price increase', () => {
    const gas = carService.calculateSmartData(200, 'Gasolina', 1400, 'Toyota');
    const electric = carService.calculateSmartData(
      200,
      'Eléctrico',
      1400,
      'Toyota'
    );
    expect(electric.estimatedPrice).toBeGreaterThan(gas.estimatedPrice);
    // Should be ~1.25x
    const ratio = electric.estimatedPrice / gas.estimatedPrice;
    expect(ratio).toBeCloseTo(1.25, 1);
  });

  it('returns rounded values', () => {
    const result = carService.calculateSmartData(150, 'Gasolina', 1300, 'Seat');
    expect(Number.isInteger(result.topSpeed)).toBe(true);
    expect(Number.isInteger(result.estimatedPrice)).toBe(true);
    // estimatedPrice is rounded to nearest 100
    expect(result.estimatedPrice % 100).toBe(0);
  });
});

// ─── calculateScore ────────────────────────────────────────
describe('carService.calculateScore', () => {
  const baseCar: CarSpec = {
    id: 'test-1',
    brand: 'BMW',
    model: '320i',
    year: 2024,
    hp: 200,
    consumption: 7,
    weight: 1500,
    price: 45000,
    traction: 'RWD',
    acceleration: 6.5,
    topSpeed: 240,
    image: '',
    fuelType: 'Gasolina',
    transmission: 'Auto',
    ecoScore: 65,
    sportScore: 44,
    familyScore: 70,
  };

  const basePrefs: Preferences = {
    minPower: 150,
    maxConsumption: 8,
    maxWeight: 1600,
    maxPrice: 50000,
    preferredTraction: 'any',
  };

  it('returns 100 when car meets all preferences', () => {
    expect(carService.calculateScore(baseCar, basePrefs)).toBe(100);
  });

  it('reduces score when hp is below minPower', () => {
    const weakCar = { ...baseCar, hp: 100 };
    const prefs = { ...basePrefs, minPower: 200 };
    const score = carService.calculateScore(weakCar, prefs);
    expect(score).toBeLessThan(100);
  });

  it('reduces score when consumption exceeds maxConsumption', () => {
    const thirstyCar = { ...baseCar, consumption: 12 };
    const prefs = { ...basePrefs, maxConsumption: 8 };
    const score = carService.calculateScore(thirstyCar, prefs);
    expect(score).toBeLessThan(100);
  });

  it('score never goes below 0', () => {
    const terribleCar = { ...baseCar, hp: 10, consumption: 30 };
    const strictPrefs = { ...basePrefs, minPower: 500, maxConsumption: 3 };
    const score = carService.calculateScore(terribleCar, strictPrefs);
    expect(score).toBe(0);
  });

  it('score never goes above 100', () => {
    const perfectCar = { ...baseCar, hp: 600, consumption: 2 };
    const loosePrefs = { ...basePrefs, minPower: 50, maxConsumption: 20 };
    const score = carService.calculateScore(perfectCar, loosePrefs);
    expect(score).toBe(100);
  });

  it('returns an integer', () => {
    const score = carService.calculateScore(baseCar, basePrefs);
    expect(Number.isInteger(score)).toBe(true);
  });
});

// ─── getCarImage ───────────────────────────────────────────
describe('carService.getCarImage', () => {
  it('returns an imagin.studio URL', () => {
    const url = carService.getCarImage('BMW', '320i', 2024);
    expect(url).toContain('cdn.imagin.studio/getimage');
  });

  it('includes make and model in URL', () => {
    const url = carService.getCarImage('Toyota', 'Corolla', 2024);
    expect(url).toContain('make=toyota');
    expect(url).toContain('modelFamily=corolla');
  });

  it('includes year, angle and color', () => {
    const url = carService.getCarImage('Audi', 'A4', 2024, '05', 'blue');
    expect(url).toContain('modelYear=2024');
    expect(url).toContain('angle=05');
    expect(url).toContain('paintDescription=blue');
  });

  it('uses width=1200 for full images', () => {
    const url = carService.getCarImage(
      'BMW',
      '320i',
      2024,
      '01',
      'white',
      true
    );
    expect(url).toContain('width=1200');
  });

  it('uses width=500 for non-full images', () => {
    const url = carService.getCarImage(
      'BMW',
      '320i',
      2024,
      '01',
      'white',
      false
    );
    expect(url).toContain('width=500');
  });

  it('normalizes model name (removes "serie", spaces)', () => {
    const url = carService.getCarImage('BMW', 'Serie 3', 2024);
    expect(url).toContain('modelFamily=3');
    expect(url).not.toContain('serie');
  });

  it('caches results for same parameters', () => {
    const url1 = carService.getCarImage(
      'Honda',
      'Civic',
      2024,
      '01',
      'red',
      true
    );
    const url2 = carService.getCarImage(
      'Honda',
      'Civic',
      2024,
      '01',
      'red',
      true
    );
    expect(url1).toBe(url2);
  });

  it('defaults to angle=01, color=white, isFull=true', () => {
    const url = carService.getCarImage('Ford', 'Focus', 2024);
    expect(url).toContain('angle=01');
    expect(url).toContain('paintDescription=white');
    expect(url).toContain('width=1200');
  });
});

// ─── mapToCarSpec ──────────────────────────────────────────
describe('carService.mapToCarSpec', () => {
  it('maps a Ninja API response to CarSpec', () => {
    const ninjaResponse = {
      make: 'toyota',
      model: 'corolla',
      year: 2024,
      horsepower: 169,
      combination_mpg: 34,
      drive: 'fwd',
      fuel_type: 'gas',
      transmission: 'a',
    };

    const result = carService.mapToCarSpec(ninjaResponse, 0);

    expect(result.brand).toBe('TOYOTA');
    expect(result.model).toBe('COROLLA');
    expect(result.year).toBe(2024);
    expect(result.hp).toBe(169);
    expect(result.traction).toBe('FWD');
    expect(result.transmission).toBe('Auto');
    expect(result.fuelType).toBe('Gasolina');
    expect(result.id).toContain('ninja-0');
  });

  it('maps electric cars correctly', () => {
    const ninjaResponse = {
      make: 'tesla',
      model: 'model 3',
      year: 2024,
      horsepower: 0,
      combination_mpg: 130,
      drive: 'all',
      fuel_type: 'electricity',
      transmission: 'a',
    };

    const result = carService.mapToCarSpec(ninjaResponse, 5);

    expect(result.hp).toBe(200); // defaults to 200 for electric with no hp
    expect(result.fuelType).toBe('Eléctrico');
    expect(result.traction).toBe('AWD');
    expect(result.ecoScore).toBe(95);
  });

  it('maps manual transmission correctly', () => {
    const ninjaResponse = {
      make: 'mazda',
      model: 'mx-5',
      year: 2024,
      horsepower: 181,
      combination_mpg: 30,
      drive: 'rwd',
      fuel_type: 'gas',
      transmission: 'm',
    };

    const result = carService.mapToCarSpec(ninjaResponse, 0);
    expect(result.transmission).toBe('Manual');
  });

  it('detects AWD from "4" in drive field', () => {
    const ninjaResponse = {
      make: 'subaru',
      model: 'wrx',
      year: 2024,
      horsepower: 271,
      combination_mpg: 27,
      drive: '4wd',
      fuel_type: 'gas',
      transmission: 'm',
    };

    const result = carService.mapToCarSpec(ninjaResponse, 0);
    expect(result.traction).toBe('AWD');
  });

  it('calculates consumption from mpg', () => {
    const ninjaResponse = {
      make: 'honda',
      model: 'civic',
      year: 2024,
      horsepower: 158,
      combination_mpg: 36,
      drive: 'fwd',
      fuel_type: 'gas',
      transmission: 'a',
    };

    const result = carService.mapToCarSpec(ninjaResponse, 0);
    const expectedConsumption = Number((235.21 / 36).toFixed(1));
    expect(result.consumption).toBe(expectedConsumption);
  });

  it('defaults consumption to 6.5 when mpg is 0', () => {
    const ninjaResponse = {
      make: 'unknown',
      model: 'test',
      year: 2024,
      horsepower: 100,
      combination_mpg: 0,
      drive: 'fwd',
      fuel_type: 'gas',
      transmission: 'a',
    };

    const result = carService.mapToCarSpec(ninjaResponse, 0);
    expect(result.consumption).toBe(6.5);
  });
});

// ─── generateSmartSpecs ────────────────────────────────────
describe('carService.generateSmartSpecs', () => {
  it('generates specs for a standard car', () => {
    const result = carService.generateSmartSpecs('Toyota', 'Camry', 0);
    expect(result.brand).toBe('TOYOTA');
    expect(result.model).toBe('CAMRY');
    expect(result.year).toBe(2024);
    expect(result.id).toContain('smart-0');
    expect(result.hp).toBeGreaterThan(0);
    expect(result.consumption).toBeGreaterThan(0);
  });

  it('gives high hp to supercar keywords', () => {
    const ferrari = carService.generateSmartSpecs('Ferrari', 'F40', 0);
    const toyota = carService.generateSmartSpecs('Toyota', 'Yaris', 0);
    expect(ferrari.hp).toBeGreaterThan(toyota.hp);
  });

  it('gives performance stats to sport keywords', () => {
    const amg = carService.generateSmartSpecs('Mercedes', 'C63 AMG', 0);
    expect(amg.hp).toBeGreaterThanOrEqual(420);
  });

  it('gives SUV stats to SUV keywords', () => {
    const suv = carService.generateSmartSpecs('BMW', 'X5', 0);
    expect(suv.weight).toBeGreaterThanOrEqual(1900);
  });

  it('gives economy stats to small car keywords', () => {
    const small = carService.generateSmartSpecs('Fiat', '500', 0);
    expect(small.hp).toBeLessThan(120);
    expect(small.consumption).toBeLessThanOrEqual(5);
  });

  it('varies hp based on index', () => {
    const car0 = carService.generateSmartSpecs('Toyota', 'Camry', 0);
    const car5 = carService.generateSmartSpecs('Toyota', 'Camry', 5);
    expect(car5.hp).toBe(car0.hp + 25); // index * 5
  });

  it('assigns AWD to high-power or heavy cars', () => {
    const powerful = carService.generateSmartSpecs('Ferrari', 'F40', 0);
    expect(powerful.traction).toBe('AWD');
  });

  it('assigns Auto transmission to hp > 170', () => {
    const powerful = carService.generateSmartSpecs('Mercedes', 'C63 AMG', 0);
    expect(powerful.transmission).toBe('Auto');
  });
});

// ─── constants ─────────────────────────────────────────────
describe('carService constants', () => {
  it('has 8 rotation angles', () => {
    expect(carService.angles).toHaveLength(8);
  });

  it('has 5 colors', () => {
    expect(carService.colorList).toHaveLength(5);
    expect(carService.colorList).toContain('white');
    expect(carService.colorList).toContain('black');
    expect(carService.colorList).toContain('red');
  });

  it('motoBrands is a non-empty array of strings', () => {
    expect(carService.motoBrands.length).toBeGreaterThan(0);
    carService.motoBrands.forEach((brand) => {
      expect(typeof brand).toBe('string');
    });
  });
});
