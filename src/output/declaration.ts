import { stringifyModule } from './module';
import { stringifyExports } from './exports';
import { getLibRefName } from '../helpers';
import { DeclVisitorContext } from '../types';

export function stringifyDeclaration(context: DeclVisitorContext) {
  const { noModuleDeclaration } = context.flags;
  const modules = Object.keys(context.modules)
    .filter(moduleName => Object.keys(context.modules[moduleName]).length > 0)
    .map(moduleName => {
      const refs = context.modules[moduleName];

      if (noModuleDeclaration && moduleName === context.name) {
        return stringifyExports(refs);
      }

      return stringifyModule(moduleName, refs);
    })
    .join('\n\n');

  const preamble = context.usedImports.map(lib => `import * as ${getLibRefName(lib)} from '${lib}';`).join('\n');

  if (preamble) {
    return `${preamble}\n\n${modules}`;
  }

  return modules;
}
