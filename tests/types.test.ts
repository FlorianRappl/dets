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

test('should be able to resolve import type partially #46', async () => {
  const result = await runTestFor('type10.ts', {
    imports: ['react'],
  });
  expect(result).toBe(`import * as React from 'react';

declare module "test" {
  export const Alert: React.FC<{}>;
}`);
});

test('should be able to resolve import type fully #46', async () => {
  const result = await runTestFor('type10.ts');
  expect(result).toBe(`declare module "test" {
  export const Alert: FC<{}>;

  export type FC<P = {}> = FunctionComponent<P>;

  export interface FunctionComponent<P = {}> {
    (props: PropsWithChildren<P>, context?: any): ReactElement<any, any> | null;
    propTypes?: WeakValidationMap<P>;
    contextTypes?: ValidationMap<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  export type PropsWithChildren<P> = P & {
    children?: ReactNode;
  };

  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  export type WeakValidationMap<T> = {
    [K in keyof T]?: null extends T[K] ? Validator<T[K] | null | undefined> : undefined extends T[K] ? Validator<T[K] | null | undefined> : Validator<T[K]>;
  };

  export type ValidationMap<T> = ValidationMap___1<T>;

  export type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined;

  export type Key = string | number;

  export type JSXElementConstructor<P> = ((props: P) => ReactElement | null) | (new (props: P) => Component<P, any>);

  export type Validator<T> = Validator___1<T>;

  export type ValidationMap___1<T> = {
    [K in keyof T]?: Validator___1<T[K]>;
  };

  export type ReactChild = ReactElement | ReactText;

  export type ReactFragment = {} | ReactNodeArray;

  export interface ReactPortal extends ReactElement {
    key: Key | null;
    children: ReactNode;
  }

  export class Component<P, S> {
    /**
     * If set, \`this.context\` will be set at runtime to the current value of the given Context.
     * 
     * Usage:
     * 
     * \`\`\`ts
     * type MyContext = number
     * const Ctx = React.createContext<MyContext>(0)
     * 
     * class Foo extends React.Component {
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
     * 
     * \`\`\`ts
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

  export interface Validator___1<T> {
    (props: {
      [key: string]: any;
    }, propName: string, componentName: string, location: string, propFullName: string): Error | null;
    [nominalTypeHack]?: {
      type: T;
    } | undefined;
  }

  export type ReactText = string | number;

  export interface ReactNodeArray extends Array<ReactNode> {}

  export interface Component<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> {}

  export interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
    displayName?: string;
  }

  export type ReactInstance = Component<any> | Element;

  export const nominalTypeHack: unique symbol;

  export interface ComponentLifecycle<P, S, SS = any> extends NewLifecycle<P, S, SS>, DeprecatedLifecycle<P, S> {
    /**
     * Called immediately after a component is mounted. Setting state here will trigger re-rendering.
     */
    componentDidMount?(): void;
    /**
     * Called to determine whether the change in props and state should trigger a re-render.
     * 
     * \`Component\` always returns true.
     * \`PureComponent\` implements a shallow comparison on props and state and returns true if any
     * props or states have changed.
     * 
     * If false is returned, \`Component#render\`, \`componentWillUpdate\`
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

  export interface NewLifecycle<P, S, SS> {
    /**
     * Runs before React applies the result of \`render\` to the document, and
     * returns an object to be given to componentDidUpdate. Useful for saving
     * things such as scroll position before \`render\` causes changes to it.
     * 
     * Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
     * lifecycle events from running.
     */
    getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null;
    /**
     * Called immediately after updating occurs. Not called for the initial render.
     * 
     * The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.
     */
    componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;
  }

  export interface DeprecatedLifecycle<P, S> {
    /**
     * Called immediately before mounting occurs, and before \`Component#render\`.
     * Avoid introducing any side-effects or subscriptions in this method.
     * 
     * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
     * prevents this from being invoked.
     * @deprecated 16.3, use componentDidMount or the constructor instead; will stop working in React 17
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
     */
    componentWillMount?(): void;
    /**
     * Called immediately before mounting occurs, and before \`Component#render\`.
     * Avoid introducing any side-effects or subscriptions in this method.
     * 
     * This method will not stop working in React 17.
     * 
     * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
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
     * 
     * Calling \`Component#setState\` generally does not trigger this method.
     * 
     * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
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
     * 
     * Calling \`Component#setState\` generally does not trigger this method.
     * 
     * This method will not stop working in React 17.
     * 
     * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
     * prevents this from being invoked.
     * @deprecated 16.3, use static getDerivedStateFromProps instead
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
     */
    UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
    /**
     * Called immediately before rendering when new props or state is received. Not called for the initial render.
     * 
     * Note: You cannot call \`Component#setState\` here.
     * 
     * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
     * prevents this from being invoked.
     * @deprecated 16.3, use getSnapshotBeforeUpdate instead; will stop working in React 17
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
     * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
     */
    componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
    /**
     * Called immediately before rendering when new props or state is received. Not called for the initial render.
     * 
     * Note: You cannot call \`Component#setState\` here.
     * 
     * This method will not stop working in React 17.
     * 
     * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
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
}`);
});
