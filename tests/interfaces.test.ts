import { runTestFor } from './helper';

test('should handle inheritance of interfaces without dropping', () => {
  const result = runTestFor('interface1.ts');
  expect(result).toBe(`declare module "test" {
  export interface CustomMerged {
    C: string;
    D: string;
  }

  export interface Merged extends CustomMerged {
    A: string;
    B: string;
  }
}`);
});
