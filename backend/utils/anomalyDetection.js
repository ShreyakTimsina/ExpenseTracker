/**
 * Calculates mean and standard deviation of an array of numbers.
 * @param {number[]} values
 * @returns {{ mean: number, stdDev: number }}
 */
function calculateStats(values) {
  if (values.length === 0) return { mean: 0, stdDev: 0 };

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return { mean, stdDev };
}

/**
 * Determines if a new amount is an anomaly compared to historical amounts.
 * Requires at least 5 historical values. Anomaly if amount > mean + 2*stdDev.
 * @param {number[]} historicalAmounts - Past transaction amounts in the same category
 * @param {number} newAmount - The new transaction amount
 * @returns {boolean}
 */
function detectAnomaly(historicalAmounts, newAmount) {
  if (historicalAmounts.length < 5) return false;

  const { mean, stdDev } = calculateStats(historicalAmounts);
  return newAmount > mean + 2 * stdDev;
}

module.exports = { calculateStats, detectAnomaly };
