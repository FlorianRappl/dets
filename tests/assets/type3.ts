export type RemainingArgs<T> = T extends (_: any, ...args: infer U) => any ? U : never;
