// Analytics wrapper that works with or without external libraries
export const analytics = {
  // Track events (works with PostHog or console)
  track: (event: string, properties?: Record<string, any>) => {
    console.log('📊 Analytics Event:', event, properties);
    // PostHog integration will be added when packages are installed
  },
  
  // Track page views
  page: (name: string) => {
    console.log('📊 Analytics Page View:', name);
  },
  
  // Identify user
  identify: (userId: string, properties?: Record<string, any>) => {
    console.log('📊 Analytics Identify:', userId, properties);
  },
  
  // Reset user
  reset: () => {
    console.log('📊 Analytics Reset');
  },
};

// Error tracking wrapper
export const errorTracking = {
  // Capture exceptions
  captureException: (error: Error, context?: Record<string, any>) => {
    console.error('🚨 Error:', error, context);
  },
  
  // Capture messages
  captureMessage: (message: string, level: 'info' | 'warning' | 'error' = 'error') => {
    console.log(`🚨 Message [${level}]:`, message);
  },
  
  // Set user context
  setUser: (user: { id: string; email?: string; name?: string }) => {
    console.log('🚨 Set User:', user);
  },
  
  // Clear user context
  clearUser: () => {
    console.log('🚨 Clear User');
  },
};
