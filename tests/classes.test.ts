import { runTestFor } from './helper';

test('should be able to handle exported classes with constructor', () => {
  const result = runTestFor('class1.ts');
  expect(result).toBe(`declare module "test" {
  export class SomeClass {
    constructor(value: string);
    private value: string;
    foo(): string;
  }
}`);
});

test('should be able to handle exported classes with differnet modifiers', () => {
  const result = runTestFor('class2.ts');
  expect(result).toBe(`declare module "test" {
  export class SomeClass {
    constructor(bar: boolean, value: string);
    protected bar: boolean;
    private value: string;
    foo(): string;
    private qxz(): boolean;
    protected name: string;
  }
}`);
});

test('should be able to handle exported generic classes with explicit parameters', () => {
  const result = runTestFor('class3.ts');
  expect(result).toBe(`declare module "test" {
  export class OtherClass<P, S> {}

  export class SomeClass extends OtherClass<{}, {}> {
    constructor();
  }
}`);
});

test('should be able to handle exported generic classes with implicit parameters', () => {
  const result = runTestFor('class4.ts');
  expect(result).toBe(`declare module "test" {
  export class OtherClass<P, S = {}> {}

  export class SomeClass extends OtherClass<{}> {
    constructor();
  }
}`);
});

test('should be able to handle class with implemented interface', () => {
  const result = runTestFor('class5.ts');
  expect(result).toBe(`declare module "test" {
  export class OtherClass<P, S = {}> {}

  export interface OtherInterface<P> {}

  export class SomeClass extends OtherClass<{}> implements OtherInterface<{}> {
    constructor();
  }
}`);
});

test('should be able to handle react classes from externals', () => {
  const result = runTestFor('class6.tsx', {
    imports: ['react'],
  });
  expect(result).toBe(`import * as React from 'react';

declare module "test" {
  export class SomeClass extends React.Component<{}> {
    constructor(props: {});
    render(): JSX.Element;
  }
}`);
});

test('should be able to handle react classes bundled in', () => {
  const result = runTestFor('class6.tsx', {
    imports: [],
  });
  expect(result).toBe(`declare module "test" {
  export class SomeClass extends React.Component<{}> {
    constructor(props: {});
    render(): JSX.Element;
  }
}`);
});
