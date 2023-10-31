import { dirname } from 'path';
import { retrieveTypings } from './commands';
import { stringifyNode } from './output/stringify';
import { findRefs, updateImports } from './refs';
import { DeclVisitorContext } from './types';

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
      state.types = refs;
      state.cache = refs.map((ref) => stringifyNode(ref));
    },
    async 'after-process'(context) {
      const mod = context.modules[context.name];

      for (let i = mod.length; i--; ) {
        const node = mod[i];
        const current = stringifyNode(node);

        if (state.cache.indexOf(current) !== -1) {
          // is a copy of an existing node -> drop it
          mod.splice(i, 1);
        } else if (node.kind === 'interface') {
          // identify the merged base interface
          const mergedInterface = state.types.find(m => m.kind === 'interface' && m.name === node.name);

          // if this one exists look at it
          if (mergedInterface) {
            const originals = mergedInterface.props.map(p => stringifyNode(p));

            // compare which props are still the originals - remove them
            for (let j = node.props.length; j--; ) {
              const prop = stringifyNode(node.props[j]);

              if (originals.includes(prop)) {
                node.props.splice(j, 1);
              }
            }
          }
        }
      }

      const refs = findRefs(mod);
      updateImports(context.usedImports, refs);
    },
  };
}
