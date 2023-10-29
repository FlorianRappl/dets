import { PiletApi } from './pilet-shell';
import { lazy } from 'react';

const FooComponent = lazy(() => import('./pilet-component'));

declare module './pilet-shell' {
  interface PiralCustomExtensionSlotMap {
    foo: {
      num: number;
    };
  }
}

export function setup(api: PiletApi) {
  api.registerExtension("foo", FooComponent);
}
