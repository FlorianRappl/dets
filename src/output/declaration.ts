import { stringifyModule } from './module';
import { getLibRefName } from '../helpers';
import { DeclVisitorContext } from '../types';

export function stringifyDeclaration(context: DeclVisitorContext) {
  const modules = Object.keys(context.modules)
    .filter(moduleName => Object.keys(context.modules[moduleName]).length > 0)
    .map(moduleName => stringifyModule(moduleName, context.modules[moduleName]))
    .join('\n\n');

  const preamble = context.usedImports.map(lib => `import * as ${getLibRefName(lib)} from '${lib}';`).join('\n');

  if (preamble) {
    return `${preamble}\n\n${modules}`;
  }

  return modules;
}
