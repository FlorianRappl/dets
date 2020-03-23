import { resolve } from 'path';
import { tslibRoot, tslibPrefix, globalFiles } from './constants';

export function findAppRoot(root: string, app: string) {
  return resolve(root, app);
}

const pathCache = {};

export function isBaseLib(path: string) {
  if (path in pathCache) {
    return pathCache[path];
  } else if (path) {
    const parts = path.split('/');
    const part = parts.pop();
    const newPath = parts.join('/');
    const result = (newPath.endsWith(tslibRoot) && part.startsWith(tslibPrefix)) || globalFiles.includes(part);
    pathCache[path] = result;
    return result;
  } else {
    return false;
  }
}
