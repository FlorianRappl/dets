import { runTestFor } from './helper';

test('should be able to correctly represent tuples', () => {
  const result = runTestFor('rematch.ts');
  expect(result).toEqual(`declare module "test" {
  export type ExtractParameterFromEffect<P extends Array<unknown>, V extends "payload" | "meta"> = P extends [] ? never : P extends [p?: infer TPayload, s?: unknown] ? V extends "payload" ? P extends [infer TPayloadMayUndefined, ...Array<unknown>] ? [p: TPayloadMayUndefined] : [p?: TPayload] : never : P extends [p?: infer TPayload, s?: unknown, m?: infer TMeta, ...args: Array<unknown>] ? V extends "payload" ? P extends [infer TPayloadMayUndefined, ...Array<unknown>] ? [p: TPayloadMayUndefined] : [p?: TPayload] : P extends [unknown, unknown, infer TMetaMayUndefined, ...Array<unknown>] ? [m: TMetaMayUndefined] : [m?: TMeta] : never;
}`);
});
