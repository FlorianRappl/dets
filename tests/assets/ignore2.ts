export interface MyApi {
  foo: string;
  bar: boolean;
}

/**
 * @dets_removeprop bar
 */
export interface MyApi {}
