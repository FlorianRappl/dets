export type Diff<T, U> = T extends U ? never : T;
