import { test, expect } from 'vitest';
import { runTestFor } from './helper';

test('should handle triple-slash import', async () => {
  const result = await runTestFor('triple.ts');
  expect(result).toBe(`declare module "test" {
  export interface Bar {
    qxz: number;
  }
}`);
});

test('should not rename DOM globals after referencing an external interface with the same name', async () => {
  const result = await runTestFor('reference-element.ts', {
    imports: ['react'],
  });
  expect(result).toBe(`declare module "test" {
  export interface Props {
    jsx: JSX.Element;
    dom: DomProps;
  }

  export interface DomProps {
    element: Element;
  }
}`);
});
