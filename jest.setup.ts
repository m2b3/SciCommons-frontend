import '@testing-library/jest-dom';

class IntersectionObserver {
  root: Element | Document | null;
  rootMargin: string;
  thresholds: ReadonlyArray<number>;
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    this.root = options?.root || null;
    this.rootMargin = options?.rootMargin || '0px';
    this.thresholds = options?.threshold ? (Array.isArray(options.threshold) ? options.threshold : [options.threshold]) : [0];
  }

  observe(target: Element) {
    const entry: IntersectionObserverEntry = {
      time: Date.now(),
      target,
      isIntersecting: true,
      intersectionRatio: 1,
      intersectionRect: target.getBoundingClientRect(),
      boundingClientRect: target.getBoundingClientRect(),
      rootBounds: this.root ? (this.root as Element).getBoundingClientRect() : null,
    };
    this.callback([entry], this);
  }

  unobserve() {}

  disconnect() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

(global as any).IntersectionObserver = IntersectionObserver;

export {};
