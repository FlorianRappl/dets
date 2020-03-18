import { runTestFor } from './helper';

test('should handle imports from externals (deox)', () => {
  const result = runTestFor('deox.ts', {
    imports: ['deox'],
  });
  expect(result).toBe(`declare module "test" {
  export const ACTION: "ACTION";

  export const action1: <_T>(...args: Array<any>) => {
    type: "ACTION";
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

  export function createAction2<TType extends string, TCallable extends <_T>(...args: Array<any>) => Action<TType>>(type: TType, executor?: (resolve: <Payload = undefined, Meta = undefined>(payload?: Payload, meta?: Meta) => Action<TType, Payload, Meta>) => TCallable): TCallable & {
    type: TType;
    toString(): TType;
  };

  export const action2: <_T>(...args: Array<any>) => {
    type: "ACTION";
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
  export const Styled: StyledComponents.StyledComponent<"p", any, {}, never>;
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
    [key: string]: true;
  } = {}> = {
    [key in Exclude<keyof S, S extends React.MemoExoticComponent<any> ? keyof MEMO_STATICS | keyof C : S extends React.ForwardRefExoticComponent<any> ? keyof FORWARD_REF_STATICS | keyof C : keyof REACT_STATICS | keyof KNOWN_STATICS | keyof C>]: S[key];
  };

  export interface REACT_STATICS {}

  export interface KNOWN_STATICS {}

  export interface FORWARD_REF_STATICS {}

  export interface MEMO_STATICS {}
}`);
});

test('should handle alias of imports correctly (react)', () => {
  const result = runTestFor('react4.ts', {
    imports: ['react'],
  });
  expect(result).toBe(`import * as React from 'react';

declare module "test" {
  export interface FooProps {
    bar: number;
  }

  export const Foo: React.ComponentType<FooProps>;
}`);
});

test('should handle partial imports in arrays', () => {
  const result = runTestFor('react5.ts');
  expect(result).toBe(`declare module "test" {
  export interface Foo {
    elements: Array<ReactText>;
  }

  export type ReactText = string | number;
}`);
});
