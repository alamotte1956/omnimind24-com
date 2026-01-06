import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Rate Limiting Check Function
 * 
 * This function implements rate limiting to prevent abuse of API endpoints.
 * It tracks request counts per user and action type.
 * 
 * Rate limits:
 * - content_generation: 30 requests per hour
 * - api_call: 100 requests per hour
 * - export: 20 requests per hour
 * - default: 60 requests per hour
 */

const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  content_generation: { maxRequests: 30, windowMs: 3600000 }, // 30 per hour
  api_call: { maxRequests: 100, windowMs: 3600000 }, // 100 per hour
  export: { maxRequests: 20, windowMs: 3600000 }, // 20 per hour
  default: { maxRequests: 60, windowMs: 3600000 } // 60 per hour
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email, action_type } = await req.json();

    // Input validation
    if (!user_email || typeof user_email !== 'string') {
      return Response.json({ error: 'User email is required' }, { status: 400 });
    }

    const actionKey = action_type || 'default';
    const limit = RATE_LIMITS[actionKey] || RATE_LIMITS.default;
    const windowStart = new Date(Date.now() - limit.windowMs);

    // Get recent requests for this user and action
    const recentRequests = await base44.entities.RateLimitLog.filter({
      user_email: user_email,
      action_type: actionKey
    });

    // Count requests within the time window
    const requestsInWindow = recentRequests.filter(
      (r: any) => new Date(r.created_date) > windowStart
    ).length;

    // Check if rate limit exceeded
    if (requestsInWindow >= limit.maxRequests) {
      const oldestRequest = recentRequests
        .filter((r: any) => new Date(r.created_date) > windowStart)
        .sort((a: any, b: any) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime())[0];
      
      const resetTime = oldestRequest 
        ? new Date(new Date(oldestRequest.created_date).getTime() + limit.windowMs)
        : new Date(Date.now() + limit.windowMs);

      return Response.json({
        allowed: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        limit: limit.maxRequests,
        remaining: 0,
        reset_at: resetTime.toISOString()
      }, { status: 429 });
    }

    // Log this request
    await base44.entities.RateLimitLog.create({
      user_email: user_email,
      action_type: actionKey,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    });

    // Clean up old entries (older than 24 hours)
    // NOTE: For better performance in production, run this as a scheduled background job
    // Recommended index: CREATE INDEX idx_ratelimit_created ON RateLimitLog(created_date)
    const cleanupThreshold = new Date(Date.now() - 86400000);
    const oldEntries = recentRequests.filter(
      (r: any) => new Date(r.created_date) < cleanupThreshold
    );
    
    // Process all old entries instead of limiting to 10
    // Use Promise.allSettled to continue even if some deletions fail
    if (oldEntries.length > 0) {
      const deletePromises = oldEntries.map((entry: any) => 
        base44.entities.RateLimitLog.delete(entry.id).catch((e: any) => {
          console.error(`Failed to delete rate limit log ${entry.id}:`, e);
        })
      );
      await Promise.allSettled(deletePromises);
    }

    return Response.json({
      allowed: true,
      limit: limit.maxRequests,
      remaining: limit.maxRequests - requestsInWindow - 1,
      reset_at: new Date(Date.now() + limit.windowMs).toISOString()
    });

  } catch (error) {
    console.error('Error checking rate limit:', error);
    // On error, allow the request but log it
    return Response.json({
      allowed: true,
      error: 'Rate limit check failed, request allowed',
      limit: 0,
      remaining: 0
    });
  }
});
