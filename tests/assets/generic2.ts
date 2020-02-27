export type Ternary<T = undefined> = (T extends undefined ? {} : { ternary: T; });
