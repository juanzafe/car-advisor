import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    const name = 'Juan';
    expect(name.toUpperCase()).toBe('JUAN');
    expect(name.length).toBe(4);
  });
});
