import { runTestFor } from './helper';

test('should handle manual composition of react typings', () => {
  const result = runTestFor('react3.ts');
  expect(result).toBe(`declare module "test" {
  export class SomeClass extends Component {
    constructor(props: {});
    render(): ReactChild;
  }

  export class Component<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> {
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
    setState<K extends keyof S>(state: {
      (prevState: Readonly<S>, props: Readonly<P>): S | Pick<S, K>;
    } | S | Pick<S, K>, callback?: Component): void;
    forceUpdate(callback?: Component): void;
    render(): ReactNode;
    props: Readonly<P> & Readonly<{
      children?: ReactNode;
    }>;
    state: Readonly<S>;
    refs: {
      [index: string]: ReactInstance;
    };
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
    static contextType?: Context<any>;
  }

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

  export interface NewLifecycle<P, S, SS> {
    /**
     * Runs before React applies the result of \`render\` to the document, and
     * returns an object to be given to componentDidUpdate. Useful for saving
     * things such as scroll position before \`render\` causes changes to it.
     * \n     * Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
     * lifecycle events from running.
     */
    getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS;
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

  export type ReactNode = string | number | false | true | {} | ReactElement | ReactNodeArray | ReactPortal;

  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: ReactText | null;
  }

  export type ReactText = string | number;

  export type JSXElementConstructor<P> = ((props: P) => ReactElement | null) | (new (props: P) => Component<P, any>);

  export interface ReactNodeArray extends Array<ReactNode> {}

  export interface ReactPortal extends ReactElement {
    key: ReactText | null;
    children: ReactNode;
  }

  export type ReactInstance = Component<any> | Element;

  export interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
    displayName?: string;
  }

  export type Provider<T> = ProviderExoticComponent<ProviderProps<T>>;

  export interface ProviderProps<T> {
    value: T;
    children?: ReactNode;
  }

  export type Consumer<T> = ExoticComponent<ConsumerProps<T>>;

  export interface ConsumerProps<T> {
    children(value: T): ReactNode;
    unstable_observedBits?: number;
  }

  export type ReactChild = string | number | ReactElement;
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
