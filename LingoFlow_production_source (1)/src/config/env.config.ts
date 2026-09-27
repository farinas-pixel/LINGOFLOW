/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EnvConfiguration {
  appUrl: string;
  hasGeminiApiKey: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Secure environment configuration resolver.
 * Never stores or exposes private raw keys into client state or logs.
 */
export function getEnvConfiguration(): EnvConfiguration {
  const isDev = import.meta.env.DEV ?? false;
  const isProd = import.meta.env.PROD ?? false;
  
  // Safely check for API key presence without ever revealing or hardcoding it
  // The Gemini key is intentionally server-only. The browser must never receive
  // or inspect GEMINI_API_KEY/VITE_GEMINI_API_KEY. The client asks /api/health
  // when it needs to know whether the server-side AI service is configured.
  const hasGeminiKey = false;

  const appUrl = (import.meta.env.VITE_APP_URL as string) || (typeof window !== 'undefined' ? window.location.origin : '');

  return {
    appUrl,
    hasGeminiApiKey: hasGeminiKey,
    isDevelopment: isDev,
    isProduction: isProd,
  };
}
