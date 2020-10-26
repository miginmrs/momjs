/// <reference path="../../../../typings/deep-is.d.ts" />
import type { EHConstraint, deref, SerialObs } from '../types/serial';
import type { Ref, JsonObject, TeardownAction } from '../types/basic';
import type { CtxH } from '../types/store';
import type { KeysOfType } from 'dependent-type';
import * as origin from '../origin';
import { F_C, F_ID } from '../handlers/common';
export declare namespace json {
    type dom = JsonObject;
    type cim = {
        T: [never, JsonObject];
        V: [never, JsonObject];
        C: [null, null];
        D: [never, JsonObject];
        A: [[], []];
    };
    type keys = {
        T: F_ID;
        V: F_ID;
        C: F_C;
        D: F_ID;
        A: F_C;
    };
    const n = 1;
    type n = typeof n;
    type Handler<EH extends EHConstraint<EH, ECtx>, ECtx> = CtxH<dom, cim, keys, n, EH, ECtx>;
    const Handler: <EH extends EHConstraint<EH, ECtx>, ECtx>() => CtxH<JsonObject, cim, keys, 1, EH, ECtx>;
    type Origin<X extends dom, EH extends EHConstraint<EH, ECtx>, ECtx> = origin.Origin<dom, cim, keys, X, n, EH, ECtx>;
    type Serial<X extends dom, EH extends EHConstraint<EH, ECtx>, ECtx> = SerialObs<dom, cim, keys, X, n, EH, ECtx>;
    const create: <EH extends EHConstraint<EH, ECtx> & {
        Json: CtxH<JsonObject, cim, keys, 1, EH, ECtx>;
    }, ECtx>(getHandler: <R>(k: KeysOfType<EHConstraint<EH, ECtx>, R>) => R) => <X extends JsonObject>(data: X, ...teardownList: TeardownAction[]) => Origin<X, EH, ECtx>;
    const cast: <EH extends EHConstraint<EH, ECtx> & {
        Json: CtxH<JsonObject, cim, keys, 1, EH, ECtx>;
    }, ECtx>(deref: deref<EH, ECtx>) => (p: Ref<cim['V'][1]>) => import("rxjs").Observable<JsonObject> & {
        parent: import("../types/serial").TSerialObs<JsonObject, EH, ECtx>;
        origin: import("../types/serial").TOrigin<JsonObject, EH, ECtx>;
        readonly destroyed: boolean;
    } & {
        origin: origin.Origin<JsonObject, cim, keys, JsonObject, 1, EH, ECtx, (v: JsonObject) => void>;
    };
}
