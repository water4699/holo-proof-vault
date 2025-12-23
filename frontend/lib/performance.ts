// Frontend performance optimization utilities

export interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private startTime: number = 0;

  startMeasurement(): void {
    this.startTime = performance.now();
  }

  endMeasurement(componentCount: number = 1): PerformanceMetrics {
    const renderTime = performance.now() - this.startTime;
    const metric: PerformanceMetrics = {
      renderTime,
      componentCount,
      memoryUsage: (performance as any).memory?.usedJSHeapSize,
    };

    this.metrics.push(metric);
    return metric;
  }

  getAverageRenderTime(): number {
    if (this.metrics.length === 0) return 0;
    return this.metrics.reduce((sum, m) => sum + m.renderTime, 0) / this.metrics.length;
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

// React component optimization hook
export function usePerformanceMonitor(componentName: string) {
  const monitor = new PerformanceMonitor();
  
  return {
    startRender: () => monitor.startMeasurement(),
    endRender: (componentCount?: number) => {
      const metrics = monitor.endMeasurement(componentCount);
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time:`, metrics.renderTime.toFixed(2), 'ms');
      }
      return metrics;
    },
  };
}

// Memoization helper for expensive computations
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

export const performanceMonitor = new PerformanceMonitor();
