interface DeprecatedLifecycle<P, S> {
  /**
   * Called immediately before mounting occurs, and before `Component#render`.
   * Avoid introducing any side-effects or subscriptions in this method.
   *
   * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
   * prevents this from being invoked.
   *
   * @deprecated 16.3, use componentDidMount or the constructor instead; will stop working in React 17
   * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state
   * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
   */
  componentWillMount?(): void;
  /**
   * Called immediately before mounting occurs, and before `Component#render`.
   * Avoid introducing any side-effects or subscriptions in this method.
   *
   * This method will not stop working in React 17.
   *
   * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
   * prevents this from being invoked.
   *
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
   * Calling `Component#setState` generally does not trigger this method.
   *
   * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
   * prevents this from being invoked.
   *
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
   * Calling `Component#setState` generally does not trigger this method.
   *
   * This method will not stop working in React 17.
   *
   * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
   * prevents this from being invoked.
   *
   * @deprecated 16.3, use static getDerivedStateFromProps instead
   * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
   * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
   */
  UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
  /**
   * Called immediately before rendering when new props or state is received. Not called for the initial render.
   *
   * Note: You cannot call `Component#setState` here.
   *
   * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
   * prevents this from being invoked.
   *
   * @deprecated 16.3, use getSnapshotBeforeUpdate instead; will stop working in React 17
   * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
   * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
   */
  componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
  /**
   * Called immediately before rendering when new props or state is received. Not called for the initial render.
   *
   * Note: You cannot call `Component#setState` here.
   *
   * This method will not stop working in React 17.
   *
   * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
   * prevents this from being invoked.
   *
   * @deprecated 16.3, use getSnapshotBeforeUpdate instead
   * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
   * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
   */
  UNSAFE_componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
}

interface NewLifecycle<P, S, SS> {
  /**
   * Runs before React applies the result of `render` to the document, and
   * returns an object to be given to componentDidUpdate. Useful for saving
   * things such as scroll position before `render` causes changes to it.
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

interface ErrorInfo {
  /**
   * Captures which component contained the exception, and its ancestors.
   */
  componentStack: string;
}

interface ComponentLifecycle<P, S, SS = any> extends NewLifecycle<P, S, SS>, DeprecatedLifecycle<P, S> {
  /**
   * Called immediately after a component is mounted. Setting state here will trigger re-rendering.
   */
  componentDidMount?(): void;
  /**
   * Called to determine whether the change in props and state should trigger a re-render.
   *
   * `Component` always returns true.
   * `PureComponent` implements a shallow comparison on props and state and returns true if any
   * props or states have changed.
   *
   * If false is returned, `Component#render`, `componentWillUpdate`
   * and `componentDidUpdate` will not be called.
   */
  shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
  /**
   * Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
   * cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.
   */
  componentWillUnmount?(): void;
  /**
   * Catches exceptions generated in descendant components. Unhandled exceptions will cause
   * the entire component tree to unmount.
   */
  componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
}

interface Component<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> {}

type Key = string | number;
type ReactText = string | number;
type ReactChild = ReactElement | ReactText;
interface ReactNodeArray extends Array<ReactNode> {}
type ReactFragment = {} | ReactNodeArray;

interface ReactPortal extends ReactElement {
  key: Key | null;
  children: ReactNode;
}

declare const nominalTypeHack: unique symbol;

interface Validator<T> {
  (
    props: { [key: string]: any },
    propName: string,
    componentName: string,
    location: string,
    propFullName: string,
  ): Error | null;
  [nominalTypeHack]?: {
    type: T;
  };
}

interface Requireable<T> extends Validator<T | undefined | null> {
  isRequired: Validator<NonNullable<T>>;
}

type ValidationMap<T> = { [K in keyof T]?: Validator<T[K]> };

type WeakValidationMap<T> = {
  [K in keyof T]?: null extends T[K]
    ? Validator<T[K] | null | undefined>
    : undefined extends T[K]
    ? Validator<T[K] | null | undefined>
    : Validator<T[K]>;
};

type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined;

type JSXElementConstructor<P> = ((props: P) => ReactElement | null) | (new (props: P) => Component<P, any>);

interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
  type: T;
  props: P;
  key: Key | null;
}

interface ConsumerProps<T> {
  children: (value: T) => ReactNode;
  unstable_observedBits?: number;
}

interface ProviderProps<T> {
  value: T;
  children?: ReactNode;
}

interface ExoticComponent<P = {}> {
  /**
   * **NOTE**: Exotic components are not callable.
   */
  (props: P): ReactElement | null;
  readonly $$typeof: symbol;
}

interface ProviderExoticComponent<P> extends ExoticComponent<P> {
  propTypes?: WeakValidationMap<P>;
}

type Provider<T> = ProviderExoticComponent<ProviderProps<T>>;
type Consumer<T> = ExoticComponent<ConsumerProps<T>>;
interface Context<T> {
  Provider: Provider<T>;
  Consumer: Consumer<T>;
  displayName?: string;
}

declare class Component<P, S> {
  // tslint won't let me format the sample code in a way that vscode likes it :(
  /**
   * If set, `this.context` will be set at runtime to the current value of the given Context.
   *
   * Usage:
   *
   * ```ts
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
   * ```
   *
   * @see https://reactjs.org/docs/context.html#classcontexttype
   */
  static contextType?: Context<any>;

  /**
   * If using the new style context, re-declare this in your class to be the
   * `React.ContextType` of your `static contextType`.
   * Should be used with type annotation or static contextType.
   *
   * ```ts
   * static contextType = MyContext
   * // For TS pre-3.7:
   * context!: React.ContextType<typeof MyContext>
   * // For TS 3.7 and above:
   * declare context: React.ContextType<typeof MyContext>
   * ```
   *
   * @see https://reactjs.org/docs/context.html
   */
  // TODO (TypeScript 3.0): unknown
  context: any;

  constructor(props: Readonly<P>);
  /**
   * @deprecated
   * @see https://reactjs.org/docs/legacy-context.html
   */
  constructor(props: P, context?: any);

  // We MUST keep setState() as a unified signature because it allows proper checking of the method return type.
  // See: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/18365#issuecomment-351013257
  // Also, the ` | S` allows intellisense to not be dumbisense
  setState<K extends keyof S>(
    state: ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null) | (Pick<S, K> | S | null),
    callback?: () => void,
  ): void;

  forceUpdate(callback?: () => void): void;
  render(): ReactNode;

  // React.Props<T> is now deprecated, which means that the `children`
  // property is not available on `P` by default, even though you can
  // always pass children as variadic arguments to `createElement`.
  // In the future, if we can define its call signature conditionally
  // on the existence of `children` in `P`, then we should remove this.
  readonly props: Readonly<P> & Readonly<{ children?: ReactNode }>;
  state: Readonly<S>;
  /**
   * @deprecated
   * https://reactjs.org/docs/refs-and-the-dom.html#legacy-api-string-refs
   */
  refs: {
    [key: string]: ReactInstance;
  };
}

type ReactInstance = Component<any> | Element;

export declare class SomeClass extends Component<{}> {
  public constructor(props: {});

  public render(): ReactChild;
}
