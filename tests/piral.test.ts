import { test, expect } from 'vitest';
import { runTestFor, getPiralBaseApi, getPiralCoreTypes } from './helper';

test('should handle simple declaration merging (piral-core)', async () => {
  const result = await runTestFor('deox.ts', {
    imports: ['react', 'react-router', '@libre/atom'],
    types: [getPiralCoreTypes()],
    apis: [getPiralBaseApi()],
  });
  expect(result).toBe(`import * as React from 'react';
import * as ReactRouter from 'react-router';
import * as LibreAtom from '@libre/atom';

declare module "test" {
  /**
   * Defines the API accessible from pilets.
   */
  export interface PiletApi extends EventEmitter, PiletCustomApi, PiletCoreApi {
    /**
     * Gets the metadata of the current pilet.
     */
    meta: PiletMetadata;
  }

  /**
   * The emitter for Piral app shell events.
   */
  export interface EventEmitter {
    /**
     * Attaches a new event listener.
     * @param type The type of the event to listen for.
     * @param callback The callback to trigger.
     */
    on<K extends keyof PiralEventMap>(type: K, callback: Listener<PiralEventMap[K]>): EventEmitter;
    /**
     * Detaches an existing event listener.
     * @param type The type of the event to listen for.
     * @param callback The callback to trigger.
     */
    off<K extends keyof PiralEventMap>(type: K, callback: Listener<PiralEventMap[K]>): EventEmitter;
    /**
     * Emits a new event with the given type.
     * @param type The type of the event to emit.
     * @param arg The payload of the event.
     */
    emit<K extends keyof PiralEventMap>(type: K, arg: PiralEventMap[K]): EventEmitter;
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
     * @param name The name of the data to retrieve.
     */
    getData<TKey extends string>(name: TKey): SharedData[TKey];
    /**
     * Sets the data using a given name. The name needs to be used exclusively by the current pilet.
     * Using the name occupied by another pilet will result in no change.
     * @param name The name of the data to store.
     * @param value The value of the data to store.
     * @param options The optional configuration for storing this piece of data.
     * @returns True if the data could be set, otherwise false.
     */
    setData<TKey extends string>(name: TKey, value: SharedData[TKey], options?: DataStoreOptions): boolean;
    /**
     * Registers a route for predefined page component.
     * The route needs to be unique and can contain params.
     * Params are following the path-to-regexp notation, e.g., :id for an id parameter.
     * @param route The route to register.
     * @param Component The component to render the page.
     * @param meta The optional metadata to use.
     */
    registerPage(route: string, Component: AnyComponent<PageComponentProps>, meta?: PiralPageMeta): void;
    /**
     * Unregisters the page identified by the given route.
     * @param route The route that was previously registered.
     */
    unregisterPage(route: string): void;
    /**
     * Registers an extension component with a predefined extension component.
     * The name must refer to the extension slot.
     * @param name The global name of the extension slot.
     * @param Component The component to be rendered.
     * @param defaults Optionally, sets the default values for the expected data.
     */
    registerExtension<TName>(name: TName extends string ? TName : string, Component: AnyComponent<ExtensionComponentProps<TName>>, defaults?: TName): void;
    /**
     * Unregisters a global extension component.
     * Only previously registered extension components can be unregistered.
     * @param name The name of the extension slot to unregister from.
     * @param Component The registered extension component to unregister.
     */
    unregisterExtension<TName>(name: TName extends string ? TName : string, Component: AnyComponent<ExtensionComponentProps<TName>>): void;
    /**
     * React component for displaying extensions for a given name.
     * @param props The extension's rendering props.
     * @return The created React element.
     */
    Extension<TName>(props: ExtensionSlotProps<TName>): React.ReactElement | null;
    /**
     * Renders an extension in a plain DOM component.
     * @param element The DOM element or shadow root as a container for rendering the extension.
     * @param props The extension's rendering props.
     */
    renderHtmlExtension<TName>(element: HTMLElement | ShadowRoot, props: ExtensionSlotProps<TName>): void;
  }

  /**
   * Describes the metadata transported by a pilet.
   */
  export type PiletMetadata = PiletMetadataV0 | PiletMetadataV1;

  /**
   * An evaluated pilet, i.e., a full pilet: functionality and metadata.
   */
  export type Pilet = PiletApp & PiletMetadata;

  /**
   * Describes the metadata transported by a pilet.
   */
  export type PiletMetadata = PiletMetadataV0 | PiletMetadataV1;

  export interface BaseComponentProps {
    /**
     * The currently used pilet API.
     */
    piral: PiletApi;
  }

  export interface ExtensionComponentProps<T> extends BaseComponentProps {
    /**
     * The provided parameters for showing the extension.
     */
    params: T extends keyof PiralExtensionSlotMap ? PiralExtensionSlotMap[T] : T extends string ? any : T;
  }

  export interface RouteBaseProps<UrlParams = any, UrlState = any> extends ReactRouter.RouteComponentProps<UrlParams, {}, UrlState>, BaseComponentProps {}

  export interface PageComponentProps<T = any, S = any> extends RouteBaseProps<T, S> {}

  export interface PiralPageMeta extends PiralCustomPageMeta {}

  export interface PiletsBag {
    [name: string]: PiletApi;
  }

  export type ValuesOf<T> = T extends {
    [_ in keyof T]: infer U;
  } ? U : never;

  export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

  export type RemainingArgs<T> = T extends (_: any, ...args: infer U) => any ? U : never;

  export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<DeepPartial<U>> : T[P] extends {} ? DeepPartial<T[P]> : T[P];
  };

  export type NestedPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<Partial<U>> : T[P] extends {} ? Partial<T[P]> : T[P];
  };

  export type Dict<T> = Record<string, T>;

  export type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

  export type FirstParameter<T extends (arg: any) => any> = T extends (arg: infer P) => any ? P : never;

  export type FirstParametersOf<T> = {
    [K in keyof T]: T[K] extends (arg: any) => any ? FirstParameter<T[K]> : never;
  }[keyof T];

  export type UnionOf<T> = {
    [K in keyof T]: T[K];
  }[keyof T];

  export type MaybeAsync<T> = T | (() => Promise<T>);

  export interface ComponentConverters<TProps> extends PiralCustomComponentConverters<TProps> {
    html(component: HtmlComponent<TProps>): ForeignComponent<TProps>;
  }

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

  export interface ComponentContext {
    router: ReactRouter.RouteComponentProps;
    state: LibreAtom.Atom<GlobalState>;
  }

  export interface ForeignComponent<TProps> {
    /**
     * Called when the component is mounted.
     * @param element The container hosting the element.
     * @param props The props to transport.
     * @param ctx The associated context.
     */
    mount(element: HTMLElement, props: TProps, ctx: ComponentContext): void;
    /**
     * Called when the component should be updated.
     * @param element The container hosting the element.
     * @param props The props to transport.
     * @param ctx The associated context.
     */
    update?(element: HTMLElement, props: TProps, ctx: ComponentContext): void;
    /**
     * Called when a component is unmounted.
     * @param element The container that was hosting the element.
     */
    unmount?(element: HTMLElement): void;
  }

  export type AnyComponent<T> = React.ComponentType<T> | FirstParametersOf<ComponentConverters<T>>;

  /**
   * The error used when a route cannot be resolved.
   */
  export interface NotFoundErrorInfoProps extends ReactRouter.RouteComponentProps {
    /**
     * The type of the error.
     */
    type: "not_found";
  }

  /**
   * The error used when a registered page component crashes.
   */
  export interface PageErrorInfoProps extends ReactRouter.RouteComponentProps {
    /**
     * The type of the error.
     */
    type: "page";
    /**
     * The provided error details.
     */
    error: any;
  }

  /**
   * The error used when the app could not be loaded.
   */
  export interface LoadingErrorInfoProps {
    /**
     * The type of the error.
     */
    type: "loading";
    /**
     * The provided error details.
     */
    error: any;
  }

  /**
   * The error used when a registered extension component crashed.
   */
  export interface ExtensionErrorInfoProps {
    /**
     * The type of the error.
     */
    type: "extension";
    /**
     * The provided error details.
     */
    error: any;
  }

  /**
   * The error used when the exact type is unknown.
   */
  export interface UnknownErrorInfoProps {
    /**
     * The type of the error.
     */
    type: "unknown";
    /**
     * The provided error details.
     */
    error: any;
  }

  export interface Errors extends PiralCustomErrors {
    extension: ExtensionErrorInfoProps;
    loading: LoadingErrorInfoProps;
    page: PageErrorInfoProps;
    not_found: NotFoundErrorInfoProps;
    unknown: UnknownErrorInfoProps;
  }

  export type ErrorInfoProps = UnionOf<Errors>;

  export interface LoadingIndicatorProps {}

  export interface LayoutProps {
    currentLayout: LayoutType;
  }

  export interface RouterProps {}

  /**
   * The strategy for loading pilets.
   */
  export interface PiletLoadingStrategy {
    (options: LoadPiletsOptions, pilets: PiletsLoaded): PromiseLike<void>;
  }

  /**
   * The callback to fetch a JS content from an URL.
   */
  export interface PiletDependencyFetcher {
    /**
     * Defines how other dependencies are fetched.
     * @param url The URL to the dependency that should be fetched.
     * @returns The promise yielding the dependency's content.
     */
    (url: string): Promise<string>;
  }

  /**
   * The callback to get the shared dependencies for a specific pilet.
   */
  export interface PiletDependencyGetter {
    /**
     * Gets the locally available dependencies for the specified
     * pilet. If this function is missing or returns false or undefined
     * the globally available dependencies will be used.
     * @returns The dependencies that should be used for evaluating the
     * pilet.
     */
    (target: PiletMetadata): AvailableDependencies | undefined | false;
  }

  /**
   * The interface describing a function capable of fetching pilets.
   */
  export interface PiletRequester {
    /**
     * Gets the raw pilets (e.g., from a server) asynchronously.
     */
    (): Promise<Array<PiletMetadata>>;
  }

  /**
   * The record containing all available dependencies.
   */
  export interface AvailableDependencies {
    [name: string]: any;
  }

  export interface PiralPiletConfiguration {
    /**
     * The callback for defining how a dependency will be fetched.
     */
    fetchDependency?: PiletDependencyFetcher;
    /**
     * Function to get the dependencies for a given module.
     */
    getDependencies?: PiletDependencyGetter;
    /**
     * Function to load the modules asynchronously, e.g., from a server 🚚.
     */
    requestPilets?: PiletRequester;
    /**
     * Function to define how to load a pilet given its metadata.
     */
    loadPilet?: PiletLoader;
    /**
     * Determines that pilets are loaded asynchronously, essentially showing the
     * app right away without waiting for the pilets to load and evaluate.
     */
    async?: boolean | PiletLoadingStrategy;
    /**
     * Determines the modules, which are available already from the start 🚀.
     * The given modules are all already evaluated.
     * This can be used for customization or for debugging purposes.
     */
    availablePilets?: Array<Pilet>;
    /**
     * Optionally provides a function to extend the API creator with some additional
     * functionality.
     */
    extendApi?: Extend | Array<Extend>;
  }

  export interface PiralStateConfiguration {
    /**
     * Optionally, sets up the initial state of the application 📦.
     */
    state?: NestedPartial<GlobalState>;
    /**
     * Optionally, sets up some initial custom actions ⚡️.
     */
    actions?: PiralDefineActions;
  }

  export type PiralConfiguration = PiralPiletConfiguration & PiralStateConfiguration;

  /**
   * Custom meta data to include for pages.
   */
  export interface PiralCustomPageMeta {}

  /**
   * Custom state extensions defined outside of piral-core.
   */
  export interface PiralCustomState {}

  /**
   * Custom errors defined outside of piral-core.
   */
  export interface PiralCustomErrors {}

  /**
   * Custom actions defined outside of piral-core.
   */
  export interface PiralCustomActions {}

  /**
   * Custom events defined outside of piral-core.
   */
  export interface PiralCustomEventMap {}

  /**
   * Custom extension slots outside of piral-core.
   */
  export interface PiralCustomExtensionSlotMap {}

  /**
   * Custom parts of the global registry state defined outside of piral-core.
   */
  export interface PiralCustomRegistryState {}

  /**
   * Custom component converters defined outside of piral-core.
   */
  export interface PiralCustomComponentConverters<TProps> {}

  /**
   * Custom parts of the global custom component state defined outside of piral-core.
   */
  export interface PiralCustomComponentsState {}

  export interface SharedData<TValue = any> {
    [key: string]: TValue;
  }

  export type DataStoreTarget = "memory" | "local" | "remote";

  export interface CustomDataStoreOptions {
    /**
     * The target data store. By default the data is only stored in memory.
     */
    target?: DataStoreTarget;
    /**
     * Optionally determines when the data expires.
     */
    expires?: "never" | Date | number;
  }

  export type DataStoreOptions = DataStoreTarget | CustomDataStoreOptions;

  export interface SharedDataItem<TValue = any> {
    /**
     * Gets the associated value.
     */
    value: TValue;
    /**
     * Gets the owner of the item.
     */
    owner: string;
    /**
     * Gets the storage location.
     */
    target: DataStoreTarget;
    /**
     * Gets the expiration of the item.
     */
    expires: number;
  }

  export interface PiralExtensionSlotMap extends PiralCustomExtensionSlotMap {}

  export interface BaseExtensionSlotProps<TName, TParams> {
    /**
     * Defines what should be rendered when no components are available
     * for the specified extension.
     */
    empty?(): React.ReactNode;
    /**
     * Defines how the provided nodes should be rendered.
     * @param nodes The rendered extension nodes.
     */
    render?(nodes: Array<React.ReactNode>): React.ReactElement<any, any> | null;
    /**
     * The custom parameters for the given extension.
     */
    params?: TParams;
    /**
     * The name of the extension to render.
     */
    name: TName;
  }

  /**
   * Props for defining an extension slot.
   */
  export type ExtensionSlotProps<K = string> = BaseExtensionSlotProps<K extends string ? K : string, K extends keyof PiralExtensionSlotMap ? PiralExtensionSlotMap[K] : K extends string ? any : K>;

  export interface PortalProps {
    instance?: PiralInstance;
    breakpoints?: LayoutBreakpoints;
  }

  /**
   * The PiralInstance component, which is an event emitter containing the React
   * functional component as well as some other utilities and helpers.
   */
  export interface PiralInstance extends EventEmitter {
    context: GlobalStateContext;
    createApi: PiletApiCreator;
    options: LoadPiletsOptions;
    root: PiletApi;
  }

  export type LayoutBreakpoints = [string, string, string];

  export type LayoutType = "mobile" | "tablet" | "desktop";

  export type LayoutTypes = [LayoutType, LayoutType, LayoutType];

  export interface ApiExtender<T> {
    /**
     * Extends the base API of a module with new functionality.
     * @param api The API created by the base layer.
     * @param target The target the API is created for.
     * @returns The extended API.
     */
    (api: PiletApi, target: PiletMetadata): T;
  }

  export interface Extend<T = Partial<PiletApi>> {
    /**
     * Extends the base API with a custom set of functionality to be used by modules.
     * @param context The global state context to be used.
     * @returns The extended API or a function to create the extended API for a specific target.
     */
    (context: GlobalStateContext): T | ApiExtender<T>;
  }

  export interface StateDispatcher<TState> {
    (state: TState): Partial<TState>;
  }

  export type WrappedComponent<TProps> = React.ComponentType<Without<TProps, keyof BaseComponentProps>>;

  export interface BaseRegistration {
    pilet: string;
  }

  export interface PageRegistration extends BaseRegistration {
    component: WrappedComponent<PageComponentProps>;
    meta: PiralPageMeta;
  }

  export interface ExtensionRegistration extends BaseRegistration {
    component: WrappedComponent<ExtensionComponentProps<string>>;
    reference: any;
    defaults: any;
  }

  /**
   * The Piral global app sub-state container for shared components.
   */
  export interface ComponentsState extends PiralCustomComponentsState {
    /**
     * The loading indicator renderer.
     */
    LoadingIndicator: React.ComponentType<LoadingIndicatorProps>;
    /**
     * The error renderer.
     */
    ErrorInfo: React.ComponentType<ErrorInfoProps>;
    /**
     * The router context.
     */
    Router: React.ComponentType<RouterProps>;
    /**
     * The layout used for pages.
     */
    Layout: React.ComponentType<LayoutProps>;
    /**
     * A component that can be used for debugging purposes.
     */
    Debug?: React.ComponentType;
  }

  /**
   * The Piral global app sub-state container for app information.
   */
  export interface AppState {
    /**
     * Information for the layout computation.
     */
    layout: LayoutType;
    /**
     * Gets if the application is currently performing a background loading
     * activity, e.g., for loading modules asynchronously or fetching
     * translations.
     */
    loading: boolean;
    /**
     * Gets an unrecoverable application error, if any.
     */
    error: Error | undefined;
  }

  /**
   * The Piral global app sub-state container for component registrations.
   */
  export interface RegistryState extends PiralCustomRegistryState {
    /**
     * The registered page components for the router.
     */
    pages: Dict<PageRegistration>;
    /**
     * The registered extension components for extension slots.
     */
    extensions: Dict<Array<ExtensionRegistration>>;
  }

  export type ErrorComponentsState = {
    [P in keyof Errors]?: React.ComponentType<Errors[P]>;
  };

  /**
   * The Piral global app state container.
   */
  export interface GlobalState extends PiralCustomState {
    /**
     * The relevant state for the app itself.
     */
    app: AppState;
    /**
     * The relevant state for rendering errors of the app.
     */
    errorComponents: ErrorComponentsState;
    /**
     * The relevant state for rendering parts of the app.
     */
    components: ComponentsState;
    /**
     * The relevant state for the registered components.
     */
    registry: RegistryState;
    /**
     * Gets the loaded modules.
     */
    modules: Array<PiletMetadata>;
    /**
     * The foreign component portals to render.
     */
    portals: Record<string, Array<React.ReactPortal>>;
    /**
     * The application's shared data.
     */
    data: Dict<SharedDataItem>;
    /**
     * The used (exact) application routes.
     */
    routes: Dict<React.ComponentType<ReactRouter.RouteComponentProps<any>>>;
    /**
     * The current provider.
     */
    provider?: React.ComponentType;
  }

  /**
   * The shape of an app action in Piral.
   */
  export interface PiralAction<T extends (...args: any) => any> {
    (ctx: GlobalStateContext, ...args: Parameters<T>): ReturnType<T>;
  }

  /**
   * A subset of the available app actions in Piral.
   */
  export type PiralDefineActions = Partial<{
    [P in keyof PiralActions]: PiralAction<PiralActions[P]>;
  }>;

  /**
   * The globally defined actions.
   */
  export interface PiralActions extends PiralCustomActions {
    /**
     * Initializes the application shell.
     * @param loading The current loading state.
     * @param error The application error, if any.
     * @param modules The loaded pilets.
     */
    initialize(loading: boolean, error: Error | undefined, modules: Array<Pilet>): void;
    /**
     * Injects a pilet at runtime - removes the pilet from registry first if available.
     * @param pilet The pilet to be injected.
     */
    injectPilet(pilet: Pilet): void;
    /**
     * Defines a single action for Piral.
     * @param actionName The name of the action to define.
     * @param action The action to include.
     */
    defineAction<T extends keyof PiralActions>(actionName: T, action: PiralAction<PiralActions[T]>): void;
    /**
     * Defines a set of actions for Piral.
     * @param actions The actions to define.
     */
    defineActions(actions: PiralDefineActions): void;
    /**
     * Reads the value of a shared data item.
     * @param name The name of the shared item.
     */
    readDataValue(name: string): any;
    /**
     * Tries to write a shared data item. The write access is only
     * possible if the name belongs to the provided owner or has not
     * been taken yet.
     * Setting the value to null will release it.
     * @param name The name of the shared data item.
     * @param value The value of the shared data item.
     * @param owner The owner of the shared data item.
     * @param target The target storage locatation.
     * @param expiration The time for when to dispose the shared item.
     */
    tryWriteDataItem(name: string, value: any, owner: string, target: DataStoreTarget, expiration: number): boolean;
    /**
     * Performs a layout change.
     * @param current The layout to take.
     */
    changeLayout(current: LayoutType): void;
    /**
     * Registers a new route to be resolved.
     * @param route The route to register.
     * @param value The page to be rendered on the route.
     */
    registerPage(route: string, value: PageRegistration): void;
    /**
     * Unregisters an existing route.
     * @param route The route to be removed.
     */
    unregisterPage(route: string): void;
    /**
     * Registers a new extension.
     * @param name The name of the extension category.
     * @param value The extension registration.
     */
    registerExtension(name: string, value: ExtensionRegistration): void;
    /**
     * Unregisters an existing extension.
     * @param name The name of the extension category.
     * @param value The extension that will be removed.
     */
    unregisterExtension(name: string, reference: any): void;
    /**
     * Sets the common component to render.
     * @param name The name of the component.
     * @param component The component to use for rendering.
     */
    setComponent<TKey extends keyof ComponentsState>(name: TKey, component: ComponentsState[TKey]): void;
    /**
     * Sets the error component to render.
     * @param type The type of the error.
     * @param component The component to use for rendering.
     */
    setErrorComponent<TKey extends keyof ErrorComponentsState>(type: TKey, component: ErrorComponentsState[TKey]): void;
    /**
     * Sets the common routes to render.
     * @param path The name of the component.
     * @param component The component to use for rendering.
     */
    setRoute<T = {}>(path: string, component: React.ComponentType<ReactRouter.RouteComponentProps<T>>): void;
    /**
     * Includes a new provider as a sub-provider to the current provider.
     * @param provider The provider to include.
     */
    includeProvider(provider: JSX.Element): void;
    /**
     * Destroys (i.e., resets) the given portal instance.
     * @param id The id of the portal to destroy.
     */
    destroyPortal(id: string): void;
    /**
     * Includes the provided portal in the rendering pipeline.
     * @param id The id of the portal to use.
     * @param entry The child to render.
     */
    showPortal(id: string, entry: React.ReactPortal): void;
    /**
     * Dispatches a state change.
     * @param update The update function creating a new state.
     */
    dispatch(update: (state: GlobalState) => GlobalState): void;
    /**
     * Reads the selected part of the global state.
     * @param select The selector for getting the desired part.
     * @returns The desired part.
     */
    readState<S>(select: (state: GlobalState) => S): S;
  }

  /**
   * The Piral app instance context.
   */
  export interface GlobalStateContext extends PiralActions, EventEmitter {
    /**
     * The global state context atom.
     * Changes to the state should always be dispatched via the \`dispatch\` action.
     */
    state: LibreAtom.Atom<GlobalState>;
    /**
     * The API objects created for the loaded pilets.
     */
    apis: PiletsBag;
    /**
     * The available component converters.
     */
    converters: ComponentConverters<any>;
  }

  export interface PiralStorage {
    /**
     * Sets the value of an item.
     * @param name The name of the item to set.
     * @param data The new value of the item.
     * @param expires Optional expiration information.
     */
    setItem(name: string, data: string, expires?: string): void;
    /**
     * Gets the value of an item.
     * @param name The name of the item to look for.
     */
    getItem(name: string): string | null;
    /**
     * Removes an item from the storage.
     * @param name The name of the item to remove.
     */
    removeItem(name: string): void;
  }

  export interface Disposable {
    /**
     * Disposes the created resource.
     */
    (): void;
  }

  export interface PiralStoreDataEvent<TValue = any> {
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
    value: TValue;
    /**
     * The owner of the item.
     */
    owner: string;
    /**
     * The expiration of the item.
     */
    expires: number;
  }

  export interface PiralUnloadPiletEvent {
    /**
     * The name of the pilet to be unloaded.
     */
    name: string;
  }

  /**
   * Listener for Piral app shell events.
   */
  export interface Listener<T> {
    /**
     * Receives an event of type T.
     */
    (arg: T): void;
  }

  /**
   * The map of known Piral app shell events.
   */
  export interface PiralEventMap extends PiralCustomEventMap {
    [custom: string]: any;
    "store-data": PiralStoreDataEvent;
    "unload-pilet": PiralUnloadPiletEvent;
  }

  export interface PiletMetadataV0 {
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
    noCache?: boolean | string;
    /**
     * Optionally provides some custom metadata for the pilet.
     */
    custom?: any;
  }

  export interface PiletMetadataV1 {
    /**
     * The name of the pilet, i.e., the package id.
     */
    name: string;
    /**
     * The version of the pilet. Should be semantically versioned.
     */
    version: string;
    /**
     * The link for retrieving the content of the pilet.
     */
    link: string;
    /**
     * The reference name for the global require.
     */
    requireRef: string;
    /**
     * The computed integrity of the pilet. Will be used to set the
     * integrity value of the script.
     */
    integrity?: string;
    /**
     * Optionally provides some custom metadata for the pilet.
     */
    custom?: any;
  }

  /**
   * The pilet app, i.e., the functional exports.
   */
  export interface PiletApp {
    /**
     * Integrates the evaluated pilet into the application.
     * @param api The API to access the application.
     */
    setup(api: PiletApi): void | Promise<void>;
    /**
     * Optional function for cleanup.
     * @param api The API to access the application.
     */
    teardown?(api: PiletApi): void;
  }

  /**
   * The options for loading pilets.
   */
  export interface LoadPiletsOptions {
    /**
     * The callback function for creating an API object.
     * The API object is passed on to a specific pilet.
     */
    createApi: PiletApiCreator;
    /**
     * The callback for fetching the dynamic pilets.
     */
    fetchPilets: PiletRequester;
    /**
     * Optionally, some already existing evaluated pilets, e.g.,
     * helpful when debugging or in SSR scenarios.
     */
    pilets?: Array<Pilet>;
    /**
     * Optionally, defines how to load a pilet.
     */
    loadPilet?: PiletLoader;
    /**
     * The callback for defining how a dependency will be fetched.
     */
    fetchDependency?: PiletDependencyFetcher;
    /**
     * Gets a map of available locale dependencies for a pilet.
     * The dependencies are used during the evaluation.
     */
    getDependencies?: PiletDependencyGetter;
    /**
     * Gets the map of globally available dependencies with their names
     * as keys and their evaluated pilet content as value.
     */
    dependencies?: AvailableDependencies;
    /**
     * Optionally, defines the loading strategy to use.
     */
    strategy?: PiletLoadingStrategy;
  }

  /**
   * The callback to be used when pilets have been loaded.
   */
  export interface PiletsLoaded {
    (error: Error | undefined, pilets: Array<Pilet>): void;
  }

  /**
   * The callback to be used to load a single pilet.
   */
  export interface PiletLoader {
    (meta: PiletMetadata): Promise<Pilet>;
  }

  /**
   * The creator function for the pilet API.
   */
  export interface PiletApiCreator {
    /**
     * Creates an API for the given raw pilet.
     * @param target The raw (meta) content of the pilet.
     * @returns The API object to be used with the pilet.
     */
    (target: PiletMetadata): PiletApi;
  }
}`);
});

