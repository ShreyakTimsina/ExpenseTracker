const { calculateStats, detectAnomaly } = require('../utils/anomalyDetection');

describe('calculateStats', () => {
  test('returns zero mean and stdDev for empty array', () => {
    const { mean, stdDev } = calculateStats([]);
    expect(mean).toBe(0);
    expect(stdDev).toBe(0);
  });

  test('calculates correct mean for simple array', () => {
    const { mean } = calculateStats([10, 20, 30]);
    expect(mean).toBeCloseTo(20);
  });

  test('calculates correct standard deviation', () => {
    const { stdDev } = calculateStats([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(stdDev).toBeCloseTo(2, 0);
  });

  test('stdDev is 0 for identical values', () => {
    const { stdDev } = calculateStats([5, 5, 5, 5]);
    expect(stdDev).toBe(0);
  });
});

describe('detectAnomaly', () => {
  test('returns false when fewer than 5 historical values', () => {
    const history = [100, 200, 150];
    expect(detectAnomaly(history, 99999)).toBe(false);
  });

  test('returns false when exactly 4 historical values', () => {
    const history = [100, 200, 150, 120];
    expect(detectAnomaly(history, 99999)).toBe(false);
  });

  test('returns true for a clearly anomalous value', () => {
    // mean=100, stdDev≈0 => threshold = 100
    // 200 > 100 + 2*0 = 100
    const history = [100, 100, 100, 100, 100];
    expect(detectAnomaly(history, 200)).toBe(true);
  });

  test('returns false for a normal value', () => {
    const history = [100, 110, 90, 105, 95];
    expect(detectAnomaly(history, 105)).toBe(false);
  });

  test('returns false for amount exactly equal to threshold (strictly greater required)', () => {
    // mean=100, stdDev=0 => threshold = 100 + 0 = 100
    const history = [100, 100, 100, 100, 100];
    expect(detectAnomaly(history, 100)).toBe(false);
  });

  test('detects anomaly in a realistic dataset', () => {
    // Typical meal costs ~20-30, but someone submits 500
    const history = [22, 25, 18, 30, 28, 24, 20];
    expect(detectAnomaly(history, 500)).toBe(true);
  });

  test('does not flag a value within normal range', () => {
    // mean≈50, stdDev≈10, threshold≈70 — value of 55 is well within range
    const history = [40, 45, 50, 55, 60, 48, 52];
    expect(detectAnomaly(history, 55)).toBe(false);
  });
});
