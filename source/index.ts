import { CtxH } from './types';
import { ArrayCim, ArrayTypeKeys, ArrayHandler, JsonObject, JsonCim, JsonTypeKeys, JsonHandler } from './handlers';

export * from './store';
export * from './handlers';
export * from './destructable';
export * from './types';
export * from 'dependent-type';
export namespace RequestHandlers {
    export const Array: CtxH<any[], ArrayCim, ArrayTypeKeys, RH, {}> = ArrayHandler<RH, {}>();
    export const Json: CtxH<JsonObject, JsonCim, JsonTypeKeys, RH, {}> = JsonHandler<RH, {}>();
}
export type RH = typeof RequestHandlers;
