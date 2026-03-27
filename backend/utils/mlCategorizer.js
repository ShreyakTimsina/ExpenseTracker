const natural = require('natural');

const classifier = new natural.BayesClassifier();

// Train Income Categories
classifier.addDocument('my salary for march', 'Income:Salary');
classifier.addDocument('paycheck from work', 'Income:Salary');
classifier.addDocument('fonepay salary monthly', 'Income:Salary');
classifier.addDocument('company bonus dashain', 'Income:Bonus');
classifier.addDocument('holiday tihar bonus', 'Income:Bonus');
classifier.addDocument('freelance web project invoice', 'Income:Sales');
classifier.addDocument('client payment for invoice', 'Income:Sales');
classifier.addDocument('sold old laptop in hamrobazaar', 'Income:Sales');
classifier.addDocument('esewa money receive', 'Income:Sales');
classifier.addDocument('khalti receive payment', 'Income:Sales');
classifier.addDocument('nabil bank investment dividend', 'Income:Investment');
classifier.addDocument('nepsepse share mutual fund', 'Income:Investment');

// Train Expense Categories
classifier.addDocument('pathao ride to the office', 'Expense:Transport');
classifier.addDocument('indrive fare home', 'Expense:Transport');
classifier.addDocument('yango trip', 'Expense:Transport');
classifier.addDocument('taxi microbus bus fare', 'Expense:Transport');
classifier.addDocument('safa tempo toll', 'Expense:Transport');
classifier.addDocument('tootle bike ride', 'Expense:Transport');
classifier.addDocument('gas station petrol pump fuel', 'Expense:Transport');
classifier.addDocument('buddha air flight tickets to pokhara', 'Expense:Travel');
classifier.addDocument('yeti airlines flight', 'Expense:Travel');
classifier.addDocument('airbnb hotel booking thamel', 'Expense:Travel');

classifier.addDocument('mcdonalds kfc lunch', 'Expense:Food');
classifier.addDocument('momo choumein at boudha', 'Expense:Food');
classifier.addDocument('dal bhat thakali set', 'Expense:Food');
classifier.addDocument('chiya samosa breakfast', 'Expense:Food');
classifier.addDocument('baje ko sekuwa dinner', 'Expense:Food');
classifier.addDocument('foodmandu bhojdeals delivery', 'Expense:Food');
classifier.addDocument('bhatbhateni supermarket groceries', 'Expense:Food');
classifier.addDocument('big mart groceries veggies', 'Expense:Food');
classifier.addDocument('kirana pasal shopping', 'Expense:Food');

classifier.addDocument('nea electricity bill', 'Expense:Utilities');
classifier.addDocument('khanepani water tanker', 'Expense:Utilities');
classifier.addDocument('ntc ncell recharge card', 'Expense:Utilities');
classifier.addDocument('ncell data pack', 'Expense:Utilities');
classifier.addDocument('worldlink vianet internet subscription', 'Expense:Utilities');
classifier.addDocument('esewa khalti utility payment', 'Expense:Utilities');

classifier.addDocument('movie theater qfx tickets', 'Expense:Entertainment');
classifier.addDocument('video game steam pubg', 'Expense:Entertainment');
classifier.addDocument('concert festival lod', 'Expense:Entertainment');
classifier.addDocument('netflix subscription', 'Expense:Entertainment');

classifier.addDocument('doctor appointment norvic mediciti', 'Expense:Health');
classifier.addDocument('pharmacy medicine drugs aushadi', 'Expense:Health');
classifier.addDocument('gym membership fitness center', 'Expense:Health');

classifier.addDocument('daraz online shopping office supplies', 'Expense:Office');
classifier.addDocument('office desk chair', 'Expense:Office');
classifier.addDocument('printer paper ink stationery', 'Expense:Office');

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
