import { createEntity, apiClient } from './apiClient';

/**
 * Entity APIs - Replaces Base44 entity operations
 * 
 * Each entity provides CRUD operations:
 * - find(options) - Query entities with filters, sorting, pagination
 * - filter(criteria, sort) - Filter entities (backward compatible)
 * - findById(id) - Get a single entity by ID
 * - list(sort, limit) - List entities with sort (backward compatible)
 * - create(data) - Create a new entity
 * - update(id, data) - Update an entity
 * - patch(id, data) - Partially update an entity
 * - delete(id) - Delete an entity
 * - query(filter) - Custom query
 * 
 * TODO: Backend API endpoints needed for each entity:
 * - GET /api/{entity} - List entities
 * - GET /api/{entity}/:id - Get entity by ID
 * - POST /api/{entity} - Create entity
 * - PUT /api/{entity}/:id - Update entity
 * - PATCH /api/{entity}/:id - Partial update
 * - DELETE /api/{entity}/:id - Delete entity
 * - POST /api/{entity}/query - Custom query
 */

export const Document = createEntity('documents');

export const Conversation = createEntity('conversations');

export const Credit = createEntity('credits');

export const Order = createEntity('orders');

export const APIKey = createEntity('apikeys');

export const Subscription = createEntity('subscriptions');

export const CostarProfile = createEntity('costar-profiles');

export const ModelPreference = createEntity('model-preferences');

export const ModelBenchmark = createEntity('model-benchmarks');

export const ActionItem = createEntity('action-items');

export const ContentOrder = createEntity('content-orders');

export const CreditTransaction = createEntity('credit-transactions');

export const AutoPurchase = createEntity('auto-purchases');

export const ContentIdea = createEntity('content-ideas');

export const ContentShare = createEntity('content-shares');

export const ContentComment = createEntity('content-comments');

export const ContentFolder = createEntity('content-folders');

export const Referral = createEntity('referrals');

export const UserTemplate = createEntity('user-templates');

export const TemplateReview = createEntity('template-reviews');

export const Role = createEntity('roles');

export const ContentPerformance = createEntity('content-performance');

export const SEOAnalysis = createEntity('seo-analysis');

export const FineTunedModel = createEntity('fine-tuned-models');

export const ModelPerformanceLog = createEntity('model-performance-logs');

export const FileExport = createEntity('file-exports');

export const ModelFavorite = createEntity('model-favorites');

// User entity with special auth methods
export const User = {
  ...createEntity('users'),
  ...apiClient.auth
};