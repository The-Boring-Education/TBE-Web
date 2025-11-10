import { createAuthOptions } from '@tbe/auth';
import NextAuth from 'next-auth';

/**
 * NextAuth configuration for Platform app
 * Uses centralized auth with default callbacks
 */
const authOptions = createAuthOptions({
  pages: {
    signIn: '/login',
    error: '/login',
  },
  useDefaultCallbacks: true, // Use centralized auth logic
});

// Add custom redirect logic if needed
if (authOptions.callbacks) {
  authOptions.callbacks.redirect = async ({ url, baseUrl }) => {
    if (url.startsWith('/')) return `${baseUrl}${url}`;
    if (new URL(url).origin === baseUrl) return url;
    return baseUrl;
  };
}

export default NextAuth(authOptions);
export { authOptions };
