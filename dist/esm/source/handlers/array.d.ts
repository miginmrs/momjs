import type { DeepSerial, EHConstraint, TSerialObs, deref, SerialObs } from '../types/serial';
import type { Ref, TeardownAction } from '../types/basic';
import type { CtxH } from '../types/store';
import type { AppX, KeysOfType } from 'dependent-type';
import * as origin from '../origin';
import { F_ArrArgs, F_C, F_ID } from './common';
export declare namespace array {
    const n = 1;
    type n = typeof n;
    type cim = {
        T: [never, Ref<unknown>[]];
        V: [never, unknown[]];
        C: [null, null];
        D: [null, null];
        A: [never, unknown[]];
    };
    type dom = unknown[];
    type keys = {
        T: typeof F_ArrArgs;
        V: typeof F_ID;
        C: F_C;
        D: F_C;
        A: F_ID;
    };
    type Handler<EH extends EHConstraint<EH, ECtx>, ECtx> = CtxH<dom, cim, keys, n, EH, ECtx>;
    const Handler: <EH extends EHConstraint<EH, ECtx>, ECtx>() => CtxH<dom, cim, keys, 1, EH, ECtx>;
    type Origin<A extends dom, EH extends EHConstraint<EH, ECtx>, ECtx> = origin.Origin<dom, cim, keys, A, n, EH, ECtx>;
    type Serial<A extends dom, EH extends EHConstraint<EH, ECtx>, ECtx> = SerialObs<dom, cim, keys, A, n, EH, ECtx>;
    const create: <EH extends EHConstraint<EH, ECtx> & {
        Array: CtxH<dom, cim, keys, 1, EH, ECtx>;
    }, ECtx>(getHandler: <R>(k: KeysOfType<EHConstraint<EH, ECtx>, R>) => R) => <A extends unknown[]>(args: DeepSerial<AppX<"A", cim, keys, A>, 1, EH, ECtx>, ...teardownList: TeardownAction[]) => Origin<A, EH, ECtx>;
    const cast: <EH extends EHConstraint<EH, ECtx> & {
        Array: CtxH<dom, cim, keys, 1, EH, ECtx>;
    }, ECtx>(deref: deref<EH, ECtx>) => <T extends unknown[]>(p: Ref<T>) => import("rxjs").Observable<AppX<"V", cim, keys, T>> & {
        parent: TSerialObs<AppX<"V", cim, keys, T>, EH, ECtx>;
        origin: import("../types/serial").TOrigin<AppX<"V", cim, keys, T>, EH, ECtx>;
        readonly destroyed: boolean;
    } & {
        origin: origin.Origin<unknown[], cim, keys, T, 1, EH, ECtx, (v: AppX<"V", cim, keys, T>) => void>;
    };
}
