export interface MyApi {
  foo: string;
  bar: boolean;
}

/**
 * @removeprop bar
 */
export interface MyApi {}
