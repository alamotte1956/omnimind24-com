/**
 * Base44 Client - Now using custom API client
 * This file maintained for backwards compatibility
 */
import { apiClient } from './client';

// Export the custom client as base44 for backwards compatibility
export const base44 = apiClient;
