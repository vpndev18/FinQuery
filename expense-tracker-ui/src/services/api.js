import axios from 'axios';

// 2. Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5238/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper for consistent error handling
// Although the spec defines a pattern, I'll repeat it for each block or use a wrapper if appropriate.
// The spec says "Each method should... Return { success: true, data: ... }".
// I will implement each function explicitly to match the pattern provided in the example.

// 5. Export API methods

// --- AUTH ---

// Helper to parse backend errors
const getErrorMessage = (error) => {
  console.error("API Error Details:", error); // Debug log
  if (error.response?.data) {
    if (typeof error.response.data === 'string') return error.response.data;
    if (error.response.data.message) return error.response.data.message;
    // Handle ASP.NET Core Validation Problem Details
    if (error.response.data.errors) {
      return Object.values(error.response.data.errors).flat().join(', ');
    }
  }
  return error.message || 'An unexpected error occurred';
};

export const register = async (email, password, confirmPassword) => {
  try {
    const response = await api.post('/auth/register', { email, password, confirmPassword });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Registration Exception:", error);
    return { success: false, error: getErrorMessage(error) };
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Login failed' };
  }
};

export const logout = async () => {
  try {
    // Assuming a POST to /auth/logout based on standard practices, even if not explicitly defined in params for URL
    const response = await api.post('/auth/logout');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Logout failed' };
  }
};

// --- EXPENSES ---

export const getExpenses = async (startDate, endDate, categoryId) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (categoryId) params.categoryId = categoryId;

    const response = await api.get('/expenses', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Error fetching expenses' };
  }
};

export const getExpenseById = async (id) => {
  try {
    const response = await api.get(`/expenses/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Error fetching expense' };
  }
};

export const createExpense = async (data) => {
  try {
    console.log('Creating expense with data:', data);
    const response = await api.post('/expenses', data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Create expense error:', error);
    return { success: false, error: getErrorMessage(error) };
  }
};

export const updateExpense = async (id, data) => {
  try {
    const response = await api.put(`/expenses/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Error updating expense' };
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await api.delete(`/expenses/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Error deleting expense' };
  }
};

export const getExpenseSummary = async (startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/expenses/summary', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Error fetching expense summary' };
  }
};

// --- CATEGORIES ---

export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Error fetching categories' };
  }
};

export const createCategory = async (name, color) => {
  try {
    const response = await api.post('/categories', { name, color });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Error creating category' };
  }
};

export const updateCategory = async (id, name, color) => {
  try {
    const response = await api.put(`/categories/${id}`, { name, color });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Error updating category' };
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Error deleting category' };
  }
};

export default api;