test('should handle simple declaration merging w/o module wrapper (piral-core)', async () => {
  const result = await runTestFor('deox.ts', {
    imports: ['react', 'react-router', '@libre/atom'],
    types: [getPiralCoreTypes()],
    apis: [getPiralBaseApi()],
    noModuleDeclaration: true,
  });
  expect(result).toBe(`import * as React from 'react';
import * as ReactRouter from 'react-router';
import * as LibreAtom from '@libre/atom';

/**
 * Defines the API accessible from pilets.
 */
export interface PiletApi extends EventEmitter, PiletCustomApi, PiletCoreApi {
  /**
   * Gets the metadata of the current pilet.
   */
  meta: PiletMetadata;
}

/**
 * The emitter for Piral app shell events.
 */
export interface EventEmitter {
  /**
   * Attaches a new event listener.
   * @param type The type of the event to listen for.
   * @param callback The callback to trigger.
   */
  on<K extends keyof PiralEventMap>(type: K, callback: Listener<PiralEventMap[K]>): EventEmitter;
  /**
   * Detaches an existing event listener.
   * @param type The type of the event to listen for.
   * @param callback The callback to trigger.
   */
  off<K extends keyof PiralEventMap>(type: K, callback: Listener<PiralEventMap[K]>): EventEmitter;
  /**
   * Emits a new event with the given type.
   * @param type The type of the event to emit.
   * @param arg The payload of the event.
   */
  emit<K extends keyof PiralEventMap>(type: K, arg: PiralEventMap[K]): EventEmitter;
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
   * @param name The name of the data to retrieve.
   */
  getData<TKey extends string>(name: TKey): SharedData[TKey];
  /**
   * Sets the data using a given name. The name needs to be used exclusively by the current pilet.
   * Using the name occupied by another pilet will result in no change.
   * @param name The name of the data to store.
   * @param value The value of the data to store.
   * @param options The optional configuration for storing this piece of data.
   * @returns True if the data could be set, otherwise false.
   */
  setData<TKey extends string>(name: TKey, value: SharedData[TKey], options?: DataStoreOptions): boolean;
  /**
   * Registers a route for predefined page component.
   * The route needs to be unique and can contain params.
   * Params are following the path-to-regexp notation, e.g., :id for an id parameter.
   * @param route The route to register.
   * @param Component The component to render the page.
   * @param meta The optional metadata to use.
   */
  registerPage(route: string, Component: AnyComponent<PageComponentProps>, meta?: PiralPageMeta): void;
  /**
   * Unregisters the page identified by the given route.
   * @param route The route that was previously registered.
   */
  unregisterPage(route: string): void;
  /**
   * Registers an extension component with a predefined extension component.
   * The name must refer to the extension slot.
   * @param name The global name of the extension slot.
   * @param Component The component to be rendered.
   * @param defaults Optionally, sets the default values for the expected data.
   */
  registerExtension<TName>(name: TName extends string ? TName : string, Component: AnyComponent<ExtensionComponentProps<TName>>, defaults?: TName): void;
  /**
   * Unregisters a global extension component.
   * Only previously registered extension components can be unregistered.
   * @param name The name of the extension slot to unregister from.
   * @param Component The registered extension component to unregister.
   */
  unregisterExtension<TName>(name: TName extends string ? TName : string, Component: AnyComponent<ExtensionComponentProps<TName>>): void;
  /**
   * React component for displaying extensions for a given name.
   * @param props The extension's rendering props.
   * @return The created React element.
   */
  Extension<TName>(props: ExtensionSlotProps<TName>): React.ReactElement | null;
  /**
   * Renders an extension in a plain DOM component.
   * @param element The DOM element or shadow root as a container for rendering the extension.
   * @param props The extension's rendering props.
   */
  renderHtmlExtension<TName>(element: HTMLElement | ShadowRoot, props: ExtensionSlotProps<TName>): void;
}

/**
 * Describes the metadata transported by a pilet.
 */
export type PiletMetadata = PiletMetadataV0 | PiletMetadataV1;

/**
 * An evaluated pilet, i.e., a full pilet: functionality and metadata.
 */
export type Pilet = PiletApp & PiletMetadata;

/**
 * Describes the metadata transported by a pilet.
 */
export type PiletMetadata = PiletMetadataV0 | PiletMetadataV1;

export interface BaseComponentProps {
  /**
   * The currently used pilet API.
   */
  piral: PiletApi;
}

export interface ExtensionComponentProps<T> extends BaseComponentProps {
  /**
   * The provided parameters for showing the extension.
   */
  params: T extends keyof PiralExtensionSlotMap ? PiralExtensionSlotMap[T] : T extends string ? any : T;
}

export interface RouteBaseProps<UrlParams = any, UrlState = any> extends ReactRouter.RouteComponentProps<UrlParams, {}, UrlState>, BaseComponentProps {}

export interface PageComponentProps<T = any, S = any> extends RouteBaseProps<T, S> {}

export interface PiralPageMeta extends PiralCustomPageMeta {}

export interface PiletsBag {
  [name: string]: PiletApi;
}

export type ValuesOf<T> = T extends {
  [_ in keyof T]: infer U;
} ? U : never;

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type RemainingArgs<T> = T extends (_: any, ...args: infer U) => any ? U : never;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U> ? Array<DeepPartial<U>> : T[P] extends {} ? DeepPartial<T[P]> : T[P];
};

export type NestedPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U> ? Array<Partial<U>> : T[P] extends {} ? Partial<T[P]> : T[P];
};

export type Dict<T> = Record<string, T>;

export type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

export type FirstParameter<T extends (arg: any) => any> = T extends (arg: infer P) => any ? P : never;

export type FirstParametersOf<T> = {
  [K in keyof T]: T[K] extends (arg: any) => any ? FirstParameter<T[K]> : never;
}[keyof T];

export type UnionOf<T> = {
  [K in keyof T]: T[K];
}[keyof T];

export type MaybeAsync<T> = T | (() => Promise<T>);

export interface ComponentConverters<TProps> extends PiralCustomComponentConverters<TProps> {
  html(component: HtmlComponent<TProps>): ForeignComponent<TProps>;
}

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

export interface ComponentContext {
  router: ReactRouter.RouteComponentProps;
  state: LibreAtom.Atom<GlobalState>;
}

export interface ForeignComponent<TProps> {
  /**
   * Called when the component is mounted.
   * @param element The container hosting the element.
   * @param props The props to transport.
   * @param ctx The associated context.
   */
  mount(element: HTMLElement, props: TProps, ctx: ComponentContext): void;
  /**
   * Called when the component should be updated.
   * @param element The container hosting the element.
   * @param props The props to transport.
   * @param ctx The associated context.
   */
  update?(element: HTMLElement, props: TProps, ctx: ComponentContext): void;
  /**
   * Called when a component is unmounted.
   * @param element The container that was hosting the element.
   */
  unmount?(element: HTMLElement): void;
}

export type AnyComponent<T> = React.ComponentType<T> | FirstParametersOf<ComponentConverters<T>>;

/**
 * The error used when a route cannot be resolved.
 */
export interface NotFoundErrorInfoProps extends ReactRouter.RouteComponentProps {
  /**
   * The type of the error.
   */
  type: "not_found";
}

/**
 * The error used when a registered page component crashes.
 */
export interface PageErrorInfoProps extends ReactRouter.RouteComponentProps {
  /**
   * The type of the error.
   */
  type: "page";
  /**
   * The provided error details.
   */
  error: any;
}

/**
 * The error used when the app could not be loaded.
 */
export interface LoadingErrorInfoProps {
  /**
   * The type of the error.
   */
  type: "loading";
  /**
   * The provided error details.
   */
  error: any;
}

/**
 * The error used when a registered extension component crashed.
 */
export interface ExtensionErrorInfoProps {
  /**
   * The type of the error.
   */
  type: "extension";
  /**
   * The provided error details.
   */
  error: any;
}

/**
 * The error used when the exact type is unknown.
 */
export interface UnknownErrorInfoProps {
  /**
   * The type of the error.
   */
  type: "unknown";
  /**
   * The provided error details.
   */
  error: any;
}

export interface Errors extends PiralCustomErrors {
  extension: ExtensionErrorInfoProps;
  loading: LoadingErrorInfoProps;
  page: PageErrorInfoProps;
  not_found: NotFoundErrorInfoProps;
  unknown: UnknownErrorInfoProps;
}

export type ErrorInfoProps = UnionOf<Errors>;

export interface LoadingIndicatorProps {}

export interface LayoutProps {
  currentLayout: LayoutType;
}

export interface RouterProps {}

/**
 * The strategy for loading pilets.
 */
export interface PiletLoadingStrategy {
  (options: LoadPiletsOptions, pilets: PiletsLoaded): PromiseLike<void>;
}

/**
 * The callback to fetch a JS content from an URL.
 */
export interface PiletDependencyFetcher {
  /**
   * Defines how other dependencies are fetched.
   * @param url The URL to the dependency that should be fetched.
   * @returns The promise yielding the dependency's content.
   */
  (url: string): Promise<string>;
}

/**
 * The callback to get the shared dependencies for a specific pilet.
 */
export interface PiletDependencyGetter {
  /**
   * Gets the locally available dependencies for the specified
   * pilet. If this function is missing or returns false or undefined
   * the globally available dependencies will be used.
   * @returns The dependencies that should be used for evaluating the
   * pilet.
   */
  (target: PiletMetadata): AvailableDependencies | undefined | false;
}

/**
 * The interface describing a function capable of fetching pilets.
 */
export interface PiletRequester {
  /**
   * Gets the raw pilets (e.g., from a server) asynchronously.
   */
  (): Promise<Array<PiletMetadata>>;
}

/**
 * The record containing all available dependencies.
 */
export interface AvailableDependencies {
  [name: string]: any;
}

export interface PiralPiletConfiguration {
  /**
   * The callback for defining how a dependency will be fetched.
   */
  fetchDependency?: PiletDependencyFetcher;
  /**
   * Function to get the dependencies for a given module.
   */
  getDependencies?: PiletDependencyGetter;
  /**
   * Function to load the modules asynchronously, e.g., from a server 🚚.
   */
  requestPilets?: PiletRequester;
  /**
   * Function to define how to load a pilet given its metadata.
   */
  loadPilet?: PiletLoader;
  /**
   * Determines that pilets are loaded asynchronously, essentially showing the
   * app right away without waiting for the pilets to load and evaluate.
   */
  async?: boolean | PiletLoadingStrategy;
  /**
   * Determines the modules, which are available already from the start 🚀.
   * The given modules are all already evaluated.
   * This can be used for customization or for debugging purposes.
   */
  availablePilets?: Array<Pilet>;
  /**
   * Optionally provides a function to extend the API creator with some additional
   * functionality.
   */
  extendApi?: Extend | Array<Extend>;
}

export interface PiralStateConfiguration {
  /**
   * Optionally, sets up the initial state of the application 📦.
   */
  state?: NestedPartial<GlobalState>;
  /**
   * Optionally, sets up some initial custom actions ⚡️.
   */
  actions?: PiralDefineActions;
}

export type PiralConfiguration = PiralPiletConfiguration & PiralStateConfiguration;

/**
 * Custom meta data to include for pages.
 */
export interface PiralCustomPageMeta {}

/**
 * Custom state extensions defined outside of piral-core.
 */
export interface PiralCustomState {}

/**
 * Custom errors defined outside of piral-core.
 */
export interface PiralCustomErrors {}

/**
 * Custom actions defined outside of piral-core.
 */
export interface PiralCustomActions {}

/**
 * Custom events defined outside of piral-core.
 */
export interface PiralCustomEventMap {}

/**
 * Custom extension slots outside of piral-core.
 */
export interface PiralCustomExtensionSlotMap {}

/**
 * Custom parts of the global registry state defined outside of piral-core.
 */
export interface PiralCustomRegistryState {}

/**
 * Custom component converters defined outside of piral-core.
 */
export interface PiralCustomComponentConverters<TProps> {}

/**
 * Custom parts of the global custom component state defined outside of piral-core.
 */
export interface PiralCustomComponentsState {}

export interface SharedData<TValue = any> {
  [key: string]: TValue;
}

export type DataStoreTarget = "memory" | "local" | "remote";

export interface CustomDataStoreOptions {
  /**
   * The target data store. By default the data is only stored in memory.
   */
  target?: DataStoreTarget;
  /**
   * Optionally determines when the data expires.
   */
  expires?: "never" | Date | number;
}

export type DataStoreOptions = DataStoreTarget | CustomDataStoreOptions;

export interface SharedDataItem<TValue = any> {
  /**
   * Gets the associated value.
   */
  value: TValue;
  /**
   * Gets the owner of the item.
   */
  owner: string;
  /**
   * Gets the storage location.
   */
  target: DataStoreTarget;
  /**
   * Gets the expiration of the item.
   */
  expires: number;
}

export interface PiralExtensionSlotMap extends PiralCustomExtensionSlotMap {}

export interface BaseExtensionSlotProps<TName, TParams> {
  /**
   * Defines what should be rendered when no components are available
   * for the specified extension.
   */
  empty?(): React.ReactNode;
  /**
   * Defines how the provided nodes should be rendered.
   * @param nodes The rendered extension nodes.
   */
  render?(nodes: Array<React.ReactNode>): React.ReactElement<any, any> | null;
  /**
   * The custom parameters for the given extension.
   */
  params?: TParams;
  /**
   * The name of the extension to render.
   */
  name: TName;
}

/**
 * Props for defining an extension slot.
 */
export type ExtensionSlotProps<K = string> = BaseExtensionSlotProps<K extends string ? K : string, K extends keyof PiralExtensionSlotMap ? PiralExtensionSlotMap[K] : K extends string ? any : K>;

export interface PortalProps {
  instance?: PiralInstance;
  breakpoints?: LayoutBreakpoints;
}

/**
 * The PiralInstance component, which is an event emitter containing the React
 * functional component as well as some other utilities and helpers.
 */
export interface PiralInstance extends EventEmitter {
  context: GlobalStateContext;
  createApi: PiletApiCreator;
  options: LoadPiletsOptions;
  root: PiletApi;
}

export type LayoutBreakpoints = [string, string, string];

export type LayoutType = "mobile" | "tablet" | "desktop";

export type LayoutTypes = [LayoutType, LayoutType, LayoutType];

export interface ApiExtender<T> {
  /**
   * Extends the base API of a module with new functionality.
   * @param api The API created by the base layer.
   * @param target The target the API is created for.
   * @returns The extended API.
   */
  (api: PiletApi, target: PiletMetadata): T;
}

export interface Extend<T = Partial<PiletApi>> {
  /**
   * Extends the base API with a custom set of functionality to be used by modules.
   * @param context The global state context to be used.
   * @returns The extended API or a function to create the extended API for a specific target.
   */
  (context: GlobalStateContext): T | ApiExtender<T>;
}

export interface StateDispatcher<TState> {
  (state: TState): Partial<TState>;
}

export type WrappedComponent<TProps> = React.ComponentType<Without<TProps, keyof BaseComponentProps>>;

export interface BaseRegistration {
  pilet: string;
}

export interface PageRegistration extends BaseRegistration {
  component: WrappedComponent<PageComponentProps>;
  meta: PiralPageMeta;
}

export interface ExtensionRegistration extends BaseRegistration {
  component: WrappedComponent<ExtensionComponentProps<string>>;
  reference: any;
  defaults: any;
}

/**
 * The Piral global app sub-state container for shared components.
 */
export interface ComponentsState extends PiralCustomComponentsState {
  /**
   * The loading indicator renderer.
   */
  LoadingIndicator: React.ComponentType<LoadingIndicatorProps>;
  /**
   * The error renderer.
   */
  ErrorInfo: React.ComponentType<ErrorInfoProps>;
  /**
   * The router context.
   */
  Router: React.ComponentType<RouterProps>;
  /**
   * The layout used for pages.
   */
  Layout: React.ComponentType<LayoutProps>;
  /**
   * A component that can be used for debugging purposes.
   */
  Debug?: React.ComponentType;
}

/**
 * The Piral global app sub-state container for app information.
 */
export interface AppState {
  /**
   * Information for the layout computation.
   */
  layout: LayoutType;
  /**
   * Gets if the application is currently performing a background loading
   * activity, e.g., for loading modules asynchronously or fetching
   * translations.
   */
  loading: boolean;
  /**
   * Gets an unrecoverable application error, if any.
   */
  error: Error | undefined;
}

/**
 * The Piral global app sub-state container for component registrations.
 */
export interface RegistryState extends PiralCustomRegistryState {
  /**
   * The registered page components for the router.
   */
  pages: Dict<PageRegistration>;
  /**
   * The registered extension components for extension slots.
   */
  extensions: Dict<Array<ExtensionRegistration>>;
}

export type ErrorComponentsState = {
  [P in keyof Errors]?: React.ComponentType<Errors[P]>;
};

/**
 * The Piral global app state container.
 */
export interface GlobalState extends PiralCustomState {
  /**
   * The relevant state for the app itself.
   */
  app: AppState;
  /**
   * The relevant state for rendering errors of the app.
   */
  errorComponents: ErrorComponentsState;
  /**
   * The relevant state for rendering parts of the app.
   */
  components: ComponentsState;
  /**
   * The relevant state for the registered components.
   */
  registry: RegistryState;
  /**
   * Gets the loaded modules.
   */
  modules: Array<PiletMetadata>;
  /**
   * The foreign component portals to render.
   */
  portals: Record<string, Array<React.ReactPortal>>;
  /**
   * The application's shared data.
   */
  data: Dict<SharedDataItem>;
  /**
   * The used (exact) application routes.
   */
  routes: Dict<React.ComponentType<ReactRouter.RouteComponentProps<any>>>;
  /**
   * The current provider.
   */
  provider?: React.ComponentType;
}

/**
 * The shape of an app action in Piral.
 */
export interface PiralAction<T extends (...args: any) => any> {
  (ctx: GlobalStateContext, ...args: Parameters<T>): ReturnType<T>;
}

/**
 * A subset of the available app actions in Piral.
 */
export type PiralDefineActions = Partial<{
  [P in keyof PiralActions]: PiralAction<PiralActions[P]>;
}>;

/**
 * The globally defined actions.
 */
export interface PiralActions extends PiralCustomActions {
  /**
   * Initializes the application shell.
   * @param loading The current loading state.
   * @param error The application error, if any.
   * @param modules The loaded pilets.
   */
  initialize(loading: boolean, error: Error | undefined, modules: Array<Pilet>): void;
  /**
   * Injects a pilet at runtime - removes the pilet from registry first if available.
   * @param pilet The pilet to be injected.
   */
  injectPilet(pilet: Pilet): void;
  /**
   * Defines a single action for Piral.
   * @param actionName The name of the action to define.
   * @param action The action to include.
   */
  defineAction<T extends keyof PiralActions>(actionName: T, action: PiralAction<PiralActions[T]>): void;
  /**
   * Defines a set of actions for Piral.
   * @param actions The actions to define.
   */
  defineActions(actions: PiralDefineActions): void;
  /**
   * Reads the value of a shared data item.
   * @param name The name of the shared item.
   */
  readDataValue(name: string): any;
  /**
   * Tries to write a shared data item. The write access is only
   * possible if the name belongs to the provided owner or has not
   * been taken yet.
   * Setting the value to null will release it.
   * @param name The name of the shared data item.
   * @param value The value of the shared data item.
   * @param owner The owner of the shared data item.
   * @param target The target storage locatation.
   * @param expiration The time for when to dispose the shared item.
   */
  tryWriteDataItem(name: string, value: any, owner: string, target: DataStoreTarget, expiration: number): boolean;
  /**
   * Performs a layout change.
   * @param current The layout to take.
   */
  changeLayout(current: LayoutType): void;
  /**
   * Registers a new route to be resolved.
   * @param route The route to register.
   * @param value The page to be rendered on the route.
   */
  registerPage(route: string, value: PageRegistration): void;
  /**
   * Unregisters an existing route.
   * @param route The route to be removed.
   */
  unregisterPage(route: string): void;
  /**
   * Registers a new extension.
   * @param name The name of the extension category.
   * @param value The extension registration.
   */
  registerExtension(name: string, value: ExtensionRegistration): void;
  /**
   * Unregisters an existing extension.
   * @param name The name of the extension category.
   * @param value The extension that will be removed.
   */
  unregisterExtension(name: string, reference: any): void;
  /**
   * Sets the common component to render.
   * @param name The name of the component.
   * @param component The component to use for rendering.
   */
  setComponent<TKey extends keyof ComponentsState>(name: TKey, component: ComponentsState[TKey]): void;
  /**
   * Sets the error component to render.
   * @param type The type of the error.
   * @param component The component to use for rendering.
   */
  setErrorComponent<TKey extends keyof ErrorComponentsState>(type: TKey, component: ErrorComponentsState[TKey]): void;
  /**
   * Sets the common routes to render.
   * @param path The name of the component.
   * @param component The component to use for rendering.
   */
  setRoute<T = {}>(path: string, component: React.ComponentType<ReactRouter.RouteComponentProps<T>>): void;
  /**
   * Includes a new provider as a sub-provider to the current provider.
   * @param provider The provider to include.
   */
  includeProvider(provider: JSX.Element): void;
  /**
   * Destroys (i.e., resets) the given portal instance.
   * @param id The id of the portal to destroy.
   */
  destroyPortal(id: string): void;
  /**
   * Includes the provided portal in the rendering pipeline.
   * @param id The id of the portal to use.
   * @param entry The child to render.
   */
  showPortal(id: string, entry: React.ReactPortal): void;
  /**
   * Dispatches a state change.
   * @param update The update function creating a new state.
   */
  dispatch(update: (state: GlobalState) => GlobalState): void;
  /**
   * Reads the selected part of the global state.
   * @param select The selector for getting the desired part.
   * @returns The desired part.
   */
  readState<S>(select: (state: GlobalState) => S): S;
}

/**
 * The Piral app instance context.
 */
export interface GlobalStateContext extends PiralActions, EventEmitter {
  /**
   * The global state context atom.
   * Changes to the state should always be dispatched via the \`dispatch\` action.
   */
  state: LibreAtom.Atom<GlobalState>;
  /**
   * The API objects created for the loaded pilets.
   */
  apis: PiletsBag;
  /**
   * The available component converters.
   */
  converters: ComponentConverters<any>;
}

export interface PiralStorage {
  /**
   * Sets the value of an item.
   * @param name The name of the item to set.
   * @param data The new value of the item.
   * @param expires Optional expiration information.
   */
  setItem(name: string, data: string, expires?: string): void;
  /**
   * Gets the value of an item.
   * @param name The name of the item to look for.
   */
  getItem(name: string): string | null;
  /**
   * Removes an item from the storage.
   * @param name The name of the item to remove.
   */
  removeItem(name: string): void;
}

export interface Disposable {
  /**
   * Disposes the created resource.
   */
  (): void;
}

export interface PiralStoreDataEvent<TValue = any> {
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
  value: TValue;
  /**
   * The owner of the item.
   */
  owner: string;
  /**
   * The expiration of the item.
   */
  expires: number;
}

export interface PiralUnloadPiletEvent {
  /**
   * The name of the pilet to be unloaded.
   */
  name: string;
}

/**
 * Listener for Piral app shell events.
 */
export interface Listener<T> {
  /**
   * Receives an event of type T.
   */
  (arg: T): void;
}

/**
 * The map of known Piral app shell events.
 */
export interface PiralEventMap extends PiralCustomEventMap {
  [custom: string]: any;
  "store-data": PiralStoreDataEvent;
  "unload-pilet": PiralUnloadPiletEvent;
}

export interface PiletMetadataV0 {
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
  noCache?: boolean | string;
  /**
   * Optionally provides some custom metadata for the pilet.
   */
  custom?: any;
}

export interface PiletMetadataV1 {
  /**
   * The name of the pilet, i.e., the package id.
   */
  name: string;
  /**
   * The version of the pilet. Should be semantically versioned.
   */
  version: string;
  /**
   * The link for retrieving the content of the pilet.
   */
  link: string;
  /**
   * The reference name for the global require.
   */
  requireRef: string;
  /**
   * The computed integrity of the pilet. Will be used to set the
   * integrity value of the script.
   */
  integrity?: string;
  /**
   * Optionally provides some custom metadata for the pilet.
   */
  custom?: any;
}

/**
 * The pilet app, i.e., the functional exports.
 */
export interface PiletApp {
  /**
   * Integrates the evaluated pilet into the application.
   * @param api The API to access the application.
   */
  setup(api: PiletApi): void | Promise<void>;
  /**
   * Optional function for cleanup.
   * @param api The API to access the application.
   */
  teardown?(api: PiletApi): void;
}

/**
 * The options for loading pilets.
 */
export interface LoadPiletsOptions {
  /**
   * The callback function for creating an API object.
   * The API object is passed on to a specific pilet.
   */
  createApi: PiletApiCreator;
  /**
   * The callback for fetching the dynamic pilets.
   */
  fetchPilets: PiletRequester;
  /**
   * Optionally, some already existing evaluated pilets, e.g.,
   * helpful when debugging or in SSR scenarios.
   */
  pilets?: Array<Pilet>;
  /**
   * Optionally, defines how to load a pilet.
   */
  loadPilet?: PiletLoader;
  /**
   * The callback for defining how a dependency will be fetched.
   */
  fetchDependency?: PiletDependencyFetcher;
  /**
   * Gets a map of available locale dependencies for a pilet.
   * The dependencies are used during the evaluation.
   */
  getDependencies?: PiletDependencyGetter;
  /**
   * Gets the map of globally available dependencies with their names
   * as keys and their evaluated pilet content as value.
   */
  dependencies?: AvailableDependencies;
  /**
   * Optionally, defines the loading strategy to use.
   */
  strategy?: PiletLoadingStrategy;
}

/**
 * The callback to be used when pilets have been loaded.
 */
export interface PiletsLoaded {
  (error: Error | undefined, pilets: Array<Pilet>): void;
}

/**
 * The callback to be used to load a single pilet.
 */
export interface PiletLoader {
  (meta: PiletMetadata): Promise<Pilet>;
}

/**
 * The creator function for the pilet API.
 */
export interface PiletApiCreator {
  /**
   * Creates an API for the given raw pilet.
   * @param target The raw (meta) content of the pilet.
   * @returns The API object to be used with the pilet.
   */
  (target: PiletMetadata): PiletApi;
}`);
});
