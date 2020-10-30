import type { KeysOfType, AppX } from 'dependent-type';
import type { defined, GlobalRef, LocalRef, Ref, TVCDADepConstaint, TVCDA_CIM } from './types/basic';
import type { deref, xDerefHandlers, derefReturn, derefHandlers, ref, TSerialObs, SerialObs } from './types/serial';
import type { CallHandler, FdcpConstraint, FkxConstraint, FIDS, Functions, RHConstraint, xderef, ModelsDefinition, EModelsDefinition, DCN, KX, Listener } from './types/store';
import type { Notif, SerializationOptions, LocalOption, PushOptions, IStore, Notifier, StoreParams } from './types/params';
import { Subscription, Observable, Subject, Subscriber, TeardownLogic } from 'rxjs';
import { Origin } from './origin';
import { BiMap } from './bimap';
import { PromiseCtr } from './async';
export declare class Store<RH extends RHConstraint<RH, ECtx>, ECtx, lfIds extends FIDS, lfdcp extends FdcpConstraint<lfIds>, lfkx extends FkxConstraint<lfIds, lfdcp>, rfIds extends FIDS, rfdcp extends FdcpConstraint<rfIds>, rfkx extends FkxConstraint<rfIds, rfdcp>> implements IStore<RH, ECtx, lfIds, lfdcp, lfkx> {
    protected readonly map: BiMap<RH, ECtx, {
        subscription?: Subscription;
        externalId?: PromiseLike<string>;
    }>;
    readonly locals: BiMap<RH, ECtx, LocalOption<RH, ECtx>>;
    readonly empty: Observable<void>;
    private storeSubs;
    private linkSubs;
    protected readonly extra: ECtx;
    protected readonly promiseCtr: PromiseCtr;
    protected readonly functions: Functions<RH, ECtx, lfIds, lfdcp, lfkx>;
    readonly name?: string;
    readonly base: boolean;
    readonly getHandler: <R>(k: KeysOfType<RHConstraint<RH, ECtx>, R>) => R;
    readonly prefix: string;
    readonly observe?: <dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2>(obs: SerialObs<dom, cim, k, X, n, RH, ECtx>) => (v: AppX<'V', cim, k, X>) => void;
    protected readonly _emptyctx: {
        deref: deref<RH, ECtx>;
        xderef: xderef<RH, ECtx>;
        ref: ref<RH, ECtx>;
    } & ECtx;
    protected readonly callHandler: CallHandler<DCN, KX, RH, ECtx, rfIds, rfdcp, rfkx>;
    protected readonly notifier: () => Observable<unknown>;
    protected readonly objects: WeakMap<object, TSerialObs<any, RH, ECtx>>;
    constructor({ getHandler, callHandler, extra, functions, promiseCtr, name, prefix, locals, base, observe, notifier }: StoreParams<RH, ECtx, lfIds, lfdcp, lfkx, rfIds, rfdcp, rfkx>);
    setup({ local, listener }: {
        local?: Subscription;
        listener: Listener<RH, ECtx, lfIds, lfdcp, lfkx>;
    }): void;
    add(subs: TeardownLogic): Subscription;
    shutdown(callback: (unlink: () => void) => void): void;
    remoteShutdown(notifier: (unlink: () => void) => Notifier): void;
    protected next: bigint;
    protected readonly pushed: Map<TSerialObs<unknown, RH, ECtx>, string>;
    protected readonly _pushes: Subject<[TSerialObs<unknown, RH, ECtx>, string, boolean]>;
    protected readonly pushes: Observable<[TSerialObs<unknown, RH, ECtx>, string, boolean]>;
    protected linkTo<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2>(obs: SerialObs<dom, cim, k, X, n, RH, ECtx>, id: string, subscriber: Subscriber<Notif<RH, ECtx>>): Subscription;
    readonly changes: Observable<Notif<RH, ECtx>>;
    subscribeToLocals($local?: Subscription): Subscription;
    protected getNext(id?: string): string;
    watch(callHandler: CallHandler<DCN, KX, RH, ECtx, rfIds, rfdcp, rfkx>): Subscription;
    /** inserts a new serial observable or updates a stored ObsWithOrigin using serialized data */
    private _unserialize;
    readonly addToObjects: <dom, cim extends TVCDA_CIM, k extends import("dependent-type").DepConstaint<"T" | "V" | "C" | "D" | "A", dom, cim>, X extends dom, n extends 1 | 2>(obs: SerialObs<dom, cim, k, X, n, RH, ECtx, (v: AppX<"V", cim, k, X>) => void>) => (v: AppX<"V", cim, k, X>) => false | WeakMap<object, TSerialObs<any, RH, ECtx>>;
    /** inserts a new serial observable into the store with a givin id */
    private _insert;
    ref: ref<RH, ECtx>;
    checkTypes: <indices extends number, dcim extends Record<indices, [unknown, TVCDA_CIM]>, keys extends { [P in indices]: import("dependent-type").DepConstaint<"T" | "V" | "C" | "D" | "A", dcim[P][0], dcim[P][1]>; }, X extends { [P_1 in indices]: dcim[P_1][0]; }, N extends Record<indices, 1 | 2>>(v: TSerialObs<{ [P_2 in indices]: dcim[P_2][1]["V"][1]; }[indices], RH, ECtx>, ...args: [xDerefHandlers<indices, dcim, keys, X, N, RH, ECtx>] | [derefHandlers<indices, dcim, keys, N, RH, ECtx>, 0]) => derefReturn<indices, dcim, keys, X, N, RH, ECtx>;
    getter: <T extends defined, V extends T = T>(r: Ref<T>) => TSerialObs<V, RH, ECtx>;
    xderef: (getter: <T extends defined, V extends T = T>(r: Ref<T>) => TSerialObs<V, RH, ECtx>) => xderef<RH, ECtx>;
    deref: (getter: <T extends defined>(r: Ref<T>) => TSerialObs<T, RH, ECtx>) => deref<RH, ECtx>;
    /** inserts or updates multiple entries from serialized data with stored subscription to new ones */
    unserialize<indices extends number, dcim extends Record<indices, [unknown, TVCDA_CIM]>, keys extends {
        [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]>;
    }, X extends {
        [P in indices]: unknown;
    }, N extends Record<indices, 1 | 2>>(getModels: ModelsDefinition<indices, dcim, keys, X, N, RH, ECtx> | ((ref: <i extends indices>(i: i) => LocalRef<AppX<'V', dcim[i][1], keys[i], X[i]>>) => ModelsDefinition<indices, dcim, keys, X, N, RH, ECtx>)): {
        [i in indices]: GlobalRef<AppX<'V', dcim[i][1], keys[i], X[i]>>;
    } & GlobalRef<unknown>[];
    /** adds an TSerialObs to store and subscribe to it without storing subscription  */
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
    serialize<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2>(obs: SerialObs<dom, cim, k, X, n, RH, ECtx>, opt: SerializationOptions): Observable<EModelsDefinition<0, [[dom, cim]], [k], [X], [n], RH, ECtx>>;
    get(id: string): [TSerialObs<any, RH, ECtx>, {
        subscription?: Subscription | undefined;
        externalId?: PromiseLike<string> | undefined;
    }] | undefined;
    getValue<V>({ id }: GlobalRef<V>): [TSerialObs<V, RH, ECtx>, {
        subscription?: Subscription | undefined;
        externalId?: PromiseLike<string> | undefined;
    }];
    call<fId extends lfIds>(fId: fId, param: lfdcp[fId][2], arg: GlobalRef<AppX<'V', lfdcp[fId][0][1], lfkx[fId][0], lfkx[fId][1]>>, opt: {
        ignore?: string[];
        graph: true;
    }): Observable<EModelsDefinition<0, [[lfdcp[fId][1][0], lfdcp[fId][1][1]]], [lfkx[fId][2]], [lfkx[fId][3]], [lfdcp[fId][1][2]], RH, ECtx>>;
    call<fId extends lfIds>(fId: fId, param: lfdcp[fId][2], arg: GlobalRef<AppX<'V', lfdcp[fId][0][1], lfkx[fId][0], lfkx[fId][1]>>, opt?: {
        ignore?: string[];
        graph?: false;
    }): Observable<GlobalRef<AppX<'V', lfdcp[fId][1][1], lfkx[fId][2], lfkx[fId][3]>>>;
    callReturnRef: WeakMap<Subscription, PromiseLike<GlobalRef<unknown>>>;
    remote<fId extends rfIds>(fId: fId, arg: TSerialObs<AppX<'V', rfdcp[fId][0][1], rfkx[fId][0], rfkx[fId][1]>, RH, ECtx> & {
        origin: Origin<rfdcp[fId][0][0], rfdcp[fId][0][1], rfkx[fId][0], rfkx[fId][1], rfdcp[fId][0][2], RH, ECtx>;
    }, param: rfdcp[fId][2], opt: {
        ignore?: string[];
        graph: true;
    }): Observable<AppX<'V', rfdcp[fId][1][1], rfkx[fId][2], rfkx[fId][3]>>;
    remote<fId extends rfIds>(fId: fId, arg: SerialObs<rfdcp[fId][0][0], rfdcp[fId][0][1], rfkx[fId][0], rfkx[fId][1], rfdcp[fId][0][2], RH, ECtx>, param: rfdcp[fId][2], opt?: {
        ignore?: string[];
        graph?: false;
    }): Observable<GlobalRef<AppX<'V', rfdcp[fId][1][1], rfkx[fId][2], rfkx[fId][3]>>>;
}
