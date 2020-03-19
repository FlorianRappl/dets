import { runTestFor } from './helper';

test('should be able to handle exported classes with constructor', () => {
  const result = runTestFor('class1.ts');
  expect(result).toBe(`declare module "test" {
  export class SomeClass {
    constructor(private value: string);
    foo(): string;
  }
}`);
});

test('should be able to handle exported classes with differnet modifiers', () => {
  const result = runTestFor('class2.ts');
  expect(result).toBe(`declare module "test" {
  export class SomeClass {
    constructor(protected bar: boolean, private value: string);
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
  export class SomeClass extends Component<{}> {
    constructor(props: {});
    render(): Element;
  }

  export interface Component<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> {}

  export interface Element extends ReactElement<any, any> {}

  export interface ComponentLifecycle<P, S, SS = any> extends NewLifecycle<P, S, SS>, DeprecatedLifecycle<P, S> {
    /**
     * Called immediately after a component is mounted. Setting state here will trigger re-rendering.
     */
    componentDidMount?(): void;
    /**
     * Called to determine whether the change in props and state should trigger a re-render.
     * \n     * \`Component\` always returns true.
     * \`PureComponent\` implements a shallow comparison on props and state and returns true if any
     * props or states have changed.
     * \n     * If false is returned, \`Component#render\`, \`componentWillUpdate\`
     * and \`componentDidUpdate\` will not be called.
     */
    shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
    /**
     * Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
     * cancelled network requests, or cleaning up any DOM elements created in \`componentDidMount\`.
     */
    componentWillUnmount?(): void;
    /**
     * Catches exceptions generated in descendant components. Unhandled exceptions will cause
     * the entire component tree to unmount.
     */
    componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
  }

  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  export interface NewLifecycle<P, S, SS> {
    /**
     * Runs before React applies the result of \`render\` to the document, and
     * returns an object to be given to componentDidUpdate. Useful for saving
     * things such as scroll position before \`render\` causes changes to it.
     * \n     * Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
     * lifecycle events from running.
     */
    getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null;
    /**
     * Called immediately after updating occurs. Not called for the initial render.
     * \n     * The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.
     */
    componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;
  }

  export interface DeprecatedLifecycle<P, S> {
    /**
     * Called immediately before mounting occurs, and before \`Component#render\`.
     * Avoid introducing any side-effects or subscriptions in this method.
     * \n     * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
     * prevents this from being invoked.
     */
    componentWillMount?(): void;
    /**
     * Called immediately before mounting occurs, and before \`Component#render\`.
     * Avoid introducing any side-effects or subscriptions in this method.
     * \n     * This method will not stop working in React 17.
     * \n     * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
     * prevents this from being invoked.
     */
    UNSAFE_componentWillMount?(): void;
    /**
     * Called when the component may be receiving new props.
     * React may call this even if props have not changed, so be sure to compare new and existing
     * props if you only want to handle changes.
     * \n     * Calling \`Component#setState\` generally does not trigger this method.
     * \n     * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
     * prevents this from being invoked.
     */
    componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
    /**
     * Called when the component may be receiving new props.
     * React may call this even if props have not changed, so be sure to compare new and existing
     * props if you only want to handle changes.
     * \n     * Calling \`Component#setState\` generally does not trigger this method.
     * \n     * This method will not stop working in React 17.
     * \n     * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
     * prevents this from being invoked.
     */
    UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
    /**
     * Called immediately before rendering when new props or state is received. Not called for the initial render.
     * \n     * Note: You cannot call \`Component#setState\` here.
     * \n     * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
     * prevents this from being invoked.
     */
    componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
    /**
     * Called immediately before rendering when new props or state is received. Not called for the initial render.
     * \n     * Note: You cannot call \`Component#setState\` here.
     * \n     * This method will not stop working in React 17.
     * \n     * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
     * prevents this from being invoked.
     */
    UNSAFE_componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
  }

  export interface ErrorInfo {
    /**
     * Captures which component contained the exception, and its ancestors.
     */
    componentStack: string;
  }

  export type Key = string | number;

  export type JSXElementConstructor<P> = ((props: P) => ReactElement | null) | (new (props: P) => Component<P, any>);
}`);
});

test('should be able to handle static members', () => {
  const result = runTestFor('class7.ts');
  expect(result).toBe(`declare module "test" {
  export class SomeClass {
    static foo: number;
  }
}`);
});

test('should be able to handle static members with modifiers', () => {
  const result = runTestFor('class8.ts');
  expect(result).toBe(`declare module "test" {
  export class SomeClass {
    static foo: number;
    qxz: string;
    protected static bar(): number;
  }
}`);
});

test('should remove inherited props', () => {
  const result = runTestFor('class9.ts');
  expect(result).toBe(`declare module "test" {
  export class Bar {
    foo: number;
    bar(): void;
  }

  export class Foo extends Bar {}
}`);
});

test('should be able to get and set accessors', () => {
  const result = runTestFor('class10.ts');
  expect(result).toBe(`declare module "test" {
  export class Foo {
    get foo(): number;
    set foo(value: number);
  }
}`);
});
