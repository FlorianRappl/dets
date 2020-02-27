import { createAction } from 'deox';

export const ACTION = 'ACTION';

export const action1 = createAction(ACTION);

export type Action<TType extends string, TPayload = undefined, TMeta = undefined> = TPayload extends undefined
  ? TMeta extends undefined
    ? {
        type: TType;
      }
    : {
        type: TType;
        meta: TMeta;
      }
  : TPayload extends Error
  ? TMeta extends undefined
    ? {
        type: TType;
        payload: TPayload;
        error: true;
      }
    : {
        type: TType;
        payload: TPayload;
        meta: TMeta;
        error: true;
      }
  : TMeta extends undefined
  ? {
      type: TType;
      payload: TPayload;
    }
  : {
      type: TType;
      payload: TPayload;
      meta: TMeta;
    };

export function createAction2<TType extends string, TCallable extends <_T>(...args: any[]) => Action<TType>>(
  type: TType,
  executor?: (
    resolve: <Payload = undefined, Meta = undefined>(payload?: Payload, meta?: Meta) => Action<TType, Payload, Meta>,
  ) => TCallable,
): TCallable & {
  type: TType;
  toString(): TType;
} {
  return {} as any;
}

export const action2 = createAction2(ACTION);
