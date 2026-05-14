// PostHog Analytics Integration
import posthogJs from 'posthog-js';

let posthogClient: typeof posthogJs | null = null;

export const posthog = {
  // Initialize PostHog client
  init: () => {
    const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
    if (!apiKey || apiKey === 'phc_YOUR_POSTHOG_API_KEY_HERE') {
      console.log('PostHog: No API key provided, using console logging');
      return;
    }

    try {
      posthogJs.init(apiKey, {
        api_host: 'https://app.posthog.com',
        autocapture: true,
        capture_pageview: true,
        debug: import.meta.env.DEV,
      });
      posthogClient = posthogJs;
      console.log('PostHog: Initialized successfully');
    } catch (error) {
      console.error('PostHog: Failed to initialize', error);
    }
  },
  
  // Track events
  track: (event: string, properties?: Record<string, any>) => {
    if (posthogClient) {
      posthogClient.capture(event, properties);
    } else {
      console.log('PostHog Event:', event, properties);
    }
  },
  
  // Track page views
  page: (name: string) => {
    if (posthogClient) {
      posthogClient.capture('$pageview', { page: name });
    } else {
      console.log('PostHog Page View:', name);
    }
  },
  
  // Identify user
  identify: (userId: string, properties?: Record<string, any>) => {
    if (posthogClient) {
      posthogClient.identify(userId, properties);
    } else {
      console.log('PostHog Identify:', userId, properties);
    }
  },
  
  // Reset user
  reset: () => {
    if (posthogClient) {
      posthogClient.reset();
    } else {
      console.log('PostHog: Reset user');
    }
  },
};

export type PostHogConfig = {
  apiKey: string;
  host?: string;
};
