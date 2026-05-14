import { analytics } from '@/lib/analytics';
import { ErrorService } from './errorService';

// ==================== TYPES ====================

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: string;
  userId?: string;
}

export interface AnalyticsMetrics {
  pageViews: number;
  uniqueUsers: number;
  sessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  topPages: Array<{ page: string; views: number }>;
  userEngagement: {
    dailyActive: number;
    weeklyActive: number;
    monthlyActive: number;
  };
  featureUsage: Record<string, number>;
  errorRate: number;
}

export interface UserFunnel {
  step: string;
  users: number;
  dropoffRate: number;
  conversionRate: number;
}

// ==================== ANALYTICS SERVICE ====================

export class AnalyticsService {
  private static events: AnalyticsEvent[] = [];
  private static sessionStart: string = new Date().toISOString();
  private static pageViews: Set<string> = new Set();

  // ==================== EVENT TRACKING ====================

  static track(event: string, properties: Record<string, any> = {}, userId?: string): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date().toISOString(),
      userId,
    };

    // Store locally
    this.events.push(analyticsEvent);
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Send to analytics service
    try {
      analytics.track(event, properties);
    } catch (error) {
      ErrorService.handleError(error instanceof Error ? error : new Error(String(error)), {
        service: 'analytics',
        action: 'track_event',
        additionalData: { event, properties },
      });
    }
  }

  static identify(userId: string, traits: Record<string, any> = {}): void {
    try {
      analytics.identify(userId, traits);
    } catch (error) {
      ErrorService.handleError(error instanceof Error ? error : new Error(String(error)), {
        service: 'analytics',
        action: 'identify_user',
        additionalData: { userId, traits },
      });
    }
  }

  static page(page: string, properties: Record<string, any> = {}): void {
    this.pageViews.add(page);
    
    try {
      analytics.page(page);
    } catch (error) {
      ErrorService.handleError(error instanceof Error ? error : new Error(String(error)), {
        service: 'analytics',
        action: 'page_view',
        additionalData: { page, properties },
      });
    }
  }

  // ==================== CAREEROS SPECIFIC TRACKING ====================

  static trackOnboardingStep(step: string, completed: boolean, userId?: string): void {
    this.track('onboarding_step', {
      step,
      completed,
      stepNumber: this.getStepNumber(step),
    }, userId);
  }

  static trackResumeUpload(
    fileName: string,
    fileSize: number,
    atsScore: number,
    userId?: string
  ): void {
    this.track('resume_uploaded', {
      fileName,
      fileSize,
      atsScore,
      fileSizeCategory: this.getFileSizeCategory(fileSize),
      atsScoreCategory: this.getAtsScoreCategory(atsScore),
    }, userId);
  }

  static trackJobApplication(
    jobTitle: string,
    company: string,
    status: string,
    userId?: string
  ): void {
    this.track('job_application', {
      jobTitle,
      company,
      status,
      industry: this.extractIndustry(jobTitle),
    }, userId);
  }

  static trackJobSearch(
    query: string,
    filters: Record<string, any>,
    resultsCount: number,
    userId?: string
  ): void {
    this.track('job_search', {
      query,
      filters,
      resultsCount,
      hasFilters: Object.keys(filters).length > 0,
    }, userId);
  }

  static trackFeatureUsage(
    feature: string,
    action: string,
    properties: Record<string, any> = {},
    userId?: string
  ): void {
    this.track('feature_usage', {
      feature,
      action,
      ...properties,
    }, userId);
  }

  static trackUserEngagement(
    action: string,
    properties: Record<string, any> = {},
    userId?: string
  ): void {
    this.track('user_engagement', {
      action,
      sessionDuration: this.getSessionDuration(),
      ...properties,
    }, userId);
  }

  // ==================== CONVERSION TRACKING ====================

  static trackConversion(goal: string, value: number = 1, userId?: string): void {
    this.track('conversion', {
      goal,
      value,
      conversionType: this.getConversionType(goal),
    }, userId);
  }

  static trackFunnelStep(
    funnelName: string,
    step: string,
    completed: boolean,
    userId?: string
  ): void {
    this.track('funnel_step', {
      funnelName,
      step,
      completed,
      stepNumber: this.getFunnelStepNumber(funnelName, step),
    }, userId);
  }

  // ==================== PERFORMANCE TRACKING ====================

  static trackPerformance(
    metric: string,
    value: number,
    unit: string = 'ms',
    properties: Record<string, any> = {}
  ): void {
    this.track('performance', {
      metric,
      value,
      unit,
      ...properties,
    });
  }

  static trackError(
    error: string,
    context: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    this.track('error', {
      error,
      context,
      severity,
      userAgent: navigator.userAgent,
    });
  }

  // ==================== USER BEHAVIOR TRACKING ====================

  static trackClick(element: string, context: Record<string, any> = {}, userId?: string): void {
    this.track('click', {
      element,
      elementType: this.getElementType(element),
      ...context,
    }, userId);
  }

  static trackFormSubmit(
    formName: string,
    fields: Record<string, any>,
    success: boolean,
    userId?: string
  ): void {
    this.track('form_submit', {
      formName,
      fieldCount: Object.keys(fields).length,
      success,
      ...fields,
    }, userId);
  }

  static trackDownload(
    fileName: string,
    fileType: string,
    fileSize: number,
    userId?: string
  ): void {
    this.track('download', {
      fileName,
      fileType,
      fileSize,
      fileSizeCategory: this.getFileSizeCategory(fileSize),
    }, userId);
  }

  // ==================== METRICS CALCULATION ====================

  static getMetrics(): AnalyticsMetrics {
    const now = Date.now();
    const sessionDuration = this.getSessionDuration();
    
    // Calculate page views
    const pageViews = this.pageViews.size;
    
    // Calculate unique users (from events)
    const uniqueUsers = new Set(
      this.events.filter(e => e.userId).map(e => e.userId)
    ).size;

    // Calculate feature usage
    const featureUsage = this.events
      .filter(e => e.event === 'feature_usage')
      .reduce((acc, e) => {
        const feature = e.properties?.feature || 'unknown';
        acc[feature] = (acc[feature] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Calculate error rate
    const totalEvents = this.events.length;
    const errorEvents = this.events.filter(e => e.event === 'error').length;
    const errorRate = totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0;

    // Calculate top pages
    const pageEvents = this.events.filter(e => e.event === 'page_view');
    const pageCounts = pageEvents.reduce((acc, e) => {
      const page = e.properties?.page || 'unknown';
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPages = Object.entries(pageCounts)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      pageViews,
      uniqueUsers,
      sessionDuration,
      bounceRate: this.calculateBounceRate(),
      conversionRate: this.calculateConversionRate(),
      topPages,
      userEngagement: {
        dailyActive: this.calculateActiveUsers('daily'),
        weeklyActive: this.calculateActiveUsers('weekly'),
        monthlyActive: this.calculateActiveUsers('monthly'),
      },
      featureUsage,
      errorRate,
    };
  }

  static getFunnelAnalysis(funnelName: string): UserFunnel[] {
    const funnelEvents = this.events.filter(e => 
      e.event === 'funnel_step' && e.properties?.funnelName === funnelName
    );

    const steps = this.getFunnelSteps(funnelName);
    const analysis: UserFunnel[] = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepEvents = funnelEvents.filter(e => e.properties?.step === step);
      const completedEvents = stepEvents.filter(e => e.properties?.completed);
      
      const users = stepEvents.length;
      const completedUsers = completedEvents.length;
      
      const dropoffRate = i === 0 ? 0 : 
        ((analysis[i - 1].users - users) / analysis[i - 1].users) * 100;
      
      const conversionRate = (completedUsers / users) * 100;

      analysis.push({
        step,
        users,
        dropoffRate,
        conversionRate,
      });
    }

    return analysis;
  }

  // ==================== UTILITY FUNCTIONS ====================

  private static getSessionDuration(): number {
    const start = new Date(this.sessionStart).getTime();
    const now = Date.now();
    return Math.floor((now - start) / 1000);
  }

  private static getStepNumber(step: string): number {
    const steps = ['target-role', 'skills', 'location', 'salary', 'linkedin'];
    return steps.indexOf(step) + 1;
  }

  private static getFileSizeCategory(size: number): string {
    if (size < 1024 * 1024) return '< 1MB';
    if (size < 5 * 1024 * 1024) return '1-5MB';
    if (size < 10 * 1024 * 1024) return '5-10MB';
    return '> 10MB';
  }

  private static getAtsScoreCategory(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  private static extractIndustry(jobTitle: string): string {
    const title = jobTitle.toLowerCase();
    
    if (title.includes('software') || title.includes('developer') || title.includes('engineer')) {
      return 'technology';
    }
    if (title.includes('designer') || title.includes('design')) {
      return 'design';
    }
    if (title.includes('marketing') || title.includes('sales')) {
      return 'marketing';
    }
    if (title.includes('manager') || title.includes('director')) {
      return 'management';
    }
    
    return 'other';
  }

  private static getConversionType(goal: string): string {
    switch (goal) {
      case 'onboarding_completed': return 'onboarding';
      case 'resume_uploaded': return 'engagement';
      case 'job_application': return 'conversion';
      case 'premium_subscription': return 'revenue';
      default: return 'other';
    }
  }

  private static getFunnelSteps(funnelName: string): string[] {
    const funnels: Record<string, string[]> = {
      onboarding: ['target-role', 'skills', 'location', 'salary', 'linkedin', 'completed'],
      job_search: ['search', 'view_results', 'click_job', 'apply'],
      resume_upload: ['upload_start', 'upload_complete', 'parsing_complete', 'ats_scored'],
    };

    return funnels[funnelName] || [];
  }

  private static getFunnelStepNumber(funnelName: string, step: string): number {
    const steps = this.getFunnelSteps(funnelName);
    return steps.indexOf(step) + 1;
  }

  private static calculateBounceRate(): number {
    const pageViews = this.events.filter(e => e.event === 'page_view').length;
    const singlePageSessions = this.events.filter(e => 
      e.event === 'session_end' && e.properties?.pageViews === 1
    ).length;

    return pageViews > 0 ? (singlePageSessions / pageViews) * 100 : 0;
  }

  private static calculateConversionRate(): number {
    const totalUsers = new Set(
      this.events.filter(e => e.userId).map(e => e.userId)
    ).size;
    
    const conversions = this.events.filter(e => e.event === 'conversion').length;

    return totalUsers > 0 ? (conversions / totalUsers) * 100 : 0;
  }

  private static calculateActiveUsers(period: 'daily' | 'weekly' | 'monthly'): number {
    const now = Date.now();
    let cutoff: number;

    switch (period) {
      case 'daily':
        cutoff = now - (24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        cutoff = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        cutoff = now - (30 * 24 * 60 * 60 * 1000);
        break;
    }

    return new Set(
      this.events
        .filter(e => e.userId && new Date(e.timestamp || '').getTime() > cutoff)
        .map(e => e.userId)
    ).size;
  }

  private static getElementType(element: string): string {
    if (element.includes('button')) return 'button';
    if (element.includes('link')) return 'link';
    if (element.includes('form')) return 'form';
    if (element.includes('input')) return 'input';
    if (element.includes('card')) return 'card';
    return 'unknown';
  }

  // ==================== DATA EXPORT ====================

  static exportEvents(): string {
    const exportData = {
      exportedAt: new Date().toISOString(),
      sessionStart: this.sessionStart,
      metrics: this.getMetrics(),
      events: this.events.slice(-100), // Last 100 events
    };

    return JSON.stringify(exportData, null, 2);
  }

  // ==================== DATA CLEARING ====================

  static clearEvents(): void {
    this.events = [];
    this.pageViews.clear();
    this.sessionStart = new Date().toISOString();
  }

  // ==================== HEALTH CHECK ====================

  static getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    eventCount: number;
    errorRate: number;
    lastEvent?: string;
  } {
    const metrics = this.getMetrics();
    const eventCount = this.events.length;
    const lastEvent = this.events[0]?.timestamp;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (metrics.errorRate > 10 || eventCount === 0) {
      status = 'critical';
    } else if (metrics.errorRate > 5 || eventCount < 10) {
      status = 'warning';
    }

    return {
      status,
      eventCount,
      errorRate: metrics.errorRate,
      lastEvent,
    };
  }
}

// ==================== ANALYTICS HOOK ====================

export const useAnalytics = (userId?: string) => {
  const track = (event: string, properties: Record<string, any> = {}) => {
    AnalyticsService.track(event, properties, userId);
  };

  const page = (page: string, properties: Record<string, any> = {}) => {
    AnalyticsService.page(page, properties);
  };

  const identify = (traits: Record<string, any> = {}) => {
    if (userId) {
      AnalyticsService.identify(userId, traits);
    }
  };

  const trackFeature = (feature: string, action: string, properties: Record<string, any> = {}) => {
    AnalyticsService.trackFeatureUsage(feature, action, properties, userId);
  };

  return {
    track,
    page,
    identify,
    trackFeature,
    getMetrics: AnalyticsService.getMetrics,
    getHealthStatus: AnalyticsService.getHealthStatus,
  };
};
