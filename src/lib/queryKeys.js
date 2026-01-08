/**
 * Query Key Factory
 * Provides standardized query keys for TanStack Query
 * This ensures consistency across the application and makes it easier to invalidate queries
 */

export const queryKeys = {
  // User-related queries
  user: ['user'],
  
  // API Keys
  apiKeys: (userId) => ['apiKeys', userId],
  
  // Content Orders
  orders: ['orders'],
  order: (orderId) => ['order', orderId],
  orderHistory: (userId) => ['orderHistory', userId],
  
  // Templates
  templates: ['templates'],
  template: (templateId) => ['template', templateId],
  
  // Credits
  credits: (userId) => ['credits', userId],
  
  // Models
  models: ['models'],
  model: (modelId) => ['model', modelId],
  
  // Files
  files: (userId) => ['files', userId],
  file: (fileId) => ['file', fileId],
  
  // Analytics
  analytics: (userId) => ['analytics', userId],
  
  // Admin
  adminUsers: ['admin', 'users'],
  adminUser: (userId) => ['admin', 'user', userId],
  adminSettings: ['admin', 'settings'],
  
  // Affiliate
  affiliate: (userId) => ['affiliate', userId],
  
  // Actions
  actions: ['actions'],
  action: (actionId) => ['action', actionId],
};

/**
 * Helper function to create filtered query keys
 * @param {string} baseKey - The base query key
 * @param {Object} filters - Filter parameters
 * @returns {Array} Query key array with filters
 */
export const createFilteredQueryKey = (baseKey, filters = {}) => {
  const filterEntries = Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b)); // Sort for consistency
  
  if (filterEntries.length === 0) {
    return [baseKey];
  }
  
  return [baseKey, Object.fromEntries(filterEntries)];
};

/**
 * Example usage:
 * 
 * // Simple query
 * useQuery({ queryKey: queryKeys.user, ... })
 * 
 * // Query with ID
 * useQuery({ queryKey: queryKeys.order(orderId), ... })
 * 
 * // Query with filters
 * useQuery({ 
 *   queryKey: createFilteredQueryKey('orders', { status: 'completed', limit: 10 }), 
 *   ... 
 * })
 * 
 * // Invalidate specific query
 * queryClient.invalidateQueries({ queryKey: queryKeys.orders })
 * 
 * // Invalidate all user-related queries
 * queryClient.invalidateQueries({ queryKey: queryKeys.user })
 */
