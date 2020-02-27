import { PiletApi } from 'piral-core';

const createMyShellApi = () => ({
    foo(bar: string) {
        return bar;
    },
    hello(world: string) {
        return world;
    }
});

export function extendApi() {
    return () => (api: PiletApi) => ({
        ...api,
        ...createMyShellApi(),
    });
}

export type MyShellApi = ReturnType<typeof createMyShellApi>;

declare module 'piral-core/lib/types/custom' {
    interface PiletCustomApi extends MyShellApi { }
}
