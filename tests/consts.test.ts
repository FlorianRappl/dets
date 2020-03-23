import { runTestFor } from './helper';

test('should be able to handle arrays', () => {
  const result = runTestFor('const1.ts');
  expect(result).toBe(`declare module "test" {
  export const TEST_ARRAY: Array<{
    value: string;
    label: string;
  }>;
}`);
});

test('should be able to handle regular expressions', () => {
  const result = runTestFor('const2.ts');
  expect(result).toBe(`declare module "test" {
  export const IS_TELEPHONE: RegExp;
}`);
});

test('should be able to handle computed properties', () => {
  const result = runTestFor('const3.ts');
  expect(result).toBe(`declare module "test" {
  export const foo: {
    [x: string]: number;
  };
}`);
});

test('should be able tuples', () => {
  const result = runTestFor('const4.ts');
  expect(result).toBe(`declare module "test" {
  export const foo: [number, string];
}`);
});

test('should be able to handle unique keyword', () => {
  const result = runTestFor('const5.ts');
  expect(result).toBe(`declare module "test" {
  export const Foo: unique symbol;
}`);
});

test('should be able to display big int literals', () => {
  const result = runTestFor('const6.ts');
  expect(result).toBe(`declare module "test" {
  export const mybigIntLiteral: 100n;

  export const mybigInt: bigint;
}`);
});

test('should be able to use const object literal', () => {
  const result = runTestFor('const7.ts');
  expect(result).toBe(`declare module "test" {
  export const keyValue: {
    COMPONENT_ERROR__LNK_LABEL: string;
    COMPONENT_ERROR__LNK_MESSAGE: string;
    COMPONENT_ERROR__CNTEXT_MENU_LINK_LABEL: string;
    COMPONENT_ERRR__CNTEXT_MENU_LINK_MESSAGE: string;
    E: string;
    D: string;
    C: string;
    B: string;
    A: string;
  };
}`);
});
