export interface MethodsWithJSDoc {
  /**
   * First one start with a comment
   * @param a {string} description of parameter a
   * @param b {string} description of parameter b
   * @example
   * var str = "abc";
   * console.log(foo(str, 3)); // abcabcabc
   */
  method1(a: string, b: number): void;
  /**
   * @param p description of parameter p, no comment before
   */
  method2(p: string): void;
  /**
   * Third one has an inline {@link https://piral.io} tag
   */
  method3(): void;
  /**
   * @abstract
   */
  method4(): void;
}
