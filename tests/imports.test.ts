import { test, expect } from 'vitest';
import { writeFileSync, unlinkSync } from 'fs';
import { fail } from 'assert';
import { runTestFor } from './helper';

test('should handle imports from externals (deox)', async () => {
  const result = await runTestFor('deox.ts', {
    imports: ['deox'],
  });
  expect(result).toBe(`import * as Deox from 'deox';

declare module "test" {
  export const ACTION: "ACTION";

  export const action1: ExactActionCreator<"ACTION", () => {
    type: "ACTION";
  }>;

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

  export const action2: (<_T>(...args: Array<any>) => {
    type: "ACTION";
  }) & {
    type: "ACTION";
    toString(): "ACTION";
  };

  export type ExactActionCreator<TType extends string, TCallable extends <_T>(...args: Array<any>) => Deox.Action<TType>> = TCallable & {
    type: TType extends Deox.AnyAction ? TType["type"] : TType;
    toString(): TType extends Deox.AnyAction ? TType["type"] : TType;
  };
}`);
});

test('should handle complex types from externals (styled-components)', async () => {
  const result = await runTestFor('styled-components.ts', {
    imports: ['styled-components'],
  });
  expect(result).toBe(`import * as StyledComponents from 'styled-components';

declare module "test" {
  export const Styled: StyledComponents.StyledComponent<"p", any, {}, never>;
}`);
});

test('should handle jsx from externals (react)', async () => {
  const result = await runTestFor('react1.tsx', {
    imports: ['react'],
  });
  expect(result).toBe(`import * as React from 'react';

declare module "test" {
  export const MyComponent: React.FunctionComponent<{}>;
}`);
});

