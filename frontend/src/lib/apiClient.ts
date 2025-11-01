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

// Helper function to get CSRF token from cookies
const getCsrfToken = (): string | null => {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

// Request interceptor to handle CSRF token and authentication
api.interceptors.request.use(
  async (config) => {
    // Get the authentication token from localStorage
    const authToken = localStorage.getItem('token');
    
    // Add the authorization header if token exists
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Only fetch CSRF token for non-GET requests
    if (config.method?.toLowerCase() !== 'get') {
      try {
        // First, ensure we have a CSRF token
        let token = getCsrfToken();
        
        if (!token) {
          // If no token exists, fetch a new one
          await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
            withCredentials: true,
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
            }
          });
          
          // Get the new token
          token = getCsrfToken();
        }
        
        // Add the token to the request headers
        if (token) {
          config.headers['X-XSRF-TOKEN'] = token;
          config.headers['X-Requested-With'] = 'XMLHttpRequest';
        }
      } catch (error) {
        console.error('Error handling CSRF token:', error);
        // Don't block the request if CSRF token fetch fails
        // The server will handle the missing/invalid token
      }
    }
    
    // Ensure we're sending the correct content type for JSON
    if (config.data && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle CSRF token mismatches
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is a 419 (CSRF token mismatch) and we haven't already retried
    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get a new CSRF token
        await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        // Update the token in the original request headers
        const token = getCsrfToken();
        if (token) {
          originalRequest.headers['X-XSRF-TOKEN'] = token;
        }
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Error refreshing CSRF token:', refreshError);
        // If we can't refresh the token, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
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
