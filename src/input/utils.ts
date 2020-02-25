import { DeclVisitorContext } from '../types';

export function swapName(context: DeclVisitorContext, newName: string, oldName: string) {
  if (oldName !== newName) {
    const isdef = oldName === 'default';

    if (isdef) {
      oldName = '_default';
    }

    context.refs[newName] = context.refs[oldName];
    delete context.refs[oldName];

    if (isdef) {
      delete context.refs.default;
    }
  }
}
