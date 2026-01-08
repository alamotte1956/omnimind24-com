/**
 * Custom API Client for OmniMind24
 * Replaces the Base44 SDK with a custom implementation
 */

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL || import.meta.env.VITE_API_URL || 'https://api.omnimind24.com';
  }

  /**
   * Make an HTTP request to the API
   * @param {string} endpoint - API endpoint path
   * @param {object} options - Fetch options
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('base44_access_token');
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `API Error: ${response.statusText}`);
      error.response = {
        status: response.status,
        data: errorData
      };
      throw error;
    }
    
    return response.json();
  }

  /**
   * Authentication methods
   */
  auth = {
    me: async () => {
      return this.request('/auth/me');
    },
    
    login: async (credentials) => {
      return this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },
    
    logout: async () => {
      return this.request('/auth/logout', { method: 'POST' });
    },
    
    redirectToLogin: (returnPath) => {
      const redirect = returnPath || window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`;
    },
    
    updateMe: async (data) => {
      return this.request('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
  };

  /**
   * Entity operations
   * Provides CRUD methods for entities
   */
  entities = {
    get: async (entityName, id) => {
      return this.request(`/entities/${entityName}/${id}`);
    },
    
    filter: async (entityName, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/entities/${entityName}${queryString ? `?${queryString}` : ''}`;
      return this.request(endpoint);
    },
    
    create: async (entityName, data) => {
      return this.request(`/entities/${entityName}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    update: async (entityName, id, data) => {
      return this.request(`/entities/${entityName}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    
    delete: async (entityName, id) => {
      return this.request(`/entities/${entityName}/${id}`, {
        method: 'DELETE',
      });
    },

    // Helper methods for creating entity-specific objects
    Document: {
      get: (id) => apiClient.entities.get('Document', id),
      filter: (params) => apiClient.entities.filter('Document', params),
      create: (data) => apiClient.entities.create('Document', data),
      update: (id, data) => apiClient.entities.update('Document', id, data),
      delete: (id) => apiClient.entities.delete('Document', id),
    },
    
    Conversation: {
      get: (id) => apiClient.entities.get('Conversation', id),
      filter: (params) => apiClient.entities.filter('Conversation', params),
      create: (data) => apiClient.entities.create('Conversation', data),
      update: (id, data) => apiClient.entities.update('Conversation', id, data),
      delete: (id) => apiClient.entities.delete('Conversation', id),
    },
    
    Credit: {
      get: (id) => apiClient.entities.get('Credit', id),
      filter: (params) => apiClient.entities.filter('Credit', params),
      create: (data) => apiClient.entities.create('Credit', data),
      update: (id, data) => apiClient.entities.update('Credit', id, data),
      delete: (id) => apiClient.entities.delete('Credit', id),
    },
    
    Order: {
      get: (id) => apiClient.entities.get('Order', id),
      filter: (params) => apiClient.entities.filter('Order', params),
      create: (data) => apiClient.entities.create('Order', data),
      update: (id, data) => apiClient.entities.update('Order', id, data),
      delete: (id) => apiClient.entities.delete('Order', id),
    },
    
    APIKey: {
      get: (id) => apiClient.entities.get('APIKey', id),
      filter: (params) => apiClient.entities.filter('APIKey', params),
      create: (data) => apiClient.entities.create('APIKey', data),
      update: (id, data) => apiClient.entities.update('APIKey', id, data),
      delete: (id) => apiClient.entities.delete('APIKey', id),
    },
    
    Subscription: {
      get: (id) => apiClient.entities.get('Subscription', id),
      filter: (params) => apiClient.entities.filter('Subscription', params),
      create: (data) => apiClient.entities.create('Subscription', data),
      update: (id, data) => apiClient.entities.update('Subscription', id, data),
      delete: (id) => apiClient.entities.delete('Subscription', id),
    },
  };

  /**
   * Function invocation
   * Call backend functions
   */
  functions = {
    invoke: async (functionName, params) => {
      return this.request(`/functions/${functionName}`, {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },
    
    // Wrapper for individual functions
    chatWithLLM: (params) => apiClient.functions.invoke('chatWithLLM', params),
    updateModelBenchmarks: (params) => apiClient.functions.invoke('updateModelBenchmarks', params),
    selectOptimalModel: (params) => apiClient.functions.invoke('selectOptimalModel', params),
    syncSalesforceTasks: (params) => apiClient.functions.invoke('syncSalesforceTasks', params),
    syncRealTimeBenchmarks: (params) => apiClient.functions.invoke('syncRealTimeBenchmarks', params),
    processOrder: (params) => apiClient.functions.invoke('processOrder', params),
    createPaymentIntent: (params) => apiClient.functions.invoke('createPaymentIntent', params),
    stripeWebhook: (params) => apiClient.functions.invoke('stripeWebhook', params),
    triggerAutoPurchase: (params) => apiClient.functions.invoke('triggerAutoPurchase', params),
    generateContentIdeas: (params) => apiClient.functions.invoke('generateContentIdeas', params),
    uploadToS3: (params) => apiClient.functions.invoke('uploadToS3', params),
    redeemReferral: (params) => apiClient.functions.invoke('redeemReferral', params),
    sendResendEmail: (params) => apiClient.functions.invoke('sendResendEmail', params),
    resetOnboarding: (params) => apiClient.functions.invoke('resetOnboarding', params),
    analyzeSEO: (params) => apiClient.functions.invoke('analyzeSEO', params),
    startFineTuning: (params) => apiClient.functions.invoke('startFineTuning', params),
    makeStaff: (params) => apiClient.functions.invoke('makeStaff', params),
    testElevenlabs: (params) => apiClient.functions.invoke('testElevenlabs', params),
    testTavily: (params) => apiClient.functions.invoke('testTavily', params),
    testStripe: (params) => apiClient.functions.invoke('testStripe', params),
    exportContent: (params) => apiClient.functions.invoke('exportContent', params),
    exportAudio: (params) => apiClient.functions.invoke('exportAudio', params),
    generateSalesSheet: (params) => apiClient.functions.invoke('generateSalesSheet', params),
    generateTechnicalSheet: (params) => apiClient.functions.invoke('generateTechnicalSheet', params),
    supportChatbot: (params) => apiClient.functions.invoke('supportChatbot', params),
    createPaymentIntentx: (params) => apiClient.functions.invoke('createPaymentIntentx', params),
    stripeWebhookx: (params) => apiClient.functions.invoke('stripeWebhookx', params),
    completeTestOrder: (params) => apiClient.functions.invoke('completeTestOrder', params),
    verifyCheckoutSession: (params) => apiClient.functions.invoke('verifyCheckoutSession', params),
    makeAdmin: (params) => apiClient.functions.invoke('makeAdmin', params),
    completeOrder: (params) => apiClient.functions.invoke('completeOrder', params),
    refundOrder: (params) => apiClient.functions.invoke('refundOrder', params),
    cleanupStuckOrders: (params) => apiClient.functions.invoke('cleanupStuckOrders', params),
    rateLimitCheck: (params) => apiClient.functions.invoke('rateLimitCheck', params),
  };

  /**
   * Integration methods
   */
  integrations = {
    Core: {
      InvokeLLM: (params) => apiClient.functions.invoke('Core.InvokeLLM', params),
      SendEmail: (params) => apiClient.functions.invoke('Core.SendEmail', params),
      UploadFile: (params) => apiClient.functions.invoke('Core.UploadFile', params),
      GenerateImage: (params) => apiClient.functions.invoke('Core.GenerateImage', params),
      ExtractDataFromUploadedFile: (params) => apiClient.functions.invoke('Core.ExtractDataFromUploadedFile', params),
      CreateFileSignedUrl: (params) => apiClient.functions.invoke('Core.CreateFileSignedUrl', params),
      UploadPrivateFile: (params) => apiClient.functions.invoke('Core.UploadPrivateFile', params),
    },
  };
}

// Export a singleton instance
export const apiClient = new APIClient();

// For backwards compatibility, also export as base44
export const base44 = apiClient;
