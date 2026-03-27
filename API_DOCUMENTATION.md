# ExpenseIQ API Documentation

This document outlines the RESTful endpoints available in the ExpenseIQ backend API.

## Base URL
\`http://localhost:5001/api\` (in development)

---

## 1. Authentication Endpoints

### \`POST /api/auth/register\`
Registers a new user account.
- **Request Body**:
  \`\`\`json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  \`\`\`
- **Response** (201 Created):
  \`\`\`json
  {
    "_id": "60d5ecb8b392d7...1",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
  \`\`\`

### \`POST /api/auth/login\`
Authenticates an existing user and returns a JWT token.
- **Request Body**:
  \`\`\`json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  \`\`\`
- **Response** (200 OK):
  \`\`\`json
  {
    "_id": "60d5ecb8b392d7...1",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
  \`\`\`

---

## 2. Transaction Endpoints

*All endpoints in this section require a valid Bearer JWT Token in the \`Authorization\` header. \`Authorization: Bearer <token>\`*

### \`GET /api/transactions\`
Retrieves all transactions associated with the authenticated user.
- **Response** (200 OK):
  \`\`\`json
  [
    {
      "_id": "60d5ecb8b392d7...",
      "user": "60d5ec...",
      "amount": -45.50,
      "category": "Food",
      "description": "Lunch at McDonald's",
      "date": "2023-10-25T14:30:00.000Z",
      "isAnomaly": false
    }
  ]
  \`\`\`

### \`POST /api/transactions\`
Creates a new financial transaction. The backend automatically runs an Isolation Forest ML model against the user's historical transactions to flag the entry as an anomaly if necessary.
- **Request Body**:
  \`\`\`json
  {
    "amount": -45.50,
    "category": "Food",
    "description": "Lunch at McDonald's",
    "date": "2023-10-25"
  }
  \`\`\`
- **Response** (201 Created):
  \`\`\`json
  {
    "user": "60d5ec...",
    "amount": -45.50,
    "category": "Food",
    "description": "Lunch at McDonald's",
    "date": "2023-10-25T00:00:00.000Z",
    "isAnomaly": true,
    "_id": "60d5ec..."
  }
  \`\`\`

### \`DELETE /api/transactions/:id\`
Deletes a specific transaction associated with the user account.
- **Response** (200 OK):
  \`\`\`json
  { "message": "Transaction removed" }
  \`\`\`

### \`GET /api/transactions/stats\`
Retrieves aggregated statistical insights to build the Dashboard.
- **Response** (200 OK):
  \`\`\`json
  {
    "totalExpenses": 2500.50,
    "totalIncome": 4000.00,
    "balance": 1499.50,
    "anomalyCount": 2,
    "incomeByCategory": { "Salary": 4000.00 },
    "expenseByCategory": { "Transport": 100.00, "Food": 50.00 }
  }
  \`\`\`

---

## 3. Intelligent APIs (Machine Learning)

### \`GET /api/transactions/predict-category?desc=...\`
Passes natural language text into the backend's Naive Bayes NLP model (`natural`) which returns a predicted semantic category mapping.
- **Example Call**: \`GET /api/transactions/predict-category?desc=uber%20ride%20to%20work\`
- **Response** (200 OK):
  \`\`\`json
  {
    "type": "Expense",
    "category": "Transport"
  }
  \`\`\`
