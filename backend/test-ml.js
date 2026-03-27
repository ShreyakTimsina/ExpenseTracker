const natural = require('natural');
const { IsolationForest } = require('isolation-forest');

console.log('Natural keys:', Object.keys(natural).slice(0, 10));

try {
  const classifier = new natural.BayesClassifier();
  classifier.addDocument('my salary for march', 'Income:Salary');
  classifier.addDocument('uber ride to the office', 'Expense:Transport');
  classifier.train();
  console.log('Prediction:', classifier.classify('uber back home'));
} catch (e) {
  console.error('Natural error:', e.message);
}

try {
  console.log('IsolationForest type:', typeof IsolationForest);
  const data = [[10], [12], [11], [10.5], [100], [10]];
  const forest = new IsolationForest();
  forest.fit(data);
  const scores = forest.predict(data);
  console.log('Outlier scores:', scores);
} catch (e) {
  console.error('IsolationForest error:', e.message);
}
