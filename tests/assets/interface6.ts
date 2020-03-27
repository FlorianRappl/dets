export interface Overloads {
  /**
   * First
   */
  foo(a: string, b: number): void;
  /**
   * Second
   */
  foo(a: string): void;
  /**
   * Third
   */
  foo(b: number): void;
}
