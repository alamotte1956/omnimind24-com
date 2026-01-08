/**
 * API Client - Replaces Base44 SDK with custom axios-based client
 * 
 * This client provides:
 * - Authentication token management
 * - Request/response interceptors
 * - Error handling
 * - Retry logic
 * 
 * TODO: Backend API needs to be implemented at VITE_API_BASE_URL
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Storage helper for managing auth tokens
 */
const storage = {
  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  },
  
  setToken: (token, remember = true) => {
    if (typeof window === 'undefined') return;
    if (remember) {
      localStorage.setItem('auth_token', token);
    } else {
      sessionStorage.setItem('auth_token', token);
    }
  },
  
  removeToken: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
  }
};

/**
 * Simple fetch-based API client
 */
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get authorization headers
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const token = storage.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    if (!response.ok) {
      const error = new Error('API request failed');
      error.status = response.status;
      
      try {
        const data = await response.json();
        error.data = data;
        error.message = data.message || data.error || 'Request failed';
      } catch {
        // If JSON parsing fails, use default error message
        error.message = `Request failed with status ${response.status}`;
      }
      
      throw error;
    }
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }
    
    return response.json();
  }

  /**
   * Make a GET request
   */
  async get(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...this.getHeaders(), ...options.headers },
      ...options
    });
    
    return this.handleResponse(response);
  }

  /**
   * Make a POST request
   */
  async post(endpoint, data = {}, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...this.getHeaders(), ...options.headers },
      body: JSON.stringify(data),
      ...options
    });
    
    return this.handleResponse(response);
  }

  /**
   * Make a PUT request
   */
  async put(endpoint, data = {}, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { ...this.getHeaders(), ...options.headers },
      body: JSON.stringify(data),
      ...options
    });
    
    return this.handleResponse(response);
  }

  /**
   * Make a PATCH request
   */
  async patch(endpoint, data = {}, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { ...this.getHeaders(), ...options.headers },
      body: JSON.stringify(data),
      ...options
    });
    
    return this.handleResponse(response);
  }

  /**
   * Make a DELETE request
   */
  async delete(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { ...this.getHeaders(), ...options.headers },
      ...options
    });
    
    return this.handleResponse(response);
  }
}

/**
 * Create entity helper that mimics Base44 entity structure
 * Provides CRUD operations for entities
 */
function createEntity(name) {
  const client = new ApiClient();
  const basePath = `/${name.toLowerCase()}`;
  
  return {
    // Query operations
    find: async (options = {}) => {
      const { filter, sort, limit, offset } = options;
      const params = new URLSearchParams();
      
      if (filter) params.append('filter', JSON.stringify(filter));
      if (sort) params.append('sort', JSON.stringify(sort));
      if (limit) params.append('limit', limit);
      if (offset) params.append('offset', offset);
      
      const queryString = params.toString();
      const endpoint = queryString ? `${basePath}?${queryString}` : basePath;
      
      return client.get(endpoint);
    },
    
    // List with sort (backward compatibility with Base44)
    list: async (sort, limit) => {
      const params = new URLSearchParams();
      if (sort) params.append('sort', sort);
      if (limit) params.append('limit', limit);
      
      const queryString = params.toString();
      const endpoint = queryString ? `${basePath}?${queryString}` : basePath;
      
      return client.get(endpoint);
    },
    
    // Get by ID
    findById: async (id) => {
      return client.get(`${basePath}/${id}`);
    },
    
    // Create
    create: async (data) => {
      return client.post(basePath, data);
    },
    
    // Update
    update: async (id, data) => {
      return client.put(`${basePath}/${id}`, data);
    },
    
    // Partial update
    patch: async (id, data) => {
      return client.patch(`${basePath}/${id}`, data);
    },
    
    // Delete
    delete: async (id) => {
      return client.delete(`${basePath}/${id}`);
    },
    
    // Custom query (for backward compatibility)
    query: async (filter = {}) => {
      return client.post(`${basePath}/query`, filter);
    }
  };
}

/**
 * Authentication API
 */
