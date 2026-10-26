import { test, expect } from 'vitest';
import { runTestFor } from './helper';

test('Should export the typeof reference, too', async () => {
  const result = await runTestFor('typeof1.ts');
  expect(result).toBe(`declare module "test" {
  export interface Foo {
    bar: typeof Bar;
  }

  export class Bar {}
}`);
});

test('should preserve type arguments in a typeof class reference', async () => {
  const result = await runTestFor('typeof-control.ts');
  expect(result).toBe(`declare module "test" {
  export class Control<Options = string> {
    static extend<Options>(): typeof Control<Options>;
  }
}

declare module "Control" {
  export interface Options {
    position: string;
  }
}`);
});

test('should use the renamed class in a typeof reference when its name collides', async () => {
  const result = await runTestFor('typeof-control-collision.ts');
  expect(result).toBe(`declare module "test" {
  export type Control = string;

  export interface Props {
    control: Control___1;
  }

  export class Control___1<Options = string> {
    static extend<Options>(): typeof Control___1<Options>;
  }
}`);
});
