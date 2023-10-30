import { dirname } from 'path';
import { retrieveTypings } from './commands';
import { DeclVisitorContext } from './types';
import { stringifyNode } from './output/stringify';

export interface DetsClassicPlugin {
  /**
   * Type of the plugin.
   */
  type: 'before-init' | 'before-process' | 'after-process' | 'before-stringify';
  /**
   * The name of the plugin (emitted in case of problems).
   */
  name: string;
  /**
   * Callback to run when invoking the plugin.
   * @param context The context to perform the work on.
   */
  run(context: DeclVisitorContext): void | Promise<void>;
}

export interface DetsModernPlugin {
  /**
   * The name of the plugin (emitted in case of problems).
   */
  name: string;
  /**
   * Callback to run when invoking the plugin.
   * @param context The context to perform the work on.
   */
  'before-init'?(context: DeclVisitorContext): void | Promise<void>;
  /**
   * Callback to run when invoking the plugin.
   * @param context The context to perform the work on.
   */
  'before-process'?(context: DeclVisitorContext): void | Promise<void>;
  /**
   * Callback to run when invoking the plugin.
   * @param context The context to perform the work on.
   */
  'before-stringify'?(context: DeclVisitorContext): void | Promise<void>;
  /**
   * Callback to run when invoking the plugin.
   * @param context The context to perform the work on.
   */
  'after-process'?(context: DeclVisitorContext): void | Promise<void>;
}

export type DetsPlugin = DetsClassicPlugin | DetsModernPlugin;

export function createExcludePlugin(moduleNames: Array<string>): DetsPlugin {
  return {
    name: 'exclude-plugin',
    'after-process'(context) {
      for (const name of moduleNames) {
        delete context.modules[name];
      }
    },
  };
}

export function createDiffPlugin(originalFile: string): DetsPlugin {
  const state: Record<string, any> = {};
  return {
    name: 'diff-plugin',
    async 'before-init'(context) {
      const refs = await retrieveTypings({
        root: dirname(originalFile),
        types: [originalFile],
        plugins: [],
        logger: context.log,
        imports: context.imports,
        log: context.log,
      });
      state.refs = refs.map(ref => stringifyNode(ref));
    },
    async 'after-process'(context) {
      const mod = context.modules[context.name];

      for (let i = mod.length; i--; ) {
        const current = stringifyNode(mod[i]);

        if (state.refs.indexOf(current) !== -1) {
          mod.splice(i, 1);
        }
      }
    },
  };
}
