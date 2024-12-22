import { test, expect } from 'vitest';
import { runTestFor } from './helper';

test('Should keep the typeof in referenced cases', async () => {
  const result = await runTestFor('react8.tsx', {
    imports: ['react'],
  });
  expect(result).toBe(`declare module "test" {
  export const PaginationLink: {
    ({ className, isActive, size, ...props }: PaginationLinkProps): JSX.Element;
    displayName: string;
  };

  export const PaginationPrevious: {
    ({ className, ...props }: PaginationLinkProps): JSX.Element;
    displayName: string;
  };

  export interface PaginationLinkProps {
    className: string;
    isActive: boolean;
    size: string;
    other: string;
  }
}`);
});

test('Should return the type as JSX.Element', async () => {
  const result = await runTestFor('react9.tsx', {
    imports: ['react'],
  });
  expect(result).toBe(`declare module "test" {
  export const Foo: () => JSX.Element;
}`);
});

test('Should identify a React component correctly', async () => {
  const result = await runTestFor('react10.tsx', {
    imports: ['react'],
  });
  expect(result).toBe(`import * as React from 'react';

declare module "test" {
  export const SheetHeader: {
    ({ ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element;
    displayName: string;
  };
}`);
});
