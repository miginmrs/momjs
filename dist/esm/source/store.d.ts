import type { KeysOfType, AppX } from 'dependent-type';
import type { GlobalRef, LocalRef, Ref, TVCDADepConstaint, TVCDA_CIM } from './types/basic';
import type { deref, xDerefHandlers, derefReturn, EntryObs, derefHandlers, ref, TSerialObs } from './types/serial';
import type { CallHandler, FdcpConstraint, FkxConstraint, FIDS, Functions, RHConstraint, CtxH, xderef, ModelsDefinition, EModelsDefinition } from './types/store';
import type { Notif, SerializationOptions } from './types/params';
import { Subscription, Observable } from 'rxjs';
import { Origin } from './origin';
import { BiMap } from './bimap';
import { PromiseCtr } from './async';
/** Options of push */
export declare type PushOptions<V, RH extends RHConstraint<RH, ECtx>, ECtx> = {
    unload?: (ref: GlobalRef<V>) => void;
    nextId?: (obs: TSerialObs<unknown, RH, ECtx>, parentId?: string) => string | undefined;
    local?: Subscription & {
        [Store.nodeps]?: boolean;
    };
};
export declare type LocalOption<RH extends RHConstraint<RH, ECtx>, ECtx> = {
    in?: boolean;
    out?: boolean;
} & PushOptions<unknown, RH, ECtx>;
export declare type LocalObs<RH extends RHConstraint<RH, ECtx>, ECtx> = [TSerialObs<unknown, RH, ECtx>, {
    id: string;
} & LocalOption<RH, ECtx>];
export declare class Store<RH extends RHConstraint<RH, ECtx>, ECtx, lfIds extends FIDS, lfdcp extends FdcpConstraint<lfIds>, lfkx extends FkxConstraint<lfIds, lfdcp>, rfIds extends FIDS, rfdcp extends FdcpConstraint<rfIds>, rfkx extends FkxConstraint<rfIds, rfdcp>> {
    readonly getHandler: <R>(k: KeysOfType<RHConstraint<RH, ECtx>, R>) => R;
    private extra;
    private promiseCtr;
    private functions;
    readonly name?: string | undefined;
    readonly prefix: string;
    readonly base: boolean;
    protected map: BiMap<RH, ECtx, {
        subscription?: Subscription;
        externalId?: PromiseLike<string>;
    }>;
    readonly locals: BiMap<RH, ECtx, LocalOption<RH, ECtx>>;
    readonly empty: Observable<void>;
    constructor(getHandler: <R>(k: KeysOfType<RHConstraint<RH, ECtx>, R>) => R, extra: ECtx, promiseCtr: PromiseCtr, functions?: Functions<RH, ECtx, lfIds, lfdcp, lfkx> | null, name?: string | undefined, prefix?: string, locals?: LocalObs<RH, ECtx>[], base?: boolean);
    private next;
    private pushed;
    private pushes;
    readonly changes: Observable<Notif<RH, ECtx>>;
    subscribeToLocals($local?: Subscription | undefined): Subscription;
    private getNext;
    watch(callHandler: CallHandler<RH, ECtx, 0, FdcpConstraint<0>, FkxConstraint<0, FdcpConstraint<0>>>): Subscription;
    /** inserts a new serial observable or updates a stored ObsWithOrigin using serialized data */
    private _unserialize;
    /** inserts a new serial observable into the store with a givin id */
    private _insert;
    ref: ref<RH, ECtx>;
    checkTypes: <indices extends number, dcim extends Record<indices, [unknown, TVCDA_CIM]>, keys extends { [P in indices]: import("dependent-type").DepConstaint<"T" | "V" | "C" | "D" | "A", dcim[P][0], dcim[P][1]>; }, X extends { [P_1 in indices]: dcim[P_1][0]; }, N extends Record<indices, 1 | 2>>(v: TSerialObs<{ [P_2 in indices]: dcim[P_2][1]["V"][1]; }[indices], RH, ECtx>, ...args: [xDerefHandlers<indices, dcim, keys, X, N, RH, ECtx>] | [derefHandlers<indices, dcim, keys, N, RH, ECtx>, 0]) => derefReturn<indices, dcim, keys, X, N, RH, ECtx>;
    getter: <T extends object, V extends T = T>(r: Ref<T>) => TSerialObs<V, RH, ECtx>;
    xderef: (getter: <T extends object, V extends T = T>(r: Ref<T>) => TSerialObs<V, RH, ECtx>) => xderef<RH, ECtx>;
    deref: (getter: <T extends object>(r: Ref<T>) => TSerialObs<T, RH, ECtx>) => deref<RH, ECtx>;
    emptyContext: {
        deref: deref<RH, ECtx>;
        xderef: xderef<RH, ECtx>;
        ref: ref<RH, ECtx>;
    } & ECtx;
    /** inserts or updates multiple entries from serialized data with stored subscription to new ones */
    unserialize<indices extends number, dcim extends Record<indices, [unknown, TVCDA_CIM]>, keys extends {
        [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]>;
    }, X extends {
        [P in indices]: unknown;
    }, N extends Record<indices, 1 | 2>>(getModels: ModelsDefinition<indices, dcim, keys, X, N, RH, ECtx> | ((ref: <i extends indices>(i: i) => LocalRef<AppX<'V', dcim[i][1], keys[i], X[i]>>) => ModelsDefinition<indices, dcim, keys, X, N, RH, ECtx>)): {
        [i in indices]: GlobalRef<AppX<'V', dcim[i][1], keys[i], X[i]>>;
    } & GlobalRef<unknown>[];
    /** it does nothing useful, there is no use case for this function and no reason for it to stay here */
    append<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2>(key: KeysOfType<RH, CtxH<dom, cim, k, n, RH, ECtx>> & string, entry: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, RH, ECtx>, c: AppX<'C', cim, k, X>): {
        id: string;
        obs: Origin<dom, cim, k, X, n, RH, ECtx, (v: AppX<"V", cim, k, X>) => void>;
        subs: Subscription;
    };
    static readonly nodeps: unique symbol;
    /** adds an ObsWithOrigin to store and subscribe to it without storing subscription  */
    push<V>(obs: TSerialObs<V, RH, ECtx>, { unload, nextId, local: $local }?: PushOptions<V, RH, ECtx>): {
        wrapped: TSerialObs<V, RH, ECtx>;
        ref: GlobalRef<V>;
        subscription: Subscription;
    };
    /**
     * serialize any serial observable regardless wether its in the store
     * @param {Origin} obs the observable to serialize
     * @param {SerializationOptions} opt options of serialization
     */
    serialize<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2>(obs: TSerialObs<AppX<'V', cim, k, X>, RH, ECtx> & {
        origin: Origin<dom, cim, k, X, n, RH, ECtx>;
    }, opt: SerializationOptions): Observable<EModelsDefinition<0, [[dom, cim]], [k], [X], [n], RH, ECtx>>;
    get(id: string): [TSerialObs<any, RH, ECtx>, {
        subscription?: Subscription | undefined;
        externalId?: PromiseLike<string> | undefined;
    }] | undefined;
    getValue<V>({ id }: GlobalRef<V>): [TSerialObs<V, RH, ECtx>, {
        subscription?: Subscription | undefined;
        externalId?: PromiseLike<string> | undefined;
    }];
    call<fId extends lfIds>(fId: fId, param: lfdcp[fId][2], arg: GlobalRef<AppX<'V', lfdcp[fId][0][1], lfkx[fId][0], lfkx[fId][1]>>, opt?: {
        ignore?: string[];
        graph: true;
    }): Observable<EModelsDefinition<0, [[lfdcp[fId][1][0], lfdcp[fId][1][1]]], [lfkx[fId][2]], [lfkx[fId][3]], [lfdcp[fId][1][2]], RH, ECtx>>;
    call<fId extends lfIds>(fId: fId, param: lfdcp[fId][2], arg: GlobalRef<AppX<'V', lfdcp[fId][0][1], lfkx[fId][0], lfkx[fId][1]>>, opt: {
        ignore?: string[];
        graph?: false;
    }): Observable<GlobalRef<AppX<'V', lfdcp[fId][1][1], lfkx[fId][2], lfkx[fId][3]>>>;
    callReturnRef: WeakMap<Subscription, PromiseLike<GlobalRef<unknown>>>;
    remote<fId extends rfIds>(fId: fId, arg: TSerialObs<AppX<'V', rfdcp[fId][0][1], rfkx[fId][0], rfkx[fId][1]>, RH, ECtx> & {
        origin: Origin<rfdcp[fId][0][0], rfdcp[fId][0][1], rfkx[fId][0], rfkx[fId][1], rfdcp[fId][0][2], RH, ECtx>;
    }, param: rfdcp[fId][2], { handlers: makeOp, serialized }: CallHandler<RH, ECtx, rfIds, rfdcp, rfkx>, opt: {
        ignore?: string[];
        graph: true;
    }): Observable<AppX<'V', rfdcp[fId][1][1], rfkx[fId][2], rfkx[fId][3]>>;
    remote<fId extends rfIds>(fId: fId, arg: TSerialObs<AppX<'V', rfdcp[fId][0][1], rfkx[fId][0], rfkx[fId][1]>, RH, ECtx> & {
        origin: Origin<rfdcp[fId][0][0], rfdcp[fId][0][1], rfkx[fId][0], rfkx[fId][1], rfdcp[fId][0][2], RH, ECtx>;
    }, param: rfdcp[fId][2], { handlers: makeOp, serialized }: CallHandler<RH, ECtx, rfIds, rfdcp, rfkx>, opt?: {
        ignore?: string[];
        graph?: false;
    }): Observable<GlobalRef<AppX<'V', rfdcp[fId][1][1], rfkx[fId][2], rfkx[fId][3]>>>;
}
