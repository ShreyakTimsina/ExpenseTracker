const { detectAnomaly } = require('../utils/anomalyDetection');

describe('detectAnomaly (Isolation Forest ML)', () => {
  test('returns false when fewer than 5 historical values', () => {
    const history = [100, 200, 150];
    // Not enough data for Isolation Forest
    expect(detectAnomaly(history, 99999)).toBe(false);
  });

  test('returns false when exactly 4 historical values', () => {
    const history = [100, 200, 150, 120];
    expect(detectAnomaly(history, 99999)).toBe(false);
  });

  test('detects anomaly for a massive outlier', () => {
    // Normal clustering near 100
    const history = [100, 105, 95, 101, 99, 102, 98, 100];
    
    // 5000 is objectively an anomaly
    expect(detectAnomaly(history, 5000)).toBe(true);
  });

  test('detects anomaly for severe continuous outliers', () => {
    const history = [20, 22, 19, 21, 23, 18, 20];
    
    // 150 is drastically disconnected from ~20
    expect(detectAnomaly(history, 150)).toBe(true);
  });

  test('returns false for values perfectly inside the established normal cluster', () => {
    const history = [40, 45, 50, 55, 60, 48, 52];
    
    // 55 is right in the middle
    expect(detectAnomaly(history, 55)).toBe(false);
  });
});
