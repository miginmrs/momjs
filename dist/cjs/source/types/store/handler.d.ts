import type { AppX, KeysOfType } from 'dependent-type';
import type { ModelData, TVCDA_CIM, TVCDADepConstaint, Ref } from '../basic';
import type { EntryObs, EHConstraint, xDerefHandlers, derefReturn, CtxEH, deref, TSerialObs, RequestHandlerCompare } from '../serial';
import type { Origin } from '../../origin';
import type { AnyModelDefinition } from './definition';
export declare type xderef<EH extends EHConstraint<EH, ECtx>, ECtx> = {
    <indices extends number, dcim extends Record<indices, [unknown, TVCDA_CIM]>, keys extends {
        [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]>;
    }, X extends {
        [P in indices]: dcim[P][0];
    }, N extends Record<indices, 1 | 2>>(ref: Ref<{
        [P in indices]: dcim[P][1]['V'][1];
    }[indices]>, ...handlers: xDerefHandlers<indices, dcim, keys, X, N, EH, ECtx>): derefReturn<indices, dcim, keys, X, N, EH, ECtx>;
};
export declare type CtxH<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = CtxEH<dom, cim, k, n, EH, ECtx> & {
    decode: (ctx: {
        deref: deref<EH, ECtx>;
        xderef: xderef<EH, ECtx>;
    } & ECtx) => <X extends dom>(id: string, args: AppX<'T', cim, k, X>, old: TSerialObs<AppX<'V', cim, k, X>, EH, ECtx> & {
        origin: Origin<dom, cim, k, X, n, EH, ECtx>;
    } | null) => EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>;
    compare?: (ctx: ECtx) => RequestHandlerCompare<dom, cim, k, n, EH, ECtx>;
};
export declare type RHConstraint<RH extends RHConstraint<RH, ECtx>, ECtx> = {
    [k in keyof RH]: CtxH<any, any, any, any, RH, ECtx>;
};
export declare type Name<indices extends number, dcim extends Record<indices, [unknown, TVCDA_CIM]>, keys extends {
    [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]>;
}, P extends indices, N extends Record<indices, 1 | 2>, RH extends RHConstraint<RH, ECtx>, ECtx> = KeysOfType<RH, CtxH<dcim[P][0], dcim[P][1], keys[P], N[P], RH, ECtx>>;
export declare type ModelDefinition<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2, RH extends RHConstraint<RH, ECtx>, ECtx> = {
    type: KeysOfType<RHConstraint<RH, ECtx>, CtxH<dom, cim, k, n, RH, ECtx>> & string;
    c: AppX<'C', cim, k, X>;
} & ModelData<AppX<'T', cim, k, X>>;
export declare type ModelsDefinition<indices extends number, dcim extends Record<indices, [unknown, TVCDA_CIM]>, keys extends {
    [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]>;
}, X extends {
    [P in indices]: dcim[P][0];
}, N extends Record<indices, 1 | 2>, RH extends RHConstraint<RH, ECtx>, ECtx> = {
    [P in indices]: ModelDefinition<dcim[P][0], dcim[P][1], keys[P], X[P], N[P], RH, ECtx> & {
        i: P;
    };
} & AnyModelDefinition<RH, ECtx, indices>[];
