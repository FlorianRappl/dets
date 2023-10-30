import { runTestFor } from './helper';

test('should be able to handle arrays', async () => {
  const result = await runTestFor('const1.ts');
  expect(result).toBe(`declare module "test" {
  export const TEST_ARRAY: Array<{
    value: string;
    label: string;
  }>;
}`);
});

test('should be able to handle regular expressions', async () => {
  const result = await runTestFor('const2.ts');
  expect(result).toBe(`declare module "test" {
  export const IS_TELEPHONE: RegExp;
}`);
});

test('should be able to handle computed properties', async () => {
  const result = await runTestFor('const3.ts');
  expect(result).toBe(`declare module "test" {
  export const foo: {
    [x: string]: number;
  };
}`);
});

test('should be able tuples', async () => {
  const result = await runTestFor('const4.ts');
  expect(result).toBe(`declare module "test" {
  export const foo: [number, string];
}`);
});

test('should be able to handle unique keyword', async () => {
  const result = await runTestFor('const5.ts');
  expect(result).toBe(`declare module "test" {
  export const Foo: unique symbol;
}`);
});

test('should be able to display big int literals', async () => {
  const result = await runTestFor('const6.ts');
  expect(result).toBe(`declare module "test" {
  export const mybigIntLiteral: 100n;

  export const mybigInt: bigint;
}`);
});

test('should be able to use const object literal', async () => {
  const result = await runTestFor('const7.ts');
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
