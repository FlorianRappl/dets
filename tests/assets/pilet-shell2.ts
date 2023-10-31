import * as React from 'react';

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
export interface PiletCustomApi extends PiletMenuApi, PiletNotificationsApi, PiletModalsApi, PiletPageLayoutsApi {}

/**
 * Defines the Pilet API from piral-core.
 * This interface will be consumed by pilet developers so that their pilet can interact with the piral instance.
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
  registerPage(route: string, Component: AnyComponent<PageComponentProps>, meta?: PiralPageMeta): RegistrationDisposer;
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
  registerExtension<TName>(name: TName extends string ? TName : string, Component: AnyExtensionComponent<TName>, defaults?: Partial<ExtensionParams<TName>>): RegistrationDisposer;
  /**
   * Unregisters a global extension component.
   * Only previously registered extension components can be unregistered.
   * @param name The name of the extension slot to unregister from.
   * @param Component The registered extension component to unregister.
   */
  unregisterExtension<TName>(name: TName extends string ? TName : string, Component: AnyExtensionComponent<TName>): void;
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
   * @return The disposer to clear the extension.
   */
  renderHtmlExtension<TName>(element: HTMLElement | ShadowRoot, props: ExtensionSlotProps<TName>): Disposable;
}

/**
 * Describes the metadata of a pilet available in its API.
 */
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
   * Provides the version of the specification for this pilet.
   */
  spec: string;
  /**
   * Provides some custom metadata for the pilet.
   */
  custom?: any;
  /**
   * Optionally indicates the global require reference, if any.
   */
  requireRef?: string;
  /**
   * Additional shared dependencies from the pilet.
   */
  dependencies: Record<string, string>;
  /**
   * Provides some configuration to be used in the pilet.
   */
  config: Record<string, any>;
  /**
   * The URL of the main script of the pilet.
   */
  link: string;
  /**
   * The base path to the pilet. Can be used to make resource requests
   * and override the public path.
   */
  basePath: string;
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
  "unload-pilet": PiralUnloadPiletEvent;
  [custom: string]: any;
  "store-data": PiralStoreDataEvent;
}

export interface PiletMenuApi {
  /**
   * Registers a menu item for a predefined menu component.
   * The name has to be unique within the current pilet.
   * @param name The name of the menu item.
   * @param Component The component to be rendered within the menu.
   * @param settings The optional configuration for the menu item.
   */
  registerMenu(name: string, Component: AnyComponent<MenuComponentProps>, settings?: MenuSettings): RegistrationDisposer;
  /**
   * Registers a menu item for a predefined menu component.
   * @param Component The component to be rendered within the menu.
   * @param settings The optional configuration for the menu item.
   */
  registerMenu(Component: AnyComponent<MenuComponentProps>, settings?: MenuSettings): RegistrationDisposer;
  /**
   * Unregisters a menu item known by the given name.
   * Only previously registered menu items can be unregistered.
   * @param name The name of the menu item to unregister.
   */
  unregisterMenu(name: string): void;
}

export interface PiletNotificationsApi {
  /**
   * Shows a notification in the determined spot using the provided content.
   * @param content The content to display. Normally, a string would be sufficient.
   * @param options The options to consider for showing the notification.
   * @returns A callback to trigger closing the notification.
   */
  showNotification(content: string | React.ReactElement<any, any> | AnyComponent<NotificationComponentProps>, options?: NotificationOptions): Disposable;
}

export interface PiletModalsApi {
  /**
   * Shows a modal dialog with the given name.
   * The modal can be optionally programmatically closed using the returned callback.
   * @param name The name of the registered modal.
   * @param options Optional arguments for creating the modal.
   * @returns A callback to trigger closing the modal.
   */
  showModal<T>(name: T extends string ? T : string, options?: ModalOptions<T>): Disposable;
  /**
   * Registers a modal dialog using a React component.
   * The name needs to be unique to be used without the pilet's name.
   * @param name The name of the modal to register.
   * @param Component The component to render the page.
   * @param defaults Optionally, sets the default values for the inserted options.
   * @param layout Optionally, sets the layout options for the dialog wrapper.
   */
  registerModal<T>(name: T extends string ? T : string, Component: AnyComponent<ModalComponentProps<T>>, defaults?: ModalOptions<T>, layout?: ModalLayoutOptions): RegistrationDisposer;
  /**
   * Unregisters a modal by its name.
   * @param name The name that was previously registered.
   */
  unregisterModal<T>(name: T extends string ? T : string): void;
}

