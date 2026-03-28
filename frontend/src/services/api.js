import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);

// Transactions
export const getTransactions = () => API.get('/transactions');
export const createTransaction = (data) => API.post('/transactions', data);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);
export const getStats = () => API.get('/transactions/stats');

// Reports
export const getWeeklyReport = (date) =>
  API.get('/transactions/report/weekly', date ? { params: { date } } : {});
export const getMonthlyReport = (year, month) =>
  API.get('/transactions/report/monthly', year ? { params: { year, month } } : {});

export default API;
