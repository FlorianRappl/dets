import { PiletApi } from './pilet-shell2';
import { lazy, FC } from 'react';

const FooComponent = lazy(() => import('./pilet-component'));

declare module './pilet-shell2' {
  interface PiralCustomExtensionSlotMap {
    foo: {
      num: FC<any>;
    };
  }
}

export function setup(api: PiletApi) {
  api.registerExtension("foo", FooComponent);
}