export interface PiletPageLayoutsApi {
  /**
   * Registers a page layout.
   * @param name The name of the layout.
   * @param layout The component responsible for the layout.
   */
  registerPageLayout(name: string, layout: AnyComponent<React.PropsWithChildren<PageComponentProps>>): RegistrationDisposer;
  /**
   * Unregisters a page layout.
   * @param name The name of the layout.
   */
  unregisterPageLayout(name: string): void;
}

/**
 * Defines the shape of the data store for storing shared data.
 */
export interface SharedData<TValue = any> {
  [key: string]: TValue;
}

/**
 * Defines the options to be used for storing data.
 */
export type DataStoreOptions = DataStoreTarget | CustomDataStoreOptions;

/**
 * Possible shapes for a component.
 */
export type AnyComponent<T> = React.ComponentType<T> | FirstParametersOf<ComponentConverters<T>>;

/**
 * The props used by a page component.
 */
export interface PageComponentProps<T extends {
  [K in keyof T]?: string;
} = {}, S = any> extends RouteBaseProps<T, S> {
  /**
   * The meta data registered with the page.
   */
  meta: PiralPageMeta;
  /**
   * The children of the page.
   */
  children: React.ReactNode;
}

/**
 * The meta data registered for a page.
 */
export interface PiralPageMeta extends PiralCustomPageMeta, PiralCustomPageMeta {}

/**
 * The shape of an implicit unregister function.
 */
export interface RegistrationDisposer {
  /**
   * Cleans up the previous registration.
   */
  (): void;
}

/**
 * Shorthand for the definition of an extension component.
 */
export type AnyExtensionComponent<TName> = TName extends keyof PiralExtensionSlotMap ? AnyComponent<ExtensionComponentProps<TName>> : TName extends string ? AnyComponent<ExtensionComponentProps<any>> : AnyComponent<ExtensionComponentProps<TName>>;

/**
 * Gives the extension params shape for the given extension slot name.
 */
export type ExtensionParams<TName> = TName extends keyof PiralExtensionSlotMap ? PiralExtensionSlotMap[TName] : TName extends string ? any : TName;

/**
 * The props for defining an extension slot.
 */
export type ExtensionSlotProps<TName = string> = BaseExtensionSlotProps<TName extends string ? TName : string, ExtensionParams<TName>>;

/**
 * Can be implemented by functions to be used for disposal purposes.
 */
export interface Disposable {
  /**
   * Disposes the created resource.
   */
  (): void;
}

/**
 * Custom events defined outside of piral-core.
 */
export interface PiralCustomEventMap {}

/**
 * Gets fired when a pilet gets unloaded.
 */
export interface PiralUnloadPiletEvent {
  /**
   * The name of the pilet to be unloaded.
   */
  name: string;
}

/**
 * Gets fired when a data item gets stored in piral.
 */
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

export interface MenuComponentProps extends BaseComponentProps {}

export type MenuSettings = PiralCustomMenuSettings & PiralSpecificMenuSettings;

export type NotificationComponentProps = BaseComponentProps & BareNotificationProps;

export type NotificationOptions = PiralCustomNotificationOptions & PiralStandardNotificationOptions & PiralSpecificNotificationOptions;

export type ModalOptions<T> = T extends keyof PiralModalsMap ? PiralModalsMap[T] & BaseModalOptions : T extends string ? BaseModalOptions : T;

export type ModalComponentProps<T> = BaseComponentProps & BareModalComponentProps<ModalOptions<T>>;

/**
 * The options provided for the dialog layout.
 */
export interface ModalLayoutOptions {}

export type Unsubscribe = () => void;

export type AnyAction<P> = {
  payload: P;
  type: string;
  slice: string;
};

export interface LanguageLoader {
  /**
   * I18n callback to load the translation on local change.
   * @param language local to load the translation file.
   */
  (language: string): Promise<Record<string, string>>;
}

