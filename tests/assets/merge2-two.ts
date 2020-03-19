import './merge2';

declare module './merge2' {
  interface MyApi<T> {
    second: T;
  }
}
