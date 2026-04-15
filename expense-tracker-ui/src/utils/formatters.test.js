import { formatCurrency, truncate } from './formatters';

describe('formatCurrency', () => {
  test('formats a positive number as USD by default', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  test('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  test('returns empty string for null', () => {
    expect(formatCurrency(null)).toBe('');
  });

  test('returns empty string for undefined', () => {
    expect(formatCurrency(undefined)).toBe('');
  });

  test('returns empty string for NaN', () => {
    expect(formatCurrency(NaN)).toBe('');
  });
});

describe('truncate', () => {
  test('returns text unchanged if under max length', () => {
    expect(truncate('Hello', 50)).toBe('Hello');
  });

  test('truncates and adds ellipsis if over max length', () => {
    expect(truncate('This is a long string', 4)).toBe('This...');
  });

  test('returns empty string for null/undefined', () => {
    expect(truncate(null)).toBe('');
    expect(truncate(undefined)).toBe('');
  });
});
