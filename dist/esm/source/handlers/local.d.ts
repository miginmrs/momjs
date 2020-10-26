import type { EHConstraint } from '../types/serial';
import type { TeardownAction } from '../types/basic';
import type { CtxH } from '../types/store';
import type { KeysOfType } from 'dependent-type';
import * as origin from '../origin';
import { F_C, F_ID } from '../handlers/common';
export declare namespace local {
    type dom = object;
    type cim = {
        T: [null, null];
        V: [never, object];
        C: [null, null];
        D: [never, object];
        A: [[], []];
    };
    type keys = {
        T: typeof F_C;
        V: typeof F_ID;
        C: typeof F_C;
        D: typeof F_ID;
        A: typeof F_C;
    };
    type Handler<EH extends EHConstraint<EH, ECtx>, ECtx> = CtxH<dom, cim, keys, 1, EH, ECtx>;
    const Handler: <EH extends EHConstraint<EH, ECtx>, ECtx>() => CtxH<object, cim, keys, 1, EH, ECtx>;
    type Origin<X extends object, EH extends EHConstraint<EH, ECtx>, ECtx> = origin.Origin<object, cim, keys, X, 1, EH, ECtx>;
    const create: <EH extends EHConstraint<EH, ECtx> & {
        Local: CtxH<object, cim, keys, 1, EH, ECtx>;
    }, ECtx>(getHandler: <R>(k: KeysOfType<EHConstraint<EH, ECtx>, R>) => R) => <X extends object>(data: X, ...teardownList: TeardownAction[]) => Origin<X, EH, ECtx>;
}
