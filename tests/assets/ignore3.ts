interface MyApi1 {
  foo: string;
}

interface MyApi2 {
  bar: boolean;
}

export interface MyApi extends MyApi1, MyApi2 {}

/**
 * This comment should still exist.
 * @removeclause MyApi1
 */
export interface MyApi {}
