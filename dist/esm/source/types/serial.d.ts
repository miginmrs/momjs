import type { Observable } from 'rxjs';
import type { KeysOfType, AppX, DepConstaint, keytype, TypeFuncs } from 'dependent-type';
import type { TVCDADepConstaint, TVCDA_CIM, Ref } from './basic';
import type { Origin } from '../origin';
import { transient } from '../constants';
export declare type SerialArray<A extends unknown[], EH extends EHConstraint<EH, ECtx>, ECtx> = TSerialObs<A[number], EH, ECtx>[] & {
    [k in Exclude<keyof A, keyof any[]>]: TSerialObs<A[k], EH, ECtx>;
};
export declare type DeepSerial<A extends unknown[], n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = (n extends 1 ? TSerialObs<A[number], EH, ECtx> : SerialArray<A[number] & unknown[], EH, ECtx>)[] & {
    [k in Exclude<keyof A, keyof any[]>]: n extends 1 ? TSerialObs<A[k], EH, ECtx> : SerialArray<A[k] & unknown[], EH, ECtx>;
};
export declare type EntryObs<D, A extends unknown[], n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
    args: DeepSerial<A, n, EH, ECtx>;
    data: D;
    n: n;
};
export declare type CtxEH<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
    encode: (ctx: {
        ref: ref<EH, ECtx>;
    }) => RequestHandleEncode<dom, cim, k, n, EH, ECtx>;
    ctr: SerialCtr<dom, cim, k, n, EH, ECtx>;
    destroy?: RequestHandlerDestroy<dom, cim, k>;
    [transient]?: boolean;
};
export declare type EHConstraint<EH extends EHConstraint<EH, ECtx>, ECtx> = {
    [k in keyof EH]: CtxEH<any, any, any, any, EH, ECtx>;
};
export declare type xDerefHandler<indices extends number, dcim extends Record<indices, [unknown, TVCDA_CIM]>, keys extends {
    [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]>;
}, X extends {
    [P in indices]: dcim[P][0];
}, N extends Record<indices, 1 | 2>, EH extends EHConstraint<EH, ECtx>, ECtx, i extends indices> = [KeysOfType<EHConstraint<EH, ECtx>, CtxEH<dcim[i][0], dcim[i][1], keys[i], N[i], EH, ECtx>>, AppX<'C', dcim[i][1], keys[i], X[i]>];
export declare type xDerefHandlers<indices extends number, dcim extends Record<indices, [unknown, TVCDA_CIM]>, keys extends {
    [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]>;
}, X extends {
    [P in indices]: dcim[P][0];
}, N extends Record<indices, 1 | 2>, EH extends EHConstraint<EH, ECtx>, ECtx> = xDerefHandler<indices, dcim, keys, X, N, EH, ECtx, indices>[] & {
    [i in indices]: xDerefHandler<indices, dcim, keys, X, N, EH, ECtx, i>;
};
export declare type derefHandler<indices extends number, dcim extends Record<indices, [unknown, TVCDA_CIM]>, keys extends {
    [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]>;
}, N extends Record<indices, 1 | 2>, EH extends EHConstraint<EH, ECtx>, ECtx, i extends indices> = KeysOfType<EHConstraint<EH, ECtx>, CtxEH<dcim[i][0], dcim[i][1], keys[i], N[i], EH, ECtx>>;
export declare type derefHandlers<indices extends number, dcim extends Record<indices, [unknown, TVCDA_CIM]>, keys extends {
    [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]>;
}, N extends Record<indices, 1 | 2>, EH extends EHConstraint<EH, ECtx>, ECtx> = derefHandler<indices, any, any, any, EH, ECtx, indices>[] & {
    [i in indices]: derefHandler<indices, dcim, keys, N, EH, ECtx, i>;
};
export declare type derefReturn<indices extends number, dcim extends Record<indices, [unknown, TVCDA_CIM]>, keys extends {
    [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]>;
}, X extends {
    [P in indices]: dcim[P][0];
}, N extends Record<indices, 1 | 2>, EH extends EHConstraint<EH, ECtx>, ECtx> = {
    [P in indices]: SerialObs<dcim[P][0], dcim[P][1], keys[P], X[P], N[P], EH, ECtx>;
}[indices];
export declare type deref<EH extends EHConstraint<EH, ECtx>, ECtx> = {
    <V>(ref: Ref<V>): TSerialObs<V, EH, ECtx>;
    <indices extends number, dcim extends Record<indices, [unknown, TVCDA_CIM]>, keys extends {
        [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]>;
    }, X extends {
        [P in indices]: dcim[P][0];
    }, N extends Record<indices, 1 | 2>>(ref: Ref<{
        [P in indices]: AppX<'V', dcim[P][1], keys[P], X[P]>;
    }[indices]>, ...handlers: derefHandlers<indices, dcim, keys, N, EH, ECtx>): derefReturn<indices, dcim, keys, X, N, EH, ECtx>;
};
export declare type ref<EH extends EHConstraint<EH, ECtx>, ECtx> = {
    <V>(obs: TSerialObs<V, EH, ECtx>): Ref<V>;
};
export declare type CimX<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom> = {
    T: [cim['T'][0], TypeFuncs<cim['T'][0], X>[k['T']]];
    V: [cim['V'][0], TypeFuncs<cim['V'][0], X>[k['V']]];
    C: [cim['C'][0], TypeFuncs<cim['C'][0], X>[k['C']]];
    D: [cim['D'][0], TypeFuncs<cim['D'][0], X>[k['D']]];
    A: [cim['A'][0], TypeFuncs<cim['A'][0], X>[k['A']]];
};
export declare type SerialCtrX<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
    (args: AppX<'A', cim, k, X>, data: AppX<'D', cim, k, X>, c: AppX<'C', cim, k, X>, old: null | AppX<'V', cim, k, X>, origin: Origin<dom, cim, k, X, n, EH, ECtx>): AppX<'V', cim, k, X>;
};
export declare type SerialCtrs<dom extends keytype, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
    [X in dom]: SerialCtrX<dom, cim, k, X, n, EH, ECtx>;
};
export declare type SerialCtr<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
    <X extends dom>(args: AppX<'A', cim, k, X>, data: AppX<'D', cim, k, X>, c: AppX<'C', cim, k, X>, old: null | AppX<'V', cim, k, X>, origin: Origin<dom, cim, k, X, n, EH, ECtx>): AppX<'V', cim, k, X>;
};
export declare type RequestHandleEncodeX<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
    (args: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx> & {
        c: AppX<'C', cim, k, X>;
        old?: AppX<'T', cim, k, X>;
    }): AppX<'T', cim, k, X> | undefined;
};
export declare type RequestHandleEncodes<dom extends keytype, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
    [X in dom]: RequestHandleEncodeX<dom, cim, k, X, n, EH, ECtx>;
};
export declare type RequestHandleEncode<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
    <X extends dom>(args: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx> & {
        c: AppX<'C', cim, k, X>;
        old?: AppX<'T', cim, k, X>;
    }): AppX<'T', cim, k, X> | undefined;
};
export declare type RequestHandlerCompare<dom, cim extends Pick<TVCDA_CIM, 'D' | 'A'>, k extends DepConstaint<'D' | 'A', dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
    <X extends dom>(x: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>, y: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>): boolean;
};
export declare type RequestHandlerDestroy<dom, cim extends Pick<TVCDA_CIM, 'D'>, k extends DepConstaint<'D', dom, cim>> = {
    <X extends dom>(data: AppX<'D', cim, k, X>): void;
};
export declare type TOrigin<V, EH extends EHConstraint<EH, ECtx>, ECtx> = Origin<any, any, any, any, any, EH, ECtx, (v: V) => void>;
export declare type TSerialObs<V, EH extends EHConstraint<EH, ECtx>, ECtx> = Observable<V> & {
    parent: TSerialObs<V, EH, ECtx> | TSerialObs<V, EH, ECtx>[];
    origin: TOrigin<V, EH, ECtx>;
    readonly destroyed: boolean;
};
export declare type SerialObs<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx, $V extends (v: AppX<'V', cim, k, X>) => void = (v: AppX<'V', cim, k, X>) => void> = Observable<Parameters<$V>[0]> & {
    parent: SerialObs<dom, cim, k, X, n, EH, ECtx, $V> | SerialObs<dom, cim, k, X, n, EH, ECtx, $V>[];
    origin: Origin<dom, cim, k, X, n, EH, ECtx, $V>;
    readonly destroyed: boolean;
};
