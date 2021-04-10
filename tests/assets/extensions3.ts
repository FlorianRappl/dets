import type { PiletApi } from 'sample-piral';

declare module 'sample-piral' {
  interface PiralCustomExtensionSlotMap {
    'my-extension-slot': {
      foo: string;
      bar: number;
    };
  }
}

export function setup(api: PiletApi) {
  api.registerExtension('my-extension-slot', ({ params }) => {
    console.log('I know that I have...', params.bar, params.foo);
    return null;
  });
}
