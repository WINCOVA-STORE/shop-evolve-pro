/**
 * Security Headers Configuration
 * Provides centralized security header management for WinCova
 */

export const SECURITY_HEADERS = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/**
 * Content Security Policy Configuration
 * Allows: Google Analytics, Meta Pixel, Stripe, AutoDS, Supabase, Lovable Cloud
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for React
    "'unsafe-eval'", // Required for development
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://connect.facebook.net',
    'https://js.stripe.com',
    'https://cmp.osano.com',
    '*.lovable.app',
    '*.lovable.dev',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
    'https://www.google-analytics.com',
    'https://www.facebook.com',
    '*.supabase.co',
    '*.autods.com',
  ],
  'font-src': [
    "'self'",
    'data:',
    'https://fonts.gstatic.com',
  ],
  'connect-src': [
    "'self'",
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://www.facebook.com',
    'https://api.stripe.com',
    '*.supabase.co',
    '*.autods.com',
    '*.lovable.app',
    '*.lovable.dev',
    'wss://*.supabase.co',
  ],
  'frame-src': [
    "'self'",
    'https://js.stripe.com',
    'https://www.facebook.com',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': [],
};

/**
 * Generates CSP header value from directives
 */
export function generateCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, values]) => {
      if (values.length === 0) return directive;
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  GENERAL: { requests: 100, windowMs: 60000 }, // 100 req/min
  AUTH: { requests: 30, windowMs: 60000 }, // 30 req/min
  API: { requests: 50, windowMs: 60000 }, // 50 req/min
};

/**
 * Request timeout configuration (milliseconds)
 */
export const REQUEST_TIMEOUTS = {
  SUPABASE_QUERY: 10000, // 10 seconds
  EDGE_FUNCTION: 30000, // 30 seconds
  FILE_UPLOAD: 60000, // 60 seconds
};
