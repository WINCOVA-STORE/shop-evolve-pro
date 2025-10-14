/**
 * Secure Storage Utilities
 * Provides secure alternatives to localStorage for sensitive data
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Cart storage moved to Edge Function + Server-side cookies
 * This module provides the client-side interface
 */

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

/**
 * Save cart to secure server-side storage
 */
export async function saveCart(items: CartItem[]): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('cart-storage', {
      body: {
        action: 'save',
        items
      }
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Failed to save cart:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Load cart from secure server-side storage
 */
export async function loadCart(): Promise<{ items: CartItem[]; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('cart-storage', {
      body: {
        action: 'load'
      }
    });

    if (error) throw error;
    return { items: data?.items || [] };
  } catch (error) {
    console.error('Failed to load cart:', error);
    return { 
      items: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Clear cart from secure storage
 */
export async function clearCart(): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('cart-storage', {
      body: {
        action: 'clear'
      }
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Failed to clear cart:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * CSRF Token Management
 */
let csrfToken: string | null = null;

export async function getCSRFToken(): Promise<string> {
  if (csrfToken) return csrfToken;

  try {
    const { data, error } = await supabase.functions.invoke('get-csrf-token');
    
    if (error) throw error;
    
    csrfToken = data.token;
    return csrfToken;
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    throw new Error('CSRF token unavailable');
  }
}

/**
 * Secure form submission with CSRF protection
 */
export async function secureFormSubmit(
  endpoint: string, 
  formData: Record<string, any>
): Promise<Response> {
  const token = await getCSRFToken();
  
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': token,
    },
    body: JSON.stringify(formData),
  });
}

/**
 * Referral code storage (moved to server-side)
 */
export async function saveReferralCode(code: string): Promise<void> {
  try {
    await supabase.functions.invoke('referral-storage', {
      body: {
        action: 'save',
        code
      }
    });
  } catch (error) {
    console.error('Failed to save referral code:', error);
  }
}

export async function getReferralCode(): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('referral-storage', {
      body: {
        action: 'get'
      }
    });

    if (error) throw error;
    return data?.code || null;
  } catch (error) {
    console.error('Failed to get referral code:', error);
    return null;
  }
}

export async function clearReferralCode(): Promise<void> {
  try {
    await supabase.functions.invoke('referral-storage', {
      body: {
        action: 'clear'
      }
    });
  } catch (error) {
    console.error('Failed to clear referral code:', error);
  }
}
