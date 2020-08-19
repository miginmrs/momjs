import { CtxRequestHandler } from './types';
import { ArrayCim, ArrayTypeKeys, ArrayHandler, JsonObject, JsonCim, JsonTypeKeys, JsonHandler } from './handlers';

export * from './store';
export * from './handlers';
export * from './destructable';
export * from './types';
export * from 'dependent-type';
export namespace RequestHandlers {
    export const Array: CtxRequestHandler<any[], ArrayCim, ArrayTypeKeys> = ArrayHandler;
    export const Json: CtxRequestHandler<JsonObject, JsonCim, JsonTypeKeys> = JsonHandler;
}
export type RequestHandlers = typeof RequestHandlers;
