import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Base URL for the Laravel backend
const BASE_URL: string = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }
});

// Request interceptor to handle CSRF token
api.interceptors.request.use(
  async (config) => {
    // Only fetch CSRF token for non-GET requests
    if (config.method !== 'get') {
      try {
        // First, get the CSRF cookie from the Laravel backend
        await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
          withCredentials: true
        });
        
        // Get the XSRF-TOKEN from cookies
        const xsrfToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('XSRF-TOKEN='))
          ?.split('=')[1];
        
        if (xsrfToken) {
          config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
        }
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 419) {
      // CSRF token mismatch - refresh the page to get a new one
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

/**
 * Sets or removes the authorization token in Axios headers.
 * @param token The JWT token to use, or null to remove.
 */
export const setAuthToken = (token: string | null): void => {
  if (token) {
    // Use Bearer Token format for JWT/Sanctum APIs
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export { api };
