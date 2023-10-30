import { runTestFor } from './helper';

test('should be able to get docs of inferred type', async () => {
  const result = await runTestFor('doc1.ts');
  expect(result).toBe(`declare module "test" {
  /**
   * Object description
   * @see exampleExport2
   */
  export const exampleExport: {
    /**
     * Some description
     * @param key some param
     */
    start(key: string): string;
  };
}`);
});
