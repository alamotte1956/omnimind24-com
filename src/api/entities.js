import { apiClient } from './client';

// Export entity helper objects
export const Document = apiClient.entities.Document;
export const Conversation = apiClient.entities.Conversation;
export const Credit = apiClient.entities.Credit;
export const Order = apiClient.entities.Order;
export const APIKey = apiClient.entities.APIKey;
export const Subscription = apiClient.entities.Subscription;

// Create helper objects for remaining entities
export const CostarProfile = {
  get: (id) => apiClient.entities.get('CostarProfile', id),
  filter: (params) => apiClient.entities.filter('CostarProfile', params),
  create: (data) => apiClient.entities.create('CostarProfile', data),
  update: (id, data) => apiClient.entities.update('CostarProfile', id, data),
  delete: (id) => apiClient.entities.delete('CostarProfile', id),
};

export const ModelPreference = {
  get: (id) => apiClient.entities.get('ModelPreference', id),
  filter: (params) => apiClient.entities.filter('ModelPreference', params),
  create: (data) => apiClient.entities.create('ModelPreference', data),
  update: (id, data) => apiClient.entities.update('ModelPreference', id, data),
  delete: (id) => apiClient.entities.delete('ModelPreference', id),
};

export const ModelBenchmark = {
  get: (id) => apiClient.entities.get('ModelBenchmark', id),
  filter: (params) => apiClient.entities.filter('ModelBenchmark', params),
  create: (data) => apiClient.entities.create('ModelBenchmark', data),
  update: (id, data) => apiClient.entities.update('ModelBenchmark', id, data),
  delete: (id) => apiClient.entities.delete('ModelBenchmark', id),
};

export const ActionItem = {
  get: (id) => apiClient.entities.get('ActionItem', id),
  filter: (params) => apiClient.entities.filter('ActionItem', params),
  create: (data) => apiClient.entities.create('ActionItem', data),
  update: (id, data) => apiClient.entities.update('ActionItem', id, data),
  delete: (id) => apiClient.entities.delete('ActionItem', id),
};

export const ContentOrder = {
  get: (id) => apiClient.entities.get('ContentOrder', id),
  filter: (params) => apiClient.entities.filter('ContentOrder', params),
  create: (data) => apiClient.entities.create('ContentOrder', data),
  update: (id, data) => apiClient.entities.update('ContentOrder', id, data),
  delete: (id) => apiClient.entities.delete('ContentOrder', id),
};

export const CreditTransaction = {
  get: (id) => apiClient.entities.get('CreditTransaction', id),
  filter: (params) => apiClient.entities.filter('CreditTransaction', params),
  create: (data) => apiClient.entities.create('CreditTransaction', data),
  update: (id, data) => apiClient.entities.update('CreditTransaction', id, data),
  delete: (id) => apiClient.entities.delete('CreditTransaction', id),
};

export const AutoPurchase = {
  get: (id) => apiClient.entities.get('AutoPurchase', id),
  filter: (params) => apiClient.entities.filter('AutoPurchase', params),
  create: (data) => apiClient.entities.create('AutoPurchase', data),
  update: (id, data) => apiClient.entities.update('AutoPurchase', id, data),
  delete: (id) => apiClient.entities.delete('AutoPurchase', id),
};

export const ContentIdea = {
  get: (id) => apiClient.entities.get('ContentIdea', id),
  filter: (params) => apiClient.entities.filter('ContentIdea', params),
  create: (data) => apiClient.entities.create('ContentIdea', data),
  update: (id, data) => apiClient.entities.update('ContentIdea', id, data),
  delete: (id) => apiClient.entities.delete('ContentIdea', id),
};

export const ContentShare = {
  get: (id) => apiClient.entities.get('ContentShare', id),
  filter: (params) => apiClient.entities.filter('ContentShare', params),
  create: (data) => apiClient.entities.create('ContentShare', data),
  update: (id, data) => apiClient.entities.update('ContentShare', id, data),
  delete: (id) => apiClient.entities.delete('ContentShare', id),
};

export const ContentComment = {
  get: (id) => apiClient.entities.get('ContentComment', id),
  filter: (params) => apiClient.entities.filter('ContentComment', params),
  create: (data) => apiClient.entities.create('ContentComment', data),
  update: (id, data) => apiClient.entities.update('ContentComment', id, data),
  delete: (id) => apiClient.entities.delete('ContentComment', id),
};

