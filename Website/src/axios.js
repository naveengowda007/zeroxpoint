// src/axios.js

import axios from 'axios';

// Create an instance of Axios
const api = axios.create({
  baseURL: 'http://localhost:3000/adminapi', // Updated to your API base URL
  timeout: 10000, // Request timeout in milliseconds
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can modify request configuration here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle response data here
    return response.data; // Return only data from the response
  },
  (error) => {
    // Handle errors
    const { response } = error;
    if (response) {
      // Server responded with a status other than 2xx
      console.error('Error Response:', response);
      return Promise.reject(response.data);
    } else {
      // Network error
      console.error('Network Error:', error);
      return Promise.reject({ message: 'Network Error' });
    }
  }
);

export default api;
