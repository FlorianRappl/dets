import { runTestFor } from './helper';

test('should be able to handle a simple mapped type', async () => {
  const result = await runTestFor('type1.ts');
  expect(result).toBe(`declare module "test" {
  export type Foo = {
    [f: string]: string;
  };
}`);
});

test('should handle mapping of keyof with selection', async () => {
  const result = await runTestFor('type2.ts');
  expect(result).toBe(`declare module "test" {
  export type FunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
  }[keyof T];
}`);
});

test('should handle inference of arguments in conditionals', async () => {
  const result = await runTestFor('type3.ts');
  expect(result).toBe(`declare module "test" {
  export type RemainingArgs<T> = T extends (_: any, ...args: infer U) => any ? U : never;
}`);
});

test('should correctly display conditionals of generics', async () => {
  const result = await runTestFor('type4.ts');
  expect(result).toBe(`declare module "test" {
  export type Diff<T, U> = T extends U ? never : T;
}`);
});

test('should replicate the type name type alias', async () => {
  const result = await runTestFor('type5.ts');
  expect(result).toBe(`declare module "test" {
  export type TypeName<T> = T extends string ? "string" : T extends number ? "number" : T extends boolean ? "boolean" : T extends undefined ? "undefined" : T extends Function ? "function" : "object";
}`);
});

test('should not expand a keyof operator usage', async () => {
  const result = await runTestFor('type6.ts');
  expect(result).toBe(`declare module "test" {
  export interface CustomMerged {
    C: string;
    D: string;
  }

  export interface Merged extends CustomMerged {
    A: string;
    B: string;
  }

  export type MergedKeys = keyof Merged;

  export const mergedParams: (key: MergedKeys) => boolean;
}`);
});

test('should export literal types', async () => {
  const result = await runTestFor('type7.ts');
  expect(result).toBe(`declare module "test" {
  export type Fail1 = string;

  export type Fail2 = "hello" | "world";
}`);
});

test('should export computed types with dotted arguments', async () => {
  const result = await runTestFor('type8.ts');
  expect(result).toBe(`declare module "test" {
  export interface Foo {
    createDataProvider<TItem extends {}, TReducers extends DataProviderReducers<TItem>>(options: DataProviderOptions<TItem, TReducers>): DataConnector<TItem, TReducers>;
  }

  export interface DataProviderOptions<TItem, TReducers> {
    searchData(query: string): Promise<Array<TItem>>;
    reducers?: TReducers;
  }

  export type DataConnector<TItem, TReducers> = GetActions<TReducers> & {
    get(id: string): TItem;
  };

  export interface DataProviderReducers<TItem> {
    [name: string]: {
      (data: DataProviderState<TItem>, ...args: any): DataProviderState<TItem>;
    };
  }

  export type GetActions<TActions> = {
    [P in keyof TActions]: {
      (...args: RemainingArgs<TActions[P]>): void;
    };
  };

  export interface DataProviderState<TItem> {
    current: Array<TItem>;
  }

  export type RemainingArgs<T> = T extends {
    (_: any, ...args: infer U): any;
  } ? U : never;
}`);
});

test('should be able to infer correctly', async () => {
  const result = await runTestFor('type9.ts');
  expect(result).toBe(`declare module "test" {
  export type KeyValue = {
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
