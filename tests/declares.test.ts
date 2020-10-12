import { runTestFor } from './helper';

test('should handle manual composition of react typings', () => {
  const result = runTestFor('react3.ts');
  expect(result).toBe(`declare module "test" {
  export class SomeClass extends Component<{}> {
    constructor(props: {});
    render(): ReactChild;
  }

  export class Component<P, S> {
    /**
     * If set, \`this.context\` will be set at runtime to the current value of the given Context.
     * \n     * Usage:
     * \n     * \`\`\`ts
     * type MyContext = number
     * const Ctx = React.createContext<MyContext>(0)
     * \n     * class Foo extends React.Component {
     *    static contextType = Ctx
     *    context!: React.ContextType<typeof Ctx>
     *    render () {
     *      return <>My context's value: {this.context}</>;
     *    }
     * }
     * \`\`\`
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
     */
    context: any;
    constructor(props: Readonly<P>);
    constructor(props: P, context?: any);
    setState<K extends keyof S>(state: ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null) | (Pick<S, K> | S | null), callback?: () => void): void;
    forceUpdate(callback?: () => void): void;
    render(): ReactNode;
    readonly props: Readonly<P> & Readonly<{
      children?: ReactNode;
    }>;
    state: Readonly<S>;
    refs: {
      [key: string]: ReactInstance;
    };
  }

  export type ReactChild = ReactElement | ReactText;

  export interface Component<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> {}

  export interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
    displayName?: string;
  }

  export type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined;

  export type ReactInstance = Component<any> | Element;

  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  export type ReactText = string | number;

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

  export type ReactFragment = {} | ReactNodeArray;

  export interface ReactPortal extends ReactElement {
    key: Key | null;
    children: ReactNode;
  }

  export type Key = string | number;

  export type JSXElementConstructor<P> = ((props: P) => ReactElement | null) | (new (props: P) => Component<P, any>);

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
    (props: P): ReactElement | null;
    readonly $$typeof: symbol;
  }

  export interface ConsumerProps<T> {
    children(value: T): ReactNode;
    unstable_observedBits?: number;
  }

  export interface ReactNodeArray extends Array<ReactNode> {}

  export type WeakValidationMap<T> = {
    [K in keyof T]?: null extends T[K] ? Validator<T[K] | null | undefined> : undefined extends T[K] ? Validator<T[K] | null | undefined> : Validator<T[K]>;
  };

  export interface Validator<T> {
    (props: {
      [key: string]: any;
    }, propName: string, componentName: string, location: string, propFullName: string): Error | null;
    "[nominalTypeHack]"?: {
      type: T;
    };
  }
}`);
});

test('does include null in an union', () => {
  const result = runTestFor('null1.ts');
  expect(result).toBe(`declare module "test" {
  export type Foo = "foo" | null;
}`);
});

test('does include an union prop in an interface', () => {
  const result = runTestFor('null2.ts');
  expect(result).toBe(`declare module "test" {
  export interface Foo {
    bar: "foo" | null;
    qxz(a: number): boolean | null;
  }
}`);
});
