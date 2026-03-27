const { IsolationForest } = require('isolation-forest');

/**
 * Determines if a new amount is an anomaly compared to historical amounts.
 * Uses an Isolation Forest Machine Learning model.
 * 
 * @param {number[]} historicalAmounts - Past transaction amounts in the same category
 * @param {number} newAmount - The new transaction amount
 * @returns {boolean} True if outlier score crosses the threshold
 */
function detectAnomaly(historicalAmounts, newAmount) {
  // We still require at least 5 historical items to build a meaningful forest model
  if (historicalAmounts.length < 5) return false;

  const data = historicalAmounts.map(amount => [amount]);

  // Create isolation forest ML model
  const forest = new IsolationForest();
  forest.fit(data);

  // Predict outlier score (array of exactly one item since we appended one point)
  const scores = forest.predict([[newAmount]]);
  
  // Isolation Forest scores typically range from 0 to 1.
  // Values > 0.5 generally indicate an anomaly, while < 0.5 are normal.
  // We use 0.55 as a balanced threshold for detecting outliers in business data.
  const score = scores[0];
  
  return score > 0.55;
}

module.exports = { detectAnomaly };
