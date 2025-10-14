/**
 * Security Event Logger
 * Logs security-relevant events for auditing
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export enum SecurityEventType {
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILURE = 'auth_failure',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  CSRF_TOKEN_INVALID = 'csrf_token_invalid',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  API_KEY_CREATED = 'api_key_created',
  API_KEY_DELETED = 'api_key_deleted',
  API_KEY_USED = 'api_key_used',
}

export interface SecurityEvent {
  eventType: SecurityEventType;
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Log security event to database
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseClient.from('security_logs').insert({
      event_type: event.eventType,
      user_id: event.userId,
      ip_address: event.ip,
      user_agent: event.userAgent,
      details: event.details,
      severity: event.severity,
      created_at: new Date().toISOString(),
    });

    // Also log to console for immediate visibility
    console.log(`[SECURITY] ${event.eventType}:`, {
      userId: event.userId,
      severity: event.severity,
      details: event.details,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Extract client info from request
 */
export function getClientInfo(req: Request): {
  ip: string;
  userAgent: string;
} {
  return {
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
        req.headers.get('x-real-ip') || 
        'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
  };
}