export interface HandleErrorOptions {
  caption: string;
  code?: number;
}

/**
 * Version Information of the Software .
 */
export interface VersionInfo {
  /**
   * Name of the Software.
   */
  name: string;
  /**
   * Version of the Software.
   */
  version: string;
}

/**
 * Defines the potential targets when storing data.
 */
export type DataStoreTarget = "memory" | "local" | "remote";

/**
 * Defines the custom options for storing data.
 */
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

export type FirstParametersOf<T> = {
  [K in keyof T]: T[K] extends (arg: any) => any ? FirstParameter<T[K]> : never;
}[keyof T];

/**
 * Mapping of available component converters.
 */
export interface ComponentConverters<TProps> {
  /**
   * Converts the HTML component to a framework-independent component.
   * @param component The vanilla JavaScript component to be converted.
   */
  html(component: HtmlComponent<TProps>): ForeignComponent<TProps>;
}

/**
 * The props that every registered page component obtains.
 */
export interface RouteBaseProps<UrlParams extends {
  [K in keyof UrlParams]?: string;
} = {}, UrlState = any> extends BaseComponentProps {}

/**
 * Custom meta data to include for pages.
 */
export interface PiralCustomPageMeta {
  /**
   * The layout to use for the page.
   */
  layout?: string;
}

/**
 * The props of an extension component.
 */
export interface ExtensionComponentProps<T> extends BaseComponentProps {
  /**
   * The provided parameters for showing the extension.
   */
  params: T extends keyof PiralExtensionSlotMap ? PiralExtensionSlotMap[T] : T extends string ? any : T;
  /**
   * The optional children to receive, if any.
   */
  children?: React.ReactNode;
}

/**
 * The mapping of the existing (known) extension slots.
 */
export interface PiralExtensionSlotMap extends PiralCustomExtensionSlotMap {}

/**
 * The basic props for defining an extension slot.
 */
