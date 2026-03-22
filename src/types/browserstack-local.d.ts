declare module 'browserstack-local' {
  export class Local {
    start(
      options: { key: string; force: string },
      callback: (error?: Error | null) => void
    ): void;
    stop(callback: () => void): void;
  }
}
