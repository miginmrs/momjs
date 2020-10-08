import { Subscription, Observable } from 'rxjs';
import { GlobalRef, LocalRef, Ref, deref, CtxH, TVCDA_CIM, TVCDADepConstaint, ModelsDefinition, xDerefHandlers, derefReturn, EModelsDefinition, xderef, derefHandlers, ref, RHConstraint, ObsWithOrigin, EHConstraint, CallHandler, Functions, FdcpConstraint, FkxConstraint, FIDS } from './types';
import { Destructable, EntryObs, TypedDestructable } from './destructable';
import { KeysOfType, AppX, App, Fun, BadApp, DepConstaint } from 'dependent-type';
export declare const F_Custom_Ref: unique symbol;
export declare const F_I_X: unique symbol;
declare type ParentOfC = {
    0: any;
    1: any;
    2: any;
};
declare type RefHelper<C extends ParentOfC, X extends number> = App<Fun<C[1][X], C[0][X][0]>, C[2][X]> & C[0][X][1];
declare type RefTypeError<C, X> = BadApp<Fun<typeof F_Custom_Ref, C>, X>;
declare type CondRefHelper<C, X> = X extends number ? C extends ParentOfC ? RefHelper<C, X> : RefTypeError<C, X> : RefTypeError<C, X>;
declare module 'dependent-type' {
    interface TypeFuncs<C, X> {
        [F_Custom_Ref]: CondRefHelper<C, X>;
        [F_I_X]: {
            i: X;
        };
    }
}
export declare type PromiseCtr = {
    new <T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): PromiseLike<T>;
    all<T>(values: readonly (T | PromiseLike<T>)[]): PromiseLike<T[]>;
    resolve<T>(value: T | PromiseLike<T>): PromiseLike<T>;
};
export declare const runit: <R, N>(gen: Generator<N | PromiseLike<N>, R, N>, promiseCtr: PromiseCtr) => PromiseLike<R>;
export declare function wait<T>(x: T | PromiseLike<T>): Generator<T | PromiseLike<T>, T, T>;
export declare function asAsync<T extends any[], R, U = void, N = any>(f: (this: U, ...args: T) => Generator<N | PromiseLike<N>, R, N>, promiseCtr: PromiseCtr, thisArg: U): (...args: T) => PromiseLike<R>;
export declare function asAsync<T extends any[], R, U = void, N = any>(f: (this: U | void, ...args: T) => Generator<N | PromiseLike<N>, R, N>, promiseCtr: PromiseCtr, thisArg?: U): (...args: T) => PromiseLike<R>;
export declare class BiMap<EH extends EHConstraint<EH, ECtx>, ECtx, D, k = string> {
    private byId;
    private byObs;
    private oldId;
    get(id: k): [ObsWithOrigin<any, EH, ECtx>, D] | undefined;
    delete(id: k): boolean;
    set(id: k, value: [ObsWithOrigin<any, EH, ECtx>, D]): void;
    reuseId(obs: TypedDestructable<any, EH, ECtx>, id: k): void;
    find(obs: TypedDestructable<any, EH, ECtx>): k | undefined;
    usedId(obs: TypedDestructable<any, EH, ECtx>): k | undefined;
    get size(): number;
    keys(): IterableIterator<k>;
    entries(): IterableIterator<[k, [ObsWithOrigin<any, EH, ECtx>, D]]>;
    values(): IterableIterator<[ObsWithOrigin<any, EH, ECtx>, D]>;
}
declare type Notif<RH extends RHConstraint<RH, ECtx>, ECtx> = ['next', EModelsDefinition<0, [[unknown, TVCDA_CIM]], [TVCDADepConstaint<unknown, TVCDA_CIM>], [unknown], [1 | 2], RH, ECtx>] | ['error', GlobalRef<any>, unknown] | ['complete', GlobalRef<any>] | ['unsubscribe', GlobalRef<any>];
/** Options of serialization */
declare type SerializationOptions = {
    /** @property {boolean} isNew whether the first entry of the first emission should be indicated new or not */
    isNew: boolean;
    /**
     * @property {boolean} push whether the observable should be pushed into the store or not
     * @default true
     */
    push?: boolean;
    /**
     * @property {string[]} ignore ids of destructables that should be ignored from serialization
     */
    ignore?: string[];
};
export declare class Store<RH extends RHConstraint<RH, ECtx>, ECtx, fIds extends FIDS, fdcp extends FdcpConstraint<fIds>, fkx extends FkxConstraint<fIds, fdcp>> {
    readonly handlers: RH;
    private extra;
    private promiseCtr;
    private functions;
    readonly name?: string | undefined;
    readonly prefix: string;
    private map;
    private next;
    private locals;
    private pushed;
    private pushes;
    readonly changes: Observable<Notif<RH, ECtx>>;
    constructor(handlers: RH, extra: ECtx, promiseCtr: PromiseCtr, functions?: Functions<RH, ECtx, fIds, fdcp, fkx> | null, name?: string | undefined, prefix?: string);
    private getNext;
    findRef<V>(obs: TypedDestructable<V, RH, ECtx>): GlobalRef<V> | undefined;
    watch(callHandler: CallHandler<RH, ECtx, 0, FdcpConstraint<0>, FkxConstraint<0, FdcpConstraint<0>>>): Subscription;
    /** inserts a new destructable or updates a stored ObsWithOrigin using serialized data */
    private _unserialize;
    /** inserts a new destructable into the store with a givin id */
    private _insert;
    ref: ref<RH, ECtx>;
    checkTypes: <indices extends number, dcim extends Record<indices, [any, TVCDA_CIM]>, keys extends { [P in indices]: DepConstaint<"T" | "V" | "C" | "D" | "A", dcim[P][0], dcim[P][1]>; }, X extends { [P_1 in indices]: dcim[P_1][0]; }, N extends Record<indices, 1 | 2>>(v: ObsWithOrigin<{ [P_2 in indices]: dcim[P_2][1]["V"][1]; }[indices], RH, ECtx>, ...args: [xDerefHandlers<indices, dcim, keys, X, N, RH, ECtx>] | [derefHandlers<indices, dcim, keys, N, RH, ECtx>, 0]) => derefReturn<indices, dcim, keys, X, N, RH, ECtx>;
    getter: <T extends object, V extends T = T>(r: Ref<T>) => ObsWithOrigin<V, RH, ECtx>;
    xderef: (getter: <T extends object, V extends T = T>(r: Ref<T>) => ObsWithOrigin<V, RH, ECtx>) => xderef<RH, ECtx>;
    deref: (getter: <T extends object>(r: Ref<T>) => ObsWithOrigin<T, RH, ECtx>) => deref<RH, ECtx>;
    emptyContext: {
        deref: deref<RH, ECtx>;
        xderef: xderef<RH, ECtx>;
        ref: ref<RH, ECtx>;
    } & ECtx;
    /** inserts or updates multiple entries from serialized data with stored subscription to new ones */
    unserialize<indices extends number, dcim extends Record<indices, [any, TVCDA_CIM]>, keys extends {
        [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]>;
    }, X extends {
        [P in indices]: any;
    }, N extends Record<indices, 1 | 2>>(getModels: ModelsDefinition<indices, dcim, keys, X, N, RH, ECtx> | ((ref: <i extends indices>(i: i) => LocalRef<AppX<'V', dcim[i][1], keys[i], X[i]>>) => ModelsDefinition<indices, dcim, keys, X, N, RH, ECtx>)): {
        [i in indices]: GlobalRef<AppX<'V', dcim[i][1], keys[i], X[i]>>;
    } & GlobalRef<any>[];
    /** it does nothing useful, there is no use case for this function and no reason for it to stay here */
    append<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2>(key: KeysOfType<RH, CtxH<dom, cim, k, n, RH, ECtx>> & string, entry: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, RH, ECtx>, c: AppX<'C', cim, k, X>): {
        id: string;
        obs: Destructable<dom, cim, k, X, n, RH, ECtx>;
        subs: Subscription;
    };
    /** adds an ObsWithOrigin to store and subscribe to it without storing subscription  */
    push<V>(obs: ObsWithOrigin<V, RH, ECtx>, { ids, unload }?: {
        ids?: WeakMap<TypedDestructable<any, RH, ECtx>, string>;
        unload?: (ref: GlobalRef<V>) => void;
    }): {
        wrapped: ObsWithOrigin<V, RH, ECtx>;
        ref: GlobalRef<V>;
        subscription: Subscription;
    };
    /**
     * serialize any destructable object regardless wether its in the store
     * @param {Destructable} obs the observable to serialize
     * @param {SerializationOptions} opt options of serialization
     */
    serialize<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2>(obs: Destructable<dom, cim, k, X, n, RH, ECtx>, opt: SerializationOptions): Observable<EModelsDefinition<0, [[dom, cim]], [k], [X], [n], RH, ECtx>>;
    get(id: string): [ObsWithOrigin<any, RH, ECtx>, {
        subscription?: Subscription | undefined;
        externalId?: PromiseLike<string> | undefined;
    }] | undefined;
    getValue<V>({ id }: GlobalRef<V>): [ObsWithOrigin<V, RH, ECtx>, {
        subscription?: Subscription | undefined;
        externalId?: PromiseLike<string> | undefined;
    }];
    local<fId extends fIds>(fId: fId, param: fdcp[fId][2], arg: GlobalRef<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>>, opt?: {
        ignore?: string[];
        graph: true;
    }): Observable<EModelsDefinition<0, [[fdcp[fId][1][0], fdcp[fId][1][1]]], [fkx[fId][2]], [fkx[fId][3]], [fdcp[fId][1][2]], RH, ECtx>>;
    local<fId extends fIds>(fId: fId, param: fdcp[fId][2], arg: GlobalRef<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>>, opt: {
        ignore?: string[];
        graph?: false;
    }): Observable<GlobalRef<AppX<'V', fdcp[fId][1][1], fkx[fId][2], fkx[fId][3]>>>;
    callReturnRef: WeakMap<Subscription, PromiseLike<GlobalRef<any>>>;
    remote<fId extends fIds>(fId: fId, arg: Destructable<fdcp[fId][0][0], fdcp[fId][0][1], fkx[fId][0], fkx[fId][1], fdcp[fId][0][2], RH, ECtx>, param: fdcp[fId][2], { handlers: makeOp, serialized }: CallHandler<RH, ECtx, fIds, fdcp, fkx>, opt?: {
        ignore?: string[];
        graph?: boolean;
    }): Observable<AppX<"V", fdcp[fId][1][1], fkx[fId][2], fkx[fId][3]>>;
}
export {};
