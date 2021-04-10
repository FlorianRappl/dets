import type { Api } from './extensions1-two';

declare module './extensions1-two' {
  interface Api {
    bar: number;
  }
}

export { Api };
