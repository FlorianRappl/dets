import { runTestFor } from './helper';

test('should be able to handle incomplete prop in type definition', () => {
  const result = runTestFor('incomplete1.ts');
  expect(result).toBe(`declare module "test" {
  export type Endpoint = {
    endpointId: any;
    url: string;
    displayName: string;
  };
}`);
});
