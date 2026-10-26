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

test('should inline a namespace-imported value with non-exported props', async () => {
  const result = await runTestFor('typeof-namespace.ts');
  expect(result).toBe(`declare module "test" {
  export type Props = ContentProps;

  export interface ContentProps {
    side: string;
  }
}`);
});

test('should include a namespace-imported value when a local export has the same name', async () => {
  const result = await runTestFor('typeof-namespace-collision.ts');
  expect(result).toBe(`declare module "test" {
  export const Content: boolean;

  export type Props = typeof Content___1;

  export const Content___1: ContentProps;

  export interface ContentProps {
    side: string;
  }
}`);
});
