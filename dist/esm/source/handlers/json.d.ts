/// <reference path="../../../../typings/deep-is.d.ts" />
import type { EHConstraint, deref, SerialObs } from '../types/serial';
import type { Ref, JsonObject, TeardownAction } from '../types/basic';
import type { CtxH } from '../types/store';
import type { KeysOfType } from 'dependent-type';
import * as origin from '../origin';
import { F_C, F_ID, F_Json } from '../handlers/common';
export declare namespace json {
    export type dom = JsonObject | string;
    type mode = null | 'str';
    export type cim = {
        T: [never, dom];
        V: [never, dom];
        C: [JsonObject, mode];
        D: [never, dom];
        A: [[], []];
    };
    export type keys = {
        T: F_ID;
        V: F_ID;
        C: F_Json;
        D: F_ID;
        A: F_C;
    };
    export const n = 1;
    export type n = typeof n;
    export type Handler<EH extends EHConstraint<EH, ECtx>, ECtx> = CtxH<dom, cim, keys, n, EH, ECtx>;
    export const Handler: <EH extends EHConstraint<EH, ECtx>, ECtx>() => CtxH<dom, cim, keys, 1, EH, ECtx>;
    export type Origin<X extends dom, EH extends EHConstraint<EH, ECtx>, ECtx> = origin.Origin<dom, cim, keys, X, n, EH, ECtx>;
    export type Serial<X extends dom, EH extends EHConstraint<EH, ECtx>, ECtx> = SerialObs<dom, cim, keys, X, n, EH, ECtx>;
    export const create: <EH extends EHConstraint<EH, ECtx> & {
        Json: CtxH<dom, cim, keys, 1, EH, ECtx>;
    }, ECtx>(getHandler: <R>(k: KeysOfType<EHConstraint<EH, ECtx>, R>) => R) => <X extends JsonObject>(data: X, ...teardownList: TeardownAction[]) => Origin<X, EH, ECtx>;
    export const cast: <EH extends EHConstraint<EH, ECtx> & {
        Json: CtxH<dom, cim, keys, 1, EH, ECtx>;
    }, ECtx>(deref: deref<EH, ECtx>) => (p: Ref<cim['V'][1]>) => SerialObs<dom, cim, keys, dom, 1, EH, ECtx, (v: dom) => void>;
    export {};
}
