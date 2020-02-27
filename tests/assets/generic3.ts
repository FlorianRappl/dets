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
