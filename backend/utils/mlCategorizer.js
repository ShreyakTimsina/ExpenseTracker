const natural = require('natural');

const classifier = new natural.BayesClassifier();

// Train Income Categories
classifier.addDocument('my salary for march', 'Income:Salary');
classifier.addDocument('paycheck from work', 'Income:Salary');
classifier.addDocument('monthly wage', 'Income:Salary');
classifier.addDocument('company bonus', 'Income:Bonus');
classifier.addDocument('holiday dividend', 'Income:Bonus');
classifier.addDocument('freelance web project', 'Income:Sales');
classifier.addDocument('client payment for invoice', 'Income:Sales');
classifier.addDocument('sold old laptop', 'Income:Sales');
classifier.addDocument('apple stock sale', 'Income:Investment');
classifier.addDocument('crypto bitcoin eth', 'Income:Investment');

// Train Expense Categories
classifier.addDocument('uber ride to the office', 'Expense:Transport');
classifier.addDocument('taxi fare', 'Expense:Transport');
classifier.addDocument('gas station fuel', 'Expense:Transport');
classifier.addDocument('subway train tickets', 'Expense:Transport');
classifier.addDocument('bus transit', 'Expense:Transport');
classifier.addDocument('flight tickets to new york', 'Expense:Travel');
classifier.addDocument('airbnb hotel booking', 'Expense:Travel');

classifier.addDocument('mcdonalds lunch', 'Expense:Food');
classifier.addDocument('dinner at restaurant', 'Expense:Food');
classifier.addDocument('coffee starbucks', 'Expense:Food');
classifier.addDocument('groceries from supermarket', 'Expense:Food');
classifier.addDocument('pizza delivery', 'Expense:Food');

classifier.addDocument('electric bill', 'Expense:Utilities');
classifier.addDocument('water and heating', 'Expense:Utilities');
classifier.addDocument('internet wifi the utility company', 'Expense:Utilities');
classifier.addDocument('phone monthly plan', 'Expense:Utilities');

classifier.addDocument('movie theater tickets', 'Expense:Entertainment');
classifier.addDocument('video game steam', 'Expense:Entertainment');
classifier.addDocument('concert festival', 'Expense:Entertainment');
classifier.addDocument('netflix subscription', 'Expense:Entertainment');
classifier.addDocument('spotify music', 'Expense:Entertainment');

classifier.addDocument('doctor appointment clinic', 'Expense:Health');
classifier.addDocument('pharmacy medicine drugs', 'Expense:Health');
classifier.addDocument('gym membership Planet Fitness', 'Expense:Health');
classifier.addDocument('hospital bills', 'Expense:Health');

classifier.addDocument('office desk chair', 'Expense:Office');
classifier.addDocument('printer paper ink', 'Expense:Office');
classifier.addDocument('software aws hosting', 'Expense:Office');
classifier.addDocument('adobe creative cloud subscription', 'Expense:Office');

// Train it
classifier.train();

/**
 * Predicts the transaction type and category using a Naive Bayes NLP model
 * @param {string} desc - The transaction description
 * @returns {{ type: string, category: string }}
 */
function predictTransactionInfo(desc) {
  if (!desc || desc.trim().length === 0) {
    return { type: 'Expense', category: 'Other' };
  }

  const predictionStr = classifier.classify(desc.toLowerCase()); // Format e.g., "Expense:Food"
  const [type, category] = predictionStr.split(':');
  
  return { type, category };
}

module.exports = { predictTransactionInfo, classifier };