export interface BaseExtensionSlotProps<TName, TParams> {
  /**
   * The children to transport, if any.
   */
  children?: React.ReactNode;
  /**
   * Defines what should be rendered when no components are available
   * for the specified extension.
   */
  empty?(): React.ReactNode;
  /**
   * Determines if the `render` function should be called in case no
   * components are available for the specified extension.
   *
   * If true, `empty` will be called and returned from the slot.
   * If false, `render` will be called with the result of calling `empty`.
   * The result of calling `render` will then be returned from the slot.
   */
  emptySkipsRender?: boolean;
  /**
   * Defines the order of the components to render.
   * May be more convient than using `render` w.r.t. ordering extensions
   * by their supplied metadata.
   * @param extensions The registered extensions.
   * @returns The ordered extensions.
   */
  order?(extensions: Array<ExtensionRegistration>): Array<ExtensionRegistration>;
  /**
   * Defines how the provided nodes should be rendered.
   * @param nodes The rendered extension nodes.
   * @returns The rendered nodes, i.e., an ReactElement.
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
 * The props that every registered component obtains.
 */
export interface BaseComponentProps {
  /**
   * The currently used pilet API.
   */
  piral: PiletApi;
}

export interface PiralCustomMenuSettings {
  weight: number;
  section?: string;
}

export type PiralSpecificMenuSettings = UnionOf<{
  [P in keyof PiralMenuType]: Partial<PiralMenuType[P]> & {
    /**
     * The type of the menu used.
     */
    type?: P;
  };
}>;

export interface BareNotificationProps {
  /**
   * Callback for closing the notification programmatically.
   */
  onClose(): void;
  /**
   * Provides the passed in options for this particular notification.
   */
  options: NotificationOptions;
}

export interface PiralCustomNotificationOptions {}

export interface PiralStandardNotificationOptions {
  /**
   * The title of the notification, if any.
   */
  title?: string;
  /**
   * Determines when the notification should automatically close in milliseconds.
   * A value of 0 or undefined forces the user to close the notification.
   */
  autoClose?: number;
}

export type PiralSpecificNotificationOptions = UnionOf<{
  [P in keyof PiralNotificationTypes]: Partial<PiralNotificationTypes[P]> & {
    /**
     * The type of the notification used when displaying the message.
     * By default info is used.
     */
    type?: P;
  };
}>;

export interface BaseModalOptions {}

export interface PiralModalsMap extends PiralCustomModalsMap {}

export interface BareModalComponentProps<TOpts> {
  /**
   * Callback for closing the modal programmatically.
   */
  onClose(): void;
  /**
   * Provides the passed in options for this particular modal.
   */
  options?: TOpts;
}

/**
 * Configuration for the layout and behavior of the Dialog.
 */
export interface DialogLayout {
  /**
   * Sets if the dialog is user-closable by the close button or pressing escape.
   */
  closable?: boolean;
  /**
   * Sets if the default layout should be applied.
   */
  withLayout?: boolean;
  /**
   * Callback to be evaluated before the dialog is (user) closed - it can only be closed if canClose is not provided or returning true.
   */
  canClose?: boolean | ((ev: Event) => boolean);
  /**
   * Callback to be invoked when the cancel button was pressed.
   */
  onCancel?(): void;
  /**
   * Callback to be invoked when the accept button was pressed.
   */
  onAccept?(): void;
}

export interface PiralContext {
  emit(type: string, ev: any): void;
  dispatch(cb: (state: any) => any): void;
  readState(cb: (state: any) => any): any;
  on(type: string, cb: (ev: any) => void): void;
  off(type: string, cb: (ev: any) => void): void;
}

/**
 * Matches any primitive, `Date`, or `RegExp` value.
 */
export type BuiltIns = Primitive | Date | RegExp;

export type FirstParameter<T extends (arg: any) => any> = T extends (arg: infer P) => any ? P : never;

/**
 * Definition of a vanilla JavaScript component.
 */
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

/**
 * Generic definition of a framework-independent component.
 */
export interface ForeignComponent<TProps> {
  /**
   * Called when the component is mounted.
   * @param element The container hosting the element.
   * @param props The props to transport.
   * @param ctx The associated context.
   * @param locals The local state of this component instance.
   */
  mount(element: HTMLElement, props: TProps, ctx: ComponentContext, locals: Record<string, any>): void;
  /**
   * Called when the component should be updated.
   * @param element The container hosting the element.
   * @param props The props to transport.
   * @param ctx The associated context.
   * @param locals The local state of this component instance.
   */
  update?(element: HTMLElement, props: TProps, ctx: ComponentContext, locals: Record<string, any>): void;
  /**
   * Called when a component is unmounted.
   * @param element The container that was hosting the element.
   * @param locals The local state of this component instance.
   */
  unmount?(element: HTMLElement, locals: Record<string, any>): void;
}

/**
 * Custom extension slots outside of piral-core.
 */
export interface PiralCustomExtensionSlotMap {
  bar: {
    num: number;
  };
}

/**
 * The interface modeling the registration of a pilet extension component.
 */
export interface ExtensionRegistration extends BaseRegistration {
  /**
   * The wrapped registered extension component.
   */
  component: WrappedComponent<ExtensionComponentProps<string>>;
  /**
   * The original extension component that has been registered.
   */
  reference: any;
  /**
   * The default params (i.e., meta) of the extension.
   */
  defaults: any;
}

export type UnionOf<T> = {
  [K in keyof T]: T[K];
}[keyof T];

export interface PiralMenuType extends PiralCustomMenuTypes {
  /**
   * The general type. No extra options.
   */
  general: {};
  /**
   * The admin type. No extra options.
   */
  admin: {};
  /**
   * The user type. No extra options.
   */
  user: {};
  /**
   * The header type. No extra options.
   */
  header: {};
  /**
   * The footer type. No extra options.
   */
  footer: {};
}

export interface PiralNotificationTypes extends PiralCustomNotificationTypes {
  /**
   * The info type. No extra options.
   */
  info: {};
  /**
   * The success type. No extra options.
   */
  success: {};
  /**
   * The warning type. No extra options.
   */
  warning: {};
  /**
   * The error type. No extra options.
   */
  error: {};
}

export interface PiralCustomModalsMap {}

/**
 * Matches any [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).
 * @category Type
 */
export type Primitive = null | undefined | string | number | boolean | symbol | bigint;

/**
 * The context to be transported into the generic components.
 */
export interface ComponentContext {
  /**
   * The router-independent navigation API.
   */
  navigation: NavigationApi;
  /**
   * The internal router object.
   * @deprecated Exposes internals that can change at any time.
   */
  router: any;
  /**
   * The public path of the application.
   */
  publicPath: string;
}

export type SettingsSectionType = "workflow";

/**
 * The base type for pilet component registration in the global state context.
 */
export interface BaseRegistration {
  /**
   * The pilet registering the component.
   */
  pilet: string;
}

export type WrappedComponent<TProps> = React.ComponentType<React.PropsWithChildren<Without<TProps, keyof BaseComponentProps>>>;

export interface PiralCustomMenuTypes {
  [type: string]: any;
}

export interface PiralCustomNotificationTypes {}

export interface NavigationApi {
  /**
   * Pushes a new location onto the history stack.
   */
  push(target: string, state?: any): void;
  /**
   * Replaces the current location with another.
   */
  replace(target: string, state?: any): void;
  /**
   * Changes the current index in the history stack by a given delta.
   */
  go(n: number): void;
  /**
   * Prevents changes to the history stack from happening.
   * This is useful when you want to prevent the user navigating
   * away from the current page, for example when they have some
   * unsaved data on the current page.
   * @param blocker The function being called with a transition request.
   * @returns The disposable for stopping the block.
   */
  block(blocker: NavigationBlocker): Disposable;
  /**
   * Starts listening for location changes and calls the given
   * callback with an Update when it does.
   * @param listener The function being called when the route changes.
   * @returns The disposable for stopping the block.
   */
  listen(listener: NavigationListener): Disposable;
  /**
   * Gets the current navigation / application path.
   */
  path: string;
  /**
   * Gets the current navigation path incl. search and hash parts.
   */
  url: string;
  /**
   * The original router behind the navigation. Don't depend on this
   * as the implementation is router specific and may change over time.
   */
  router: any;
  /**
   * Gets the public path of the application.
   */
  publicPath: string;
}

export type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

export type FilterMapToReactEventHandler<T> = MapToReactEventHandler<FilterByEventKeys<T>>;

export interface NavigationBlocker {
  (tx: NavigationTransition): void;
}

export interface NavigationListener {
  (update: NavigationUpdate): void;
}

export type MapToReactEventHandler<T> = {
  [K in keyof T]: (event: Event | CustomEvent) => void;
};

export type FilterByEventKeys<T> = Pick<T, FilterKeysByEventName<T>>;

export interface NavigationTransition extends NavigationUpdate {
  retry?(): void;
}

export interface NavigationUpdate {
  action: NavigationAction;
  location: NavigationLocation;
}

export type FilterKeysByEventName<T> = {
  [P in keyof T]: ExtractEventName<P> extends never ? never : P;
}[keyof T];

export type NavigationAction = "POP" | "PUSH" | "REPLACE";

export interface NavigationLocation {
  /**
   * The fully qualified URL incl. the origin and base path.
   */
  href: string;
  /**
   * The location.pathname property is a string that contains an initial "/"
   * followed by the remainder of the URL up to the ?.
   */
  pathname: string;
  /**
   * The location.search property is a string that contains an initial "?"
   * followed by the key=value pairs in the query string. If there are no
   * parameters, this value may be the empty string (i.e. '').
   */
  search: string;
  /**
   * The location.hash property is a string that contains an initial "#"
   * followed by fragment identifier of the URL. If there is no fragment
   * identifier, this value may be the empty string (i.e. '').
   */
  hash: string;
  /**
   * The location.state property is a user-supplied State object that is
   * associated with this location. This can be a useful place to store
   * any information you do not want to put in the URL, e.g. session-specific
   * data.
   */
  state: unknown;
  /**
   * The location.key property is a unique string associated with this location.
   * On the initial location, this will be the string default. On all subsequent
   * locations, this string will be a unique identifier.
   */
  key?: string;
}

export type ExtractEventName<S> = S extends `emit${infer EventName}Event` ? `${EventName}` : never;
