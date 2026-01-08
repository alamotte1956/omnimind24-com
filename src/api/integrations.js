import { apiClient } from './apiClient';

/**
 * Integration APIs - Replaces Base44 integrations with direct API calls
 * 
 * These integrations provide wrappers around third-party services:
 * - LLM: Direct OpenAI/Anthropic/Google API calls
 * - Email: SendGrid/Mailgun integration
 * - File Upload: AWS S3/Cloudinary integration
 * - Image Generation: DALL-E/Midjourney API
 * 
 * TODO: Backend API endpoints needed:
 * - POST /api/integrations/llm - Invoke LLM (OpenAI, Anthropic, etc.)
 * - POST /api/integrations/email - Send email via SendGrid
 * - POST /api/integrations/upload - Upload file to S3
 * - POST /api/integrations/image - Generate image with DALL-E
 * - POST /api/integrations/extract - Extract data from uploaded file
 * - POST /api/integrations/signed-url - Create signed URL for file access
 * - POST /api/integrations/private-upload - Upload private file
 */

export const Core = apiClient.integrations.Core;

export const InvokeLLM = apiClient.integrations.Core.InvokeLLM;

export const SendEmail = apiClient.integrations.Core.SendEmail;

export const UploadFile = apiClient.integrations.Core.UploadFile;

export const GenerateImage = apiClient.integrations.Core.GenerateImage;

export const ExtractDataFromUploadedFile = apiClient.integrations.Core.ExtractDataFromUploadedFile;

export const CreateFileSignedUrl = apiClient.integrations.Core.CreateFileSignedUrl;

export const UploadPrivateFile = apiClient.integrations.Core.UploadPrivateFile;






