// Comprehensive polyfill for performance object in Edge Runtime
if (typeof global !== 'undefined' && !global.performance) {
  const now = () => Date.now();
  
  global.performance = {
    now,
    mark: (name: string) => {
      // No-op for Edge Runtime
    },
    measure: (name: string, startMark?: string, endMark?: string) => {
      // No-op for Edge Runtime
    },
    getEntries: () => [],
    getEntriesByName: (name: string, type?: string) => [],
    getEntriesByType: (type: string) => [],
    clearMarks: (name?: string) => {
      // No-op for Edge Runtime
    },
    clearMeasures: (name?: string) => {
      // No-op for Edge Runtime
    },
    clearResourceTimings: () => {
      // No-op for Edge Runtime
    },
    setResourceTimingBufferSize: (size: number) => {
      // No-op for Edge Runtime
    },
    toJSON: () => ({}),
    // Add navigation timing properties that OpenTelemetry expects
    navigation: {
      type: 0,
      redirectCount: 0,
      loadEventEnd: 0,
      loadEventStart: 0,
      domContentLoadedEventEnd: 0,
      domContentLoadedEventStart: 0,
      domComplete: 0,
      domInteractive: 0,
      domLoading: 0,
      responseEnd: 0,
      responseStart: 0,
      requestStart: 0,
      connectEnd: 0,
      connectStart: 0,
      secureConnectionStart: 0,
      domainLookupEnd: 0,
      domainLookupStart: 0,
      redirectEnd: 0,
      redirectStart: 0,
      fetchStart: 0,
      unloadEventEnd: 0,
      unloadEventStart: 0,
      toJSON: () => ({}),
    },
    // Add timing properties
    timing: {
      navigationStart: now(),
      unloadEventStart: 0,
      unloadEventEnd: 0,
      redirectStart: 0,
      redirectEnd: 0,
      fetchStart: 0,
      domainLookupStart: 0,
      domainLookupEnd: 0,
      connectStart: 0,
      connectEnd: 0,
      secureConnectionStart: 0,
      requestStart: 0,
      responseStart: 0,
      responseEnd: 0,
      domLoading: 0,
      domInteractive: 0,
      domContentLoadedEventStart: 0,
      domContentLoadedEventEnd: 0,
      domComplete: 0,
      loadEventStart: 0,
      loadEventEnd: 0,
      toJSON: () => ({}),
    },
  } as any;
}

// Also polyfill for window.performance if it doesn't exist
if (typeof window !== 'undefined' && !window.performance) {
  window.performance = global.performance as any;
}

export {};
