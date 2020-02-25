import { resolve } from 'path';
import { tslibRoot } from './constants';

export function findAppRoot(root: string, app: string) {
  return resolve(root, app);
}

export function isBaseLib(path: string) {
  if (path) {
    const parts = path.split('/');
    parts.pop();
    const newPath = parts.join('/');
    return newPath.endsWith(tslibRoot);
  }

  return false;
}
