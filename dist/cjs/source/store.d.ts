import { Subscription, Observable } from 'rxjs';
import { GlobalRef, LocalRef, Ref, deref, CtxH, TVCDA_CIM, TVCDADepConstaint, ModelsDefinition, xDerefHandlers, derefReturn, EModelsDefinition, xderef, derefHandlers, ref, RHConstraint, ObsWithOrigin, EHConstraint, CallHandler } from './types';
import { Destructable, EntryObs, TypedDestructable } from './destructable';
import { KeysOfType, AppX, App, Fun, BadApp } from 'dependent-type';
import { Json } from '.';
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
declare type SerializationOptions = {
    isNew: boolean;
    push?: boolean;
};
export declare class Store<RH extends RHConstraint<RH, ECtx>, ECtx> {
    readonly handlers: RH;
    private extra;
    private promiseCtr;
    readonly name?: string | undefined;
    readonly prefix: string;
    private map;
    private next;
    constructor(handlers: RH, extra: ECtx, promiseCtr: PromiseCtr, name?: string | undefined, prefix?: string);
    private getNext;
    findRef<V>(obs: TypedDestructable<V, RH, ECtx>): GlobalRef<V> | undefined;
    private _unserialize;
    private _insert;
    ref: ref<RH, ECtx>;
    checkTypes: <indices extends number, dcim extends Record<indices, [any, TVCDA_CIM]>, keys extends { [P in indices]: import("dependent-type").DepConstaint<"T" | "V" | "C" | "D" | "A", dcim[P][0], dcim[P][1]>; }, X extends { [P_1 in indices]: dcim[P_1][0]; }, N extends Record<indices, 1 | 2>>(v: ObsWithOrigin<{ [P_2 in indices]: dcim[P_2][1]["V"][1]; }[indices], RH, ECtx>, ...args: [xDerefHandlers<indices, dcim, keys, X, N, RH, ECtx>] | [derefHandlers<indices, dcim, keys, N, RH, ECtx>, 0]) => derefReturn<indices, dcim, keys, X, N, RH, ECtx>;
    getter: <T extends object, V extends T = T>(r: Ref<T>) => ObsWithOrigin<V, RH, ECtx>;
    xderef: (getter: <T extends object, V extends T = T>(r: Ref<T>) => ObsWithOrigin<V, RH, ECtx>) => xderef<RH, ECtx>;
    deref: (getter: <T extends object>(r: Ref<T>) => ObsWithOrigin<T, RH, ECtx>) => deref<RH, ECtx>;
    emptyContext: {
        deref: deref<RH, ECtx>;
        xderef: xderef<RH, ECtx>;
        ref: ref<RH, ECtx>;
    } & ECtx;
    unserialize<indices extends number, dcim extends Record<indices, [any, TVCDA_CIM]>, keys extends {
        [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]>;
    }, X extends {
        [P in indices]: any;
    }, N extends Record<indices, 1 | 2>>(getModels: ModelsDefinition<indices, dcim, keys, X, N, RH, ECtx> | ((ref: <i extends indices>(i: i) => LocalRef<AppX<'V', dcim[i][1], keys[i], X[i]>>) => ModelsDefinition<indices, dcim, keys, X, N, RH, ECtx>)): {
        [i in indices]: GlobalRef<AppX<'V', dcim[i][1], keys[i], X[i]>>;
    } & GlobalRef<any>[];
    append<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2>(key: KeysOfType<RH, CtxH<dom, cim, k, n, RH, ECtx>> & string, entry: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, RH, ECtx>, c: AppX<'C', cim, k, X>): {
        id: string;
        obs: Destructable<dom, cim, k, X, n, RH, ECtx>;
        subs: Subscription;
    };
    push<V>(obs: ObsWithOrigin<V, RH, ECtx>, { ids, unload }?: {
        ids?: WeakMap<TypedDestructable<any, RH, ECtx>, string>;
        unload?: (ref: GlobalRef<V>) => void;
    }): {
        wrapped: ObsWithOrigin<V, RH, ECtx>;
        ref: GlobalRef<V>;
        subscription: Subscription;
    };
    serialize<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2>(obs: Destructable<dom, cim, k, X, n, RH, ECtx>, opt: SerializationOptions): Observable<EModelsDefinition<0, [[dom, cim]], [k], [X], [n], RH, ECtx>>;
    get(id: string): [ObsWithOrigin<any, RH, ECtx>, {
        subscription?: Subscription | undefined;
        externalId?: PromiseLike<string> | undefined;
    }] | undefined;
    getValue<V>({ id }: GlobalRef<V>): [ObsWithOrigin<V, RH, ECtx>, {
        subscription?: Subscription | undefined;
        externalId?: PromiseLike<string> | undefined;
    }];
    functions: ((param: Json, arg: ObsWithOrigin<any, RH, ECtx>) => TypedDestructable<any, RH, ECtx>)[];
    local(fId: number, param: Json, arg: GlobalRef<any>): Observable<EModelsDefinition<0, [[any, any]], [any], [any], [any], RH, ECtx>>;
    callReturnRef: WeakMap<Subscription, PromiseLike<GlobalRef<any>>>;
    remote<dom2, cim2 extends TVCDA_CIM, k2 extends TVCDADepConstaint<dom2, cim2>, X2 extends dom2, n2 extends 1 | 2>(): <dom, cim extends TVCDA_CIM, k extends import("dependent-type").DepConstaint<"T" | "V" | "C" | "D" | "A", dom, cim>, X extends dom, n extends 1 | 2, P extends Json>(fId: number, arg: Destructable<dom, cim, k, X, n, RH, ECtx>, param: P, { handlers: makeOp, serialized }: CallHandler<dom, cim, k, X, n, P, dom2, cim2, k2, X2, n2, RH, ECtx>) => Observable<AppX<"V", cim2, k2, X2>>;
}
export {};
