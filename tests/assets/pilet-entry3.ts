import { PiletApi } from './pilet-shell2';
import { lazy, FC } from 'react';

const FooComponent = lazy(() => import('./pilet-component'));

interface MyExtensions {
  foo: {
    num: FC<any>;
  };
}

declare module './pilet-shell2' {
  interface PiralCustomExtensionSlotMap extends MyExtensions {}
}

export function setup(api: PiletApi) {
  api.registerExtension('foo', FooComponent);
}
