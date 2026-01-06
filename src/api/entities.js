import { base44 } from './base44Client';


export const Document = base44.entities.Document;

export const Conversation = base44.entities.Conversation;

export const Credit = base44.entities.Credit;

export const Order = base44.entities.Order;

export const APIKey = base44.entities.APIKey;

export const Subscription = base44.entities.Subscription;

export const CostarProfile = base44.entities.CostarProfile;

export const ModelPreference = base44.entities.ModelPreference;

export const ModelBenchmark = base44.entities.ModelBenchmark;

export const ActionItem = base44.entities.ActionItem;

export const ContentOrder = base44.entities.ContentOrder;

export const CreditTransaction = base44.entities.CreditTransaction;

export const AutoPurchase = base44.entities.AutoPurchase;

export const ContentIdea = base44.entities.ContentIdea;

export const ContentShare = base44.entities.ContentShare;

export const ContentComment = base44.entities.ContentComment;

export const ContentFolder = base44.entities.ContentFolder;

export const Referral = base44.entities.Referral;

export const UserTemplate = base44.entities.UserTemplate;

export const TemplateReview = base44.entities.TemplateReview;

export const Role = base44.entities.Role;

export const ContentPerformance = base44.entities.ContentPerformance;

export const SEOAnalysis = base44.entities.SEOAnalysis;

export const FineTunedModel = base44.entities.FineTunedModel;

export const ModelPerformanceLog = base44.entities.ModelPerformanceLog;

export const FileExport = base44.entities.FileExport;

export const ModelFavorite = base44.entities.ModelFavorite;



// auth sdk:
export const User = base44.auth;

// Authentication entities
// Note: User entity should be defined in Base44 with fields:
// email, password_hash, google_id, name, profile_picture, email_verified, is_active, 
// last_login_at, failed_login_attempts, locked_until
export const UserEntity = base44.entities.User;

// Session entity for token management
// Note: Session entity should be defined in Base44 with fields:
// user_id, token, ip_address, user_agent, expires_at, is_active, revoked_at
export const Session = base44.entities.Session;