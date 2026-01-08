import { apiClient } from './apiClient';

/**
 * Function APIs - Replaces Base44 function invocations
 * 
 * All functions call POST /api/functions/{functionName}
 * 
 * TODO: Backend API endpoints needed:
 * - POST /api/functions/chatWithLLM
 * - POST /api/functions/updateModelBenchmarks
 * - POST /api/functions/selectOptimalModel
 * - POST /api/functions/syncSalesforceTasks
 * - POST /api/functions/syncRealTimeBenchmarks
 * - POST /api/functions/processOrder
 * - POST /api/functions/createPaymentIntent
 * - POST /api/functions/stripeWebhook
 * - POST /api/functions/triggerAutoPurchase
 * - POST /api/functions/generateContentIdeas
 * - POST /api/functions/uploadToS3
 * - POST /api/functions/redeemReferral
 * - POST /api/functions/sendResendEmail
 * - POST /api/functions/resetOnboarding
 * - POST /api/functions/analyzeSEO
 * - POST /api/functions/startFineTuning
 * - POST /api/functions/makeStaff
 * - POST /api/functions/testElevenlabs
 * - POST /api/functions/testTavily
 * - POST /api/functions/testStripe
 * - POST /api/functions/exportContent
 * - POST /api/functions/exportAudio
 * - POST /api/functions/generateSalesSheet
 * - POST /api/functions/generateTechnicalSheet
 * - POST /api/functions/supportChatbot
 * - POST /api/functions/createPaymentIntentx
 * - POST /api/functions/stripeWebhookx
 * - POST /api/functions/completeTestOrder
 * - POST /api/functions/verifyCheckoutSession
 * - POST /api/functions/makeAdmin
 * - POST /api/functions/completeOrder
 * - POST /api/functions/refundOrder
 * - POST /api/functions/cleanupStuckOrders
 * - POST /api/functions/rateLimitCheck
 */

export const chatWithLLM = (params) => apiClient.functions.invoke('chatWithLLM', params);

export const updateModelBenchmarks = (params) => apiClient.functions.invoke('updateModelBenchmarks', params);

export const selectOptimalModel = (params) => apiClient.functions.invoke('selectOptimalModel', params);

export const syncSalesforceTasks = (params) => apiClient.functions.invoke('syncSalesforceTasks', params);

export const syncRealTimeBenchmarks = (params) => apiClient.functions.invoke('syncRealTimeBenchmarks', params);

export const processOrder = (params) => apiClient.functions.invoke('processOrder', params);

export const createPaymentIntent = (params) => apiClient.functions.invoke('createPaymentIntent', params);

export const stripeWebhook = (params) => apiClient.functions.invoke('stripeWebhook', params);

export const triggerAutoPurchase = (params) => apiClient.functions.invoke('triggerAutoPurchase', params);

export const generateContentIdeas = (params) => apiClient.functions.invoke('generateContentIdeas', params);

export const uploadToS3 = (params) => apiClient.functions.invoke('uploadToS3', params);

export const redeemReferral = (params) => apiClient.functions.invoke('redeemReferral', params);

export const sendResendEmail = (params) => apiClient.functions.invoke('sendResendEmail', params);

export const resetOnboarding = (params) => apiClient.functions.invoke('resetOnboarding', params);

export const analyzeSEO = (params) => apiClient.functions.invoke('analyzeSEO', params);

export const startFineTuning = (params) => apiClient.functions.invoke('startFineTuning', params);

export const makeStaff = (params) => apiClient.functions.invoke('makeStaff', params);

export const testElevenlabs = (params) => apiClient.functions.invoke('testElevenlabs', params);

export const testTavily = (params) => apiClient.functions.invoke('testTavily', params);

export const testStripe = (params) => apiClient.functions.invoke('testStripe', params);

export const exportContent = (params) => apiClient.functions.invoke('exportContent', params);

export const exportAudio = (params) => apiClient.functions.invoke('exportAudio', params);

export const generateSalesSheet = (params) => apiClient.functions.invoke('generateSalesSheet', params);

export const generateTechnicalSheet = (params) => apiClient.functions.invoke('generateTechnicalSheet', params);

export const supportChatbot = (params) => apiClient.functions.invoke('supportChatbot', params);

export const createPaymentIntentx = (params) => apiClient.functions.invoke('createPaymentIntentx', params);

export const stripeWebhookx = (params) => apiClient.functions.invoke('stripeWebhookx', params);

export const completeTestOrder = (params) => apiClient.functions.invoke('completeTestOrder', params);

export const verifyCheckoutSession = (params) => apiClient.functions.invoke('verifyCheckoutSession', params);

export const makeAdmin = (params) => apiClient.functions.invoke('makeAdmin', params);

export const completeOrder = (params) => apiClient.functions.invoke('completeOrder', params);

export const refundOrder = (params) => apiClient.functions.invoke('refundOrder', params);

export const cleanupStuckOrders = (params) => apiClient.functions.invoke('cleanupStuckOrders', params);

export const rateLimitCheck = (params) => apiClient.functions.invoke('rateLimitCheck', params);

