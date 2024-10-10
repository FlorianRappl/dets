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
    ({ className, ...props }: React.ComponentProps<typeof PaginationLink>): JSX.Element;
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