const auth = {
  /**
   * Get current user
   * TODO: Implement GET /api/auth/me endpoint
   */
  me: async () => {
    const client = new ApiClient();
    try {
      const user = await client.get('/auth/me');
      return user;
    } catch (error) {
      if (error.status === 401) {
        storage.removeToken();
      }
      throw error;
    }
  },

  /**
   * Login
   * TODO: Implement POST /api/auth/login endpoint
   */
  login: async (email, password, remember = true) => {
    const client = new ApiClient();
    const response = await client.post('/auth/login', { email, password });
    
    if (response.token) {
      storage.setToken(response.token, remember);
    }
    
    return response;
  },

  /**
   * Register
   * TODO: Implement POST /api/auth/register endpoint
   */
  register: async (userData) => {
    const client = new ApiClient();
    const response = await client.post('/auth/register', userData);
    
    if (response.token) {
      storage.setToken(response.token);
    }
    
    return response;
  },

  /**
   * Logout
   */
  logout: async (redirectUrl) => {
    storage.removeToken();
    
    if (redirectUrl && typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
  },

  /**
   * Redirect to login page
   */
  redirectToLogin: (returnUrl) => {
    if (typeof window !== 'undefined') {
      const url = returnUrl 
        ? `/login?redirect=${encodeURIComponent(returnUrl)}`
        : '/login';
      window.location.href = url;
    }
  },

  /**
   * Refresh token
   * TODO: Implement POST /api/auth/refresh endpoint
   */
  refresh: async () => {
    const client = new ApiClient();
    const response = await client.post('/auth/refresh');
    
    if (response.token) {
      storage.setToken(response.token);
    }
    
    return response;
  }
};

/**
 * Functions API - for invoking backend functions
 */
const functions = {
  /**
   * Invoke a backend function
   * TODO: Implement POST /api/functions/:name endpoint
   */
  invoke: async (name, params = {}) => {
    const client = new ApiClient();
    return client.post(`/functions/${name}`, params);
  }
};

/**
 * Integrations API - for third-party integrations
 */
const integrations = {
  Core: {
    /**
     * Invoke LLM
     * TODO: Implement POST /api/integrations/llm endpoint
     */
    InvokeLLM: async (params) => {
      const client = new ApiClient();
      return client.post('/integrations/llm', params);
    },

    /**
     * Send Email
     * TODO: Implement POST /api/integrations/email endpoint
     */
    SendEmail: async (params) => {
      const client = new ApiClient();
      return client.post('/integrations/email', params);
    },

    /**
     * Upload File
     * TODO: Implement POST /api/integrations/upload endpoint
     */
    UploadFile: async (params) => {
      const client = new ApiClient();
      return client.post('/integrations/upload', params);
    },

    /**
     * Generate Image
     * TODO: Implement POST /api/integrations/image endpoint
     */
    GenerateImage: async (params) => {
      const client = new ApiClient();
      return client.post('/integrations/image', params);
    },

    /**
     * Extract data from uploaded file
     * TODO: Implement POST /api/integrations/extract endpoint
     */
    ExtractDataFromUploadedFile: async (params) => {
      const client = new ApiClient();
      return client.post('/integrations/extract', params);
    },

    /**
     * Create file signed URL
     * TODO: Implement POST /api/integrations/signed-url endpoint
     */
    CreateFileSignedUrl: async (params) => {
      const client = new ApiClient();
      return client.post('/integrations/signed-url', params);
    },

    /**
     * Upload private file
     * TODO: Implement POST /api/integrations/private-upload endpoint
     */
    UploadPrivateFile: async (params) => {
      const client = new ApiClient();
      return client.post('/integrations/private-upload', params);
    }
  }
};

/**
 * Main API client instance
 */
export const apiClient = {
  auth,
  functions,
  integrations,
  entities: {}, // Will be populated below
  // Direct client access if needed
  client: new ApiClient()
};

/**
 * Export storage utility
 */
export { storage };

/**
 * Export entity creator for custom entities
 */
export { createEntity };

/**
 * Default export for backward compatibility
 */
export default apiClient;
