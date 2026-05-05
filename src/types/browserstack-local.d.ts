declare module 'browserstack-local' {
  export class Local {
    start(
      options: { key: string; force: boolean | 'true' | 'false' },
      callback: (error?: Error | null) => void
    ): void;
    stop(callback: () => void): void;
  }
}
