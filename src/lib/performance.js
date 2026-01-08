/**
 * Performance monitoring utilities
 */

import { useRef, useEffect, memo, useState, useCallback, useMemo } from 'react';

// Performance monitoring singleton
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
    this.isSupported = typeof window !== 'undefined' && 'performance' in window;
  }

  // Start timing a component render
  startRender(componentName) {
    if (!this.isSupported) return;
    
    this.metrics.set(componentName, {
      startTime: performance.now(),
      renderCount: (this.metrics.get(componentName)?.renderCount || 0) + 1
    });
  }

  // End timing a component render
  endRender(componentName) {
    if (!this.isSupported) return;
    
    const metric = this.metrics.get(componentName);
    if (metric && metric.startTime) {
      const renderTime = performance.now() - metric.startTime;
      
      this.metrics.set(componentName, {
        ...metric,
        lastRenderTime: renderTime,
        averageRenderTime: this.calculateAverage(componentName, renderTime),
        startTime: null
      });

      // Warn if render is slow
      if (renderTime > 16.67) { // More than 60fps threshold
        console.warn(`⚠️ Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    }
  }

  // Calculate running average
  calculateAverage(componentName, newTime) {
    const metric = this.metrics.get(componentName);
    if (!metric || metric.renderCount === 1) return newTime;
    
    const totalTime = (metric.averageRenderTime * (metric.renderCount - 1)) + newTime;
    return totalTime / metric.renderCount;
  }

  // Get performance metrics
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  // Log performance summary
  logSummary() {
    if (!this.isSupported) return;
    
    const metrics = this.getMetrics();
    const slowComponents = Object.entries(metrics)
      .filter(([_, metric]) => metric.lastRenderTime > 16.67)
      .sort(([_, a], [__, b]) => b.lastRenderTime - a.lastRenderTime);

    if (slowComponents.length > 0) {
      console.group('🚨 Performance Issues Detected');
      slowComponents.forEach(([name, metric]) => {
        console.log(`${name}: ${metric.lastRenderTime.toFixed(2)}ms (avg: ${metric.averageRenderTime?.toFixed(2)}ms, renders: ${metric.renderCount})`);
      });
      console.groupEnd();
    }

    // Memory usage
    if (performance.memory) {
      console.log('💾 Memory Usage:', {
        used: `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        total: `${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        limit: `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
      });
    }
  }

  // Clear metrics
  clear() {
    this.metrics.clear();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// React Hook for performance monitoring
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);

  useEffect(() => {
    performanceMonitor.startRender(componentName);
    
    return () => {
      performanceMonitor.endRender(componentName);
      renderCount.current += 1;
    };
  });

  return {
    renderCount: renderCount.current,
    metrics: performanceMonitor.getMetrics()[componentName]
  };
};

// Higher-order component for performance monitoring
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  const MonitoredComponent = memo((props) => {
    useEffect(() => {
      performanceMonitor.startRender(componentName);
      
      return () => {
        performanceMonitor.endRender(componentName);
      };
    });

    return <WrappedComponent {...props} />;
  });

  MonitoredComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return MonitoredComponent;
};

// Utility to detect memory leaks
export const detectMemoryLeaks = () => {
  if (!performance.memory) return;

  const initialMemory = performance.memory.usedJSHeapSize;
  
  return () => {
    const currentMemory = performance.memory.usedJSHeapSize;
    const memoryIncrease = currentMemory - initialMemory;
    
    if (memoryIncrease > 10 * 1024 * 1024) { // 10MB increase
      console.warn(`🔍 Potential memory leak detected: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB increase`);
    }
  };
};

// Debounce utility to prevent excessive renders
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle utility for performance
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

// Virtual scroll hook for large lists
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    scrollTop,
    setScrollTop
  };
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [entries, setEntries] = useState([]);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver((entries) => {
      setEntries(entries);
    }, options);

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return [setRef, entries];
};

// Performance optimization for images
export const useImageOptimization = () => {
  const [loadedImages, setLoadedImages] = useState(new Set());

  const loadImage = useCallback((src) => {
    if (loadedImages.has(src)) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, src]));
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, [loadedImages]);

  return { loadImage, isLoaded: (src) => loadedImages.has(src) };
};

// Export the monitor instance
export { performanceMonitor };

// Development-only performance logging
if (import.meta.env.DEV) {
  // Log performance metrics every 30 seconds
  setInterval(() => {
    performanceMonitor.logSummary();
  }, 30000);
}