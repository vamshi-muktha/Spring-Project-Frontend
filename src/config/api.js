// API Configuration
// Base URL for all API endpoints
// export const API_BASE_URL = 'http://localhost:8088';
// export const API_BASE_URL = process.env.REACT_APP_API;
export const API_BASE_URL = "https://securecard.onrender.com";


// Helper function to construct full API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

const apiConfig = {
  API_BASE_URL,
  getApiUrl
};

export default apiConfig;


// // API Configuration
// export const API_BASE_URL = "http://localhost:9191/securecard";

// // Helper function
// export const getApiUrl = (endpoint) => {
//   const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
//   return `${API_BASE_URL}/${cleanEndpoint}`;
// };

// const apiConfig =  {
//   API_BASE_URL,
//   getApiUrl
// };

// export default apiConfig;
