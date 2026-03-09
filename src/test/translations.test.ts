import { describe, it, expect } from 'vitest';
import { translations } from '../locales/translations';

const getKeys = (obj: Record<string, unknown>, prefix = ''): string[] => {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      return getKeys(value as Record<string, unknown>, fullKey);
    }
    return fullKey;
  });
};

describe('translations', () => {
  it('has ES and EN locales', () => {
    expect(translations).toHaveProperty('es');
    expect(translations).toHaveProperty('en');
  });

  it('ES and EN have the exact same keys', () => {
    const esKeys = getKeys(translations.es).sort();
    const enKeys = getKeys(translations.en).sort();
    expect(esKeys).toEqual(enKeys);
  });

  it('no translation value is empty', () => {
    const checkValues = (obj: Record<string, unknown>, locale: string) => {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          checkValues(value as Record<string, unknown>, locale);
        } else {
          expect(value, `${locale}.${key} should not be empty`).toBeTruthy();
        }
      });
    };

    checkValues(translations.es, 'es');
    checkValues(translations.en, 'en');
  });

  it('all values are strings (leaf nodes)', () => {
    const checkTypes = (obj: Record<string, unknown>) => {
      Object.values(obj).forEach((value) => {
        if (typeof value === 'object' && value !== null) {
          checkTypes(value as Record<string, unknown>);
        } else {
          expect(typeof value).toBe('string');
        }
      });
    };

    checkTypes(translations.es);
    checkTypes(translations.en);
  });

  it('ES search button says "Buscar"', () => {
    expect(translations.es.searchButton).toBe('Buscar');
  });

  it('EN search button says "Search"', () => {
    expect(translations.en.searchButton).toBe('Search');
  });

  it('fuelTypes has required keys in both locales', () => {
    const requiredFuelKeys = ['gasolina', 'diesel', 'hibrido', 'electrico'];
    requiredFuelKeys.forEach((key) => {
      expect(translations.es.fuelTypes).toHaveProperty(key);
      expect(translations.en.fuelTypes).toHaveProperty(key);
    });
  });

  it('transmissions has required keys in both locales', () => {
    const requiredKeys = ['manual', 'automatico'];
    requiredKeys.forEach((key) => {
      expect(translations.es.transmissions).toHaveProperty(key);
      expect(translations.en.transmissions).toHaveProperty(key);
    });
  });
});
