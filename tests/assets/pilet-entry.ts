import { PiletApi } from './pilet-shell';
import { lazy } from 'react';

const FooComponent = lazy(() => import('./pilet-component'));

export function setup(api: PiletApi) {
  api.registerExtension("foo", FooComponent);
}