export const ContentFolder = {
  get: (id) => apiClient.entities.get('ContentFolder', id),
  filter: (params) => apiClient.entities.filter('ContentFolder', params),
  create: (data) => apiClient.entities.create('ContentFolder', data),
  update: (id, data) => apiClient.entities.update('ContentFolder', id, data),
  delete: (id) => apiClient.entities.delete('ContentFolder', id),
};

export const Referral = {
  get: (id) => apiClient.entities.get('Referral', id),
  filter: (params) => apiClient.entities.filter('Referral', params),
  create: (data) => apiClient.entities.create('Referral', data),
  update: (id, data) => apiClient.entities.update('Referral', id, data),
  delete: (id) => apiClient.entities.delete('Referral', id),
};

export const UserTemplate = {
  get: (id) => apiClient.entities.get('UserTemplate', id),
  filter: (params) => apiClient.entities.filter('UserTemplate', params),
  create: (data) => apiClient.entities.create('UserTemplate', data),
  update: (id, data) => apiClient.entities.update('UserTemplate', id, data),
  delete: (id) => apiClient.entities.delete('UserTemplate', id),
};

export const TemplateReview = {
  get: (id) => apiClient.entities.get('TemplateReview', id),
  filter: (params) => apiClient.entities.filter('TemplateReview', params),
  create: (data) => apiClient.entities.create('TemplateReview', data),
  update: (id, data) => apiClient.entities.update('TemplateReview', id, data),
  delete: (id) => apiClient.entities.delete('TemplateReview', id),
};

export const Role = {
  get: (id) => apiClient.entities.get('Role', id),
  filter: (params) => apiClient.entities.filter('Role', params),
  create: (data) => apiClient.entities.create('Role', data),
  update: (id, data) => apiClient.entities.update('Role', id, data),
  delete: (id) => apiClient.entities.delete('Role', id),
};

export const ContentPerformance = {
  get: (id) => apiClient.entities.get('ContentPerformance', id),
  filter: (params) => apiClient.entities.filter('ContentPerformance', params),
  create: (data) => apiClient.entities.create('ContentPerformance', data),
  update: (id, data) => apiClient.entities.update('ContentPerformance', id, data),
  delete: (id) => apiClient.entities.delete('ContentPerformance', id),
};

export const SEOAnalysis = {
  get: (id) => apiClient.entities.get('SEOAnalysis', id),
  filter: (params) => apiClient.entities.filter('SEOAnalysis', params),
  create: (data) => apiClient.entities.create('SEOAnalysis', data),
  update: (id, data) => apiClient.entities.update('SEOAnalysis', id, data),
  delete: (id) => apiClient.entities.delete('SEOAnalysis', id),
};

export const FineTunedModel = {
  get: (id) => apiClient.entities.get('FineTunedModel', id),
  filter: (params) => apiClient.entities.filter('FineTunedModel', params),
  create: (data) => apiClient.entities.create('FineTunedModel', data),
  update: (id, data) => apiClient.entities.update('FineTunedModel', id, data),
  delete: (id) => apiClient.entities.delete('FineTunedModel', id),
};

export const ModelPerformanceLog = {
  get: (id) => apiClient.entities.get('ModelPerformanceLog', id),
  filter: (params) => apiClient.entities.filter('ModelPerformanceLog', params),
  create: (data) => apiClient.entities.create('ModelPerformanceLog', data),
  update: (id, data) => apiClient.entities.update('ModelPerformanceLog', id, data),
  delete: (id) => apiClient.entities.delete('ModelPerformanceLog', id),
};

export const FileExport = {
  get: (id) => apiClient.entities.get('FileExport', id),
  filter: (params) => apiClient.entities.filter('FileExport', params),
  create: (data) => apiClient.entities.create('FileExport', data),
  update: (id, data) => apiClient.entities.update('FileExport', id, data),
  delete: (id) => apiClient.entities.delete('FileExport', id),
};

export const ModelFavorite = {
  get: (id) => apiClient.entities.get('ModelFavorite', id),
  filter: (params) => apiClient.entities.filter('ModelFavorite', params),
  create: (data) => apiClient.entities.create('ModelFavorite', data),
  update: (id, data) => apiClient.entities.update('ModelFavorite', id, data),
  delete: (id) => apiClient.entities.delete('ModelFavorite', id),
};

// Auth SDK - export as User for backwards compatibility
export const User = apiClient.auth;