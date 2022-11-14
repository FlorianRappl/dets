declare interface Type<T> extends Function {
  new (...args: any[]): T;
}

export interface NgComponent {
  /**
   * Comment on top.
   */
  foo(): void;
}

/**
 * Gives you the ability to use a component from a lazy loaded module.
 */
export interface NgComponentLoader {
  /**
   * Uses a component from a lazy loaded module.
   * @param selector The selector defined for the component to load.
   */
  (selector: string): NgComponent;
}

export interface NgModuleDefiner {
  /**
   * Defines the module to use when bootstrapping the Angular pilet.
   * @param ngModule The module to use for running Angular.
   * @param opts The options to pass when bootstrapping.
   */
  <T>(module: Type<T>): void;
  /**
   * Defines the module to lazy load for bootstrapping the Angular pilet.
   * @param getModule The module lazy loader to use for running Angular.
   * @param opts The options to pass when bootstrapping.
   * @returns The module ID to be used to reference components.
   */
  <T>(getModule: () => Promise<{ default: Type<T> }>): NgComponentLoader;
}

export let foo: NgModuleDefiner;
