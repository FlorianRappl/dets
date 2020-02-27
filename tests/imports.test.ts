import { runTestFor } from './helper';

test('should handle imports from externals (deox)', () => {
  const result = runTestFor('deox.ts', {
    imports: ['deox'],
  });
  expect(result).toBe(`import * as Deox from 'deox';

declare module "test" {
  export const ACTION: "ACTION";

  export const action1: {
    <_T>(...args: Array<any>): {
      type: "ACTION";
    };
  } & {
    type: "ACTION";
    toString(): "ACTION";
  };

  export type Action<TType extends string, TPayload = undefined, TMeta = undefined> = TPayload extends undefined ? TMeta extends undefined ? {
    type: TType;
  } : {
    type: TType;
    meta: TMeta;
  } : TPayload extends Error ? TMeta extends undefined ? {
    type: TType;
    payload: TPayload;
    error: true;
  } : {
    type: TType;
    payload: TPayload;
    meta: TMeta;
    error: true;
  } : TMeta extends undefined ? {
    type: TType;
    payload: TPayload;
  } : {
    type: TType;
    payload: TPayload;
    meta: TMeta;
  };

  export function createAction2<TType extends string, TCallable extends {
    <_T>(...args: Array<any>): {
      type: TType;
    };
  }>(type: TType, executor?: {
    (resolve: {
      <Payload = undefined, Meta = undefined>(payload?: Payload, meta?: Meta): Action<TType, Payload, Meta>;
    }): TCallable;
  }): TCallable & {
    type: TType;
    toString(): TType;
  };

  export const action2: {
    <_T>(...args: Array<any>): {
      type: "ACTION";
    };
  } & {
    type: "ACTION";
    toString(): "ACTION";
  };
}`);
});

test('should handle complex types from externals (styled-components)', () => {
  const result = runTestFor('styled-components.ts', {
    imports: ['styled-components'],
  });
  expect(result).toBe(`import * as StyledComponents from 'styled-components';

declare module "test" {
  export const Styled: StyledComponents.StyledComponent<"p", any>;
}`);
});

test('should handle jsx from externals (react)', () => {
  const result = runTestFor('react1.tsx', {
    imports: ['react'],
  });
  expect(result).toBe(`import * as React from 'react';

declare module "test" {
  export const MyComponent: React.FunctionComponent<{}>;
}`);
});

test('should handle keyof operator correctly (react)', () => {
  const result = runTestFor('react2.ts', {
    imports: ['react'],
  });
  expect(result).toBe(`import * as React from 'react';

declare module "test" {
  export type NonReactStatics<S extends React.ComponentType<any>, C extends {
    [index: string]: true;
  } = {}> = {
    [key in Exclude<keyof S, S extends React.MemoExoticComponent<any> ? keyof C : S extends React.ForwardRefExoticComponent<any> ? keyof C : keyof C>]: S[key];
  };
}`);
});
