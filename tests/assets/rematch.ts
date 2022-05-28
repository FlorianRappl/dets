export type ExtractParameterFromEffect<P extends unknown[], V extends 'payload' | 'meta'> = P extends []
  ? never
  : P extends [p?: infer TPayload, s?: unknown]
  ? V extends 'payload'
    ? P extends [infer TPayloadMayUndefined, ...unknown[]]
      ? [p: TPayloadMayUndefined]
      : [p?: TPayload]
    : never
  : P extends [p?: infer TPayload, s?: unknown, m?: infer TMeta, ...args: unknown[]]
  ? V extends 'payload'
    ? P extends [infer TPayloadMayUndefined, ...unknown[]]
      ? [p: TPayloadMayUndefined]
      : [p?: TPayload]
    : P extends [unknown, unknown, infer TMetaMayUndefined, ...unknown[]]
    ? [m: TMetaMayUndefined]
    : [m?: TMeta]
  : never;
