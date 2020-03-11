import { runTestFor, getPiralCoreApi } from './helper';

test('should handle simple declaration merging (piral-core)', () => {
  const result = runTestFor('deox.ts', {
    imports: ['react', 'react-router', '@libre/atom'],
    types: [],
    apis: [getPiralCoreApi()],
  });
  expect(result).toBe(`import * as React from 'react';
import * as ReactRouter from 'react-router';

declare module "test" {
  /**
   * Defines the API accessible from pilets.
   */
  export interface PiletApi extends PiletCustomApi, PiletCoreApi, EventEmitter {
    /**
     * Gets the metadata of the current pilet.
     */
    meta: PiletMetadata;
  }

  /**
   * Custom Pilet API parts defined outside of piral-core.
   */
  export interface PiletCustomApi {}

  /**
   * Defines the Pilet API from piral-core.
   */
  export interface PiletCoreApi {
    /**
     * Gets a shared data value.
     */
    getData<TKey extends string>(name: TKey): any;
    /**
     * Sets the data using a given name. The name needs to be used exclusively by the current pilet.
     * Using the name occupied by another pilet will result in no change.
     */
    setData<TKey extends string>(name: TKey, value: any, options?: DataStoreOptions): boolean;
    /**
     * Registers a route for predefined page component.
     * The route needs to be unique and can contain params.
     * Params are following the path-to-regexp notation, e.g., :id for an id parameter.
     */
    registerPage(route: string, Component: AnyComponent<PageComponentProps>): void;
    /**
     * Unregisters the page identified by the given route.
     */
    unregisterPage(route: string): void;
    /**
     * Registers an extension component with a predefined extension component.
     * The name must refer to the extension slot.
     */
    registerExtension<T>(name: string, Component: AnyComponent<ExtensionComponentProps<T>>, defaults?: T): void;
    /**
     * Unregisters a global extension component.
     * Only previously registered extension components can be unregistered.
     */
    unregisterExtension<T>(name: string, Component: AnyComponent<ExtensionComponentProps<T>>): void;
    /**
     * React component for displaying extensions for a given name.
     */
    Extension: React.ComponentType<ExtensionSlotProps>;
    /**
     * Renders an extension in a plain DOM component.
     */
    renderHtmlExtension<T = any>(element: HTMLElement | ShadowRoot, props: ExtensionSlotProps<T>): void;
  }

  export type DataStoreOptions = "memory" | "local" | "remote" | CustomDataStoreOptions;

  export interface CustomDataStoreOptions {
    /**
     * The target data store. By default the data is only stored in memory.
     */
    target?: DataStoreTarget;
    /**
     * Optionally determines when the data expires.
     */
    expires?: number | "never" | Date;
  }

  export type DataStoreTarget = "memory" | "local" | "remote";

  export type AnyComponent<T> = React.ComponentClass<T> | React.FunctionComponent<T> | HtmlComponent<T>;

  export interface HtmlComponent<TProps> {
    /**
     * Renders a component into the provided element using the given props and context.
     */
    component: ForeignComponent<TProps>;
    /**
     * The type of the HTML component.
     */
    type: "html";
  }

  export interface ForeignComponent<TProps> {
    /**
     * Called when the component is mounted.
     */
    mount(element: HTMLElement, props: TProps, ctx: ComponentContext): void;
    /**
     * Called when the component should be updated.
     */
    update?(element: HTMLElement, props: TProps, ctx: ComponentContext): void;
    /**
     * Called when a component is unmounted.
     */
    unmount?(element: HTMLElement): void;
  }

  export interface ComponentContext {
    router: ReactRouter.RouteComponentProps;
  }

  export interface PageComponentProps<T = any, S = any> extends RouteBaseProps<T, S> {}

  export interface RouteBaseProps<UrlParams = any, UrlState = any> extends ReactRouter.RouteComponentProps<UrlParams, {}, UrlState>, BaseComponentProps {}

  export interface BaseComponentProps {
    /**
     * The currently used pilet API.
     */
    piral: PiletApi;
  }

  export interface ExtensionComponentProps<T = Record<string, any>> extends BaseComponentProps {
    /**
     * The provided parameters for showing the extension.
     */
    params: T;
  }

  /**
   * Props for defining an extension slot.
   */
  export interface ExtensionSlotProps<T = any> {
    /**
     * Defines what should be rendered when no components are available
     * for the specified extension.
     */
    empty?(): React.ReactNode;
    /**
     * Defines how the provided nodes should be rendered.
     */
    render?(nodes: Array<React.ReactNode>): React.ReactElement<any, any>;
    /**
     * The custom parameters for the given extension.
     */
    params?: T;
    /**
     * The name of the extension to render.
     */
    name: string;
  }

  export interface EventEmitter {
    /**
     * Attaches a new event listener.
     */
    on<K extends keyof PiralEventMap>(type: K, callback: Listener<PiralEventMap[K]>): EventEmitter;
    /**
     * Detaches an existing event listener.
     */
    off<K extends keyof PiralEventMap>(type: K, callback: Listener<PiralEventMap[K]>): EventEmitter;
    /**
     * Emits a new event with the given type.
     */
    emit<K extends keyof PiralEventMap>(type: K, arg: PiralEventMap[K]): EventEmitter;
  }

  export interface PiralEventMap extends PiralCustomEventMap {
    "store-data": PiralStoreDataEvent;
    [custom: string]: any;
  }

  /**
   * Custom events defined outside of piral-core.
   */
  export interface PiralCustomEventMap {}

  export interface PiralStoreDataEvent {
    /**
     * The name of the item that was stored.
     */
    name: string;
    /**
     * The storage target of the item.
     */
    target: string;
    /**
     * The value that was stored.
     */
    value: any;
    /**
     * The owner of the item.
     */
    owner: string;
    /**
     * The expiration of the item.
     */
    expires: number;
  }

  export interface Listener<T> {
    (arg: T): void;
  }

  export interface PiletMetadata {
    /**
     * The name of the pilet, i.e., the package id.
     */
    name: string;
    /**
     * The version of the pilet. Should be semantically versioned.
     */
    version: string;
    /**
     * The content of the pilet. If the content is not available
     * the link will be used (unless caching has been activated).
     */
    content?: string;
    /**
     * The link for retrieving the content of the pilet.
     */
    link?: string;
    /**
     * The computed hash value of the pilet's content. Should be
     * accurate to allow caching.
     */
    hash: string;
    /**
     * If available indicates that the pilet should not be cached.
     * In case of a string this is interpreted as the expiration time
     * of the cache. In case of an accurate hash this should not be
     * required or set.
     */
    noCache?: string | false | true;
    /**
     * Optionally provides some custom metadata for the pilet.
     */
    custom?: any;
  }
}`);
});