test('should handle keyof operator correctly (react)', async () => {
  const result = await runTestFor('react2.ts', {
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

test('should handle alias of imports correctly (react)', async () => {
  const result = await runTestFor('react4.ts', {
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

test('should handle partial imports in arrays', async () => {
  const result = await runTestFor('react5.ts');
  expect(result).toBe(`declare module "test" {
  export interface Foo {
    elements: Array<ReactText>;
  }

  export type ReactText = string | number;
}`);
});

test('should handle imports from the right modules', async () => {
  const result = await runTestFor('import1.ts', {
    imports: ['node'],
  });
  expect(result).toBe(`import * as Events from 'events';

declare module "test" {
  export interface Foo extends Events.EventEmitter {}
}`);
});

test('should infer the default export correctly', async () => {
  const result = await runTestFor('react6.tsx', {
    imports: ['react', 'react-redux'],
  });
  expect(result).toBe(`import * as ReactRedux from 'react-redux';

declare module "test" {
  export const _default: ReactRedux.ConnectedComponent<(props: SomeVeryLongComponentNameProps) => JSX.Element, ReactRedux.Omit<SomeVeryLongComponentNameProps, never>>;

  export default _default;

  export interface SomeVeryLongComponentNameProps {
    property_a: string;
    property_b: string;
    property_c: string;
    property_d: string;
    property_e: string;
    property_f: string;
  }
}`);
});

test('should respect the global.d.ts in the Node typings', async () => {
  const result = await runTestFor('import2.ts', {
    imports: ['node'],
  });
  expect(result).toBe(`declare module "test" {
  export type Foo = Buffer;

  export interface Bar {
    buffer: Buffer;
  }
}`);
});

test('should import from the right module - even if submodule', async () => {
  const result = await runTestFor('saga1.ts', {
    imports: ['redux-saga/effects'],
  });
  expect(result).toBe(`import * as ReduxSagaEffects from 'redux-saga/effects';

declare module "test" {
  export interface Foo {
    effect: ReduxSagaEffects.CallEffect;
  }
}`);
});

test('should avoid name clashes when importing', async () => {
  const result = await runTestFor('import3.ts');
  expect(result).toBe(`declare module "test" {
  export interface Foo {
    b: string;
  }

  export type Bar = Foo___1;

  export interface Foo___1 {
    a: string;
    b: Foo___1;
  }
}`);
});

test('should avoid name clashes when aliasing', async () => {
  const result = await runTestFor('import4.ts');
  expect(result).toBe(`declare module "test" {
  export type Foo<T> = Foo___1<T>;

  export interface Foo___1<T> {}
}`);
});

test('should include globals from imported globals if bundled in', async () => {
  const result = await runTestFor('react7.ts');
  expect(result).toBe(`declare module "test" {
  export const foo: JSX_Element;

  export interface JSX_Element extends ReactElement<any, any> {}

  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  export type Key = string | number;

  export type JSXElementConstructor<P> = ((props: P) => ReactElement | null) | (new (props: P) => Component<P, any>);

  export class Component<P, S> {
    /**
     * If set, \`this.context\` will be set at runtime to the current value of the given Context.
     * \n     * Usage:
     * \n     * \`\`\`ts
     * type MyContext = number
     * const Ctx = React.createContext<MyContext>(0)
     * \n     * class Foo extends React.Component {
     *   static contextType = Ctx
     *   context!: React.ContextType<typeof Ctx>
     *   render () {
     *     return <>My context's value: {this.context}</>;
     *   }
     * }
     * \`\`\`
     * @see https://reactjs.org/docs/context.html#classcontexttype
     */
    static contextType: Context<any>;
    /**
     * If using the new style context, re-declare this in your class to be the
     * \`React.ContextType\` of your \`static contextType\`.
     * Should be used with type annotation or static contextType.
     * \n     * \`\`\`ts
     * static contextType = MyContext
     * // For TS pre-3.7:
     * context!: React.ContextType<typeof MyContext>
     * // For TS 3.7 and above:
     * declare context: React.ContextType<typeof MyContext>
     * \`\`\`
     * @see https://reactjs.org/docs/context.html
     */
    context: any;
    constructor(props: Readonly<P>);
    constructor(props: P, context?: any);
    setState<K extends keyof S>(state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null), callback?: () => void): void;
    forceUpdate(callback?: () => void): void;
    render(): ReactNode;
    readonly props: Readonly<P> & Readonly<{
      children?: ReactNode;
    }>;
    state: Readonly<S>;
    /**
     * @deprecated https://reactjs.org/docs/refs-and-the-dom.html#legacy-api-string-refs
     */
    refs: {
      [key: string]: ReactInstance;
    };
  }

  export interface Component<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> {}

  export interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
    displayName?: string;
  }

  export type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined;

  export type ReactInstance = Component<any> | Element;

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

  export type Provider<T> = ProviderExoticComponent<ProviderProps<T>>;

  export type Consumer<T> = ExoticComponent<ConsumerProps<T>>;

  export type ReactChild = ReactElement | ReactText;

  export type ReactFragment = {} | ReactNodeArray;

  export interface ReactPortal extends ReactElement {
    key: Key | null;
    children: ReactNode;
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
     * @deprecated 16.3, use componentDidMount or the constructor instead; will stop working in React 17
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
     */
    componentWillMount?(): void;
    /**
     * Called immediately before mounting occurs, and before \`Component#render\`.
     * Avoid introducing any side-effects or subscriptions in this method.
     * \n     * This method will not stop working in React 17.
     * \n     * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
     * prevents this from being invoked.
     * @deprecated 16.3, use componentDidMount or the constructor instead
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
     */
    UNSAFE_componentWillMount?(): void;
    /**
     * Called when the component may be receiving new props.
     * React may call this even if props have not changed, so be sure to compare new and existing
     * props if you only want to handle changes.
     * \n     * Calling \`Component#setState\` generally does not trigger this method.
     * \n     * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
     * prevents this from being invoked.
     * @deprecated 16.3, use static getDerivedStateFromProps instead; will stop working in React 17
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
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
     * @deprecated 16.3, use static getDerivedStateFromProps instead
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
     */
    UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
    /**
     * Called immediately before rendering when new props or state is received. Not called for the initial render.
     * \n     * Note: You cannot call \`Component#setState\` here.
     * \n     * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
     * prevents this from being invoked.
     * @deprecated 16.3, use getSnapshotBeforeUpdate instead; will stop working in React 17
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
     */
    componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
    /**
     * Called immediately before rendering when new props or state is received. Not called for the initial render.
     * \n     * Note: You cannot call \`Component#setState\` here.
     * \n     * This method will not stop working in React 17.
     * \n     * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
     * prevents this from being invoked.
     * @deprecated 16.3, use getSnapshotBeforeUpdate instead
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
     */
    UNSAFE_componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
  }

  export interface ErrorInfo {
    /**
     * Captures which component contained the exception, and its ancestors.
     */
    componentStack: string;
  }

  export interface ProviderExoticComponent<P> extends ExoticComponent<P> {
    propTypes?: WeakValidationMap<P>;
  }

  export interface ProviderProps<T> {
    value: T;
    children?: ReactNode;
  }

  export interface ExoticComponent<P = {}> {
    /**
     * **NOTE**: Exotic components are not callable.
     */
    (props: P): (ReactElement | null);
    readonly $$typeof: symbol;
  }

  export interface ConsumerProps<T> {
    children(value: T): ReactNode;
  }

  export type ReactText = string | number;

  export interface ReactNodeArray extends Array<ReactNode> {}

  export type WeakValidationMap<T> = {
    [K in keyof T]?: null extends T[K] ? Validator<T[K] | null | undefined> : undefined extends T[K] ? Validator<T[K] | null | undefined> : Validator<T[K]>;
  };

  export type Validator<T> = Validator___1<T>;

  export interface Validator___1<T> {
    (props: {
      [key: string]: any;
    }, propName: string, componentName: string, location: string, propFullName: string): Error | null;
    [nominalTypeHack]?: {
      type: T;
    } | undefined;
  }

  export const nominalTypeHack: unique symbol;
}`);
});

test('should not include globals from imported globals if specified', async () => {
  const result = await runTestFor('react7.ts', {
    imports: ['react']
  });
  expect(result).toBe(`declare module "test" {
  export const foo: JSX.Element;
}`);
});

test('should not include types from imported libs when indirectly referenced', async () => {
  const result = await runTestFor('vue1.ts', {
    imports: ['vue']
  });
  expect(result).toBe(`import * as Vue from 'vue';

declare module "test" {
  export interface MyComponent {
    content: Vue.Component;
  }
}`);
});

test('should not include default export in case of import', async () => {
  const result = await runTestFor('vue2.ts', {
    imports: ['vue']
  });
  expect(result).toBe(`import * as Vue from 'vue';

declare module "test" {
  export interface MyComponent {
    content: Vue.default;
  }
}`);
});

test('should allow using import equals statement', async () => {
  const result = await runTestFor('import5.ts');
  expect(result).toBe(`declare module "test" {
  export type Foo<T> = Foo___1<T>;

  export interface Foo___1<T> {}
}`);
});

test('should evaluate type with typeof correctly in flat imports', async () => {
  const result = await runTestFor('import6.ts');
  expect(result).toBe(`declare module "test" {
  export interface Api {
    foo: {
      foo(): void;
      bar: 5;
      qxz: {
        foo(): void;
        bar: number;
      };
    };
  }
}`);
});

test('should evaluate type with typeof correctly in nested imports', async () => {
  const result = await runTestFor('import7.ts');
  expect(result).toBe(`declare module "test" {
  export interface Api {
    foo: {
      foo(): void;
      bar: 5;
      qxz: {
        foo(): void;
        bar: number;
      };
    };
  }
}`);
});

test('should not duplicate entries', async () => {
  const result = await runTestFor('import8.ts');
  expect(result).toBe(`declare module "test" {
  export type ToastProps = {
    a: string;
    b: number;
  };

  export type ToasterToast = ToastProps & {
    id: string;
  };
}`);
});

test('should handle scoped imports', async () => {
  const result = await runTestFor('scopedWithPeriod.ts', {
    imports: ['@jdeurt/math.ts'],
  });

  const path = require('path');

  // Path to the TypeScript file to check
  const fileName = path.resolve('./src/scopedResult.d.ts');
  writeFileSync(fileName, result);

  
  const ts = require('typescript');
  // Create a program and compile
  const program = ts.createProgram([fileName], {
    noEmit: true, // Don't emit JavaScript files
    strict: true, // Enable strict type-checking
    types: [], // No need to include the default types
  });

  const emitResult = program.emit();
  const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  unlinkSync(fileName);

  if (diagnostics.length > 0) {
    diagnostics.forEach(diagnostic => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      console.error(`Error in ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    });
    fail('TypeScript errors found.');
  }
});