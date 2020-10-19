/// <reference path="../../../typings/deep-is.d.ts" />
import { CtxH, Ref, EHConstraint, JsonObject, ObsWithOrigin, ArrKeys } from './types';
import { DeepDestructable, Destructable } from './destructable';
import { AppX } from 'dependent-type';
import type { BadApp, Fun } from 'dependent-type';
import { deref } from '.';
import { TeardownLogic } from 'rxjs';
/** @summary Filters X by C */
export declare const F_F: unique symbol;
/** @summary Returns constant C */
export declare const F_C: unique symbol;
/** @summary Identity */
export declare const F_ID: unique symbol;
export declare type F_F = typeof F_F;
export declare type F_C = typeof F_C;
export declare type F_ID = typeof F_ID;
export declare const F_MapArr: unique symbol;
export declare type F_MapArr = typeof F_MapArr;
export declare const F_ArrArgs: unique symbol;
export declare type F_ArrArgs = typeof F_ArrArgs;
export declare const F_MapArgs: unique symbol;
export declare type F_MapArgs = typeof F_MapArgs;
export declare const F_ToMap: unique symbol;
export declare type F_ToMap = typeof F_ToMap;
export declare const F_Destructable: unique symbol;
export declare type F_Destructable = typeof F_Destructable;
export declare const F_Ref: unique symbol;
export declare type F_Ref = typeof F_Ref;
export declare type ToRef<X extends unknown[]> = Ref<X[number]>[] & {
    [P in Exclude<keyof X, keyof any[]>]: Ref<X[P] & X[number]>;
};
export declare type ToRefMap<X extends [object, unknown]> = [Ref<X[0]>, Ref<X[1]>][];
declare module 'dependent-type' {
    interface TypeFuncs<C, X> {
        [F_F]: X extends C ? X : BadApp<Fun<typeof F_F, C>, X>;
        [F_C]: C;
        [F_ID]: X;
        [F_ArrArgs]: ToRef<X & unknown[]>;
        [F_MapArr]: X extends [object, unknown] ? [X[0], X[1]][] : BadApp<Fun<typeof F_MapArr, C>, X>;
        [F_ToMap]: X extends [object, unknown] ? Map<X[0], X[1]> : BadApp<Fun<typeof F_ToMap, C>, X>;
        [F_MapArgs]: X extends [object, unknown] ? ToRefMap<X> : BadApp<Fun<typeof F_ArrArgs, C>, X>;
        [F_Destructable]: ObsWithOrigin<C[0 & keyof C][X & Exclude<keyof C[0 & keyof C], ArrKeys>] & C[0 & keyof C][keyof C[0 & keyof C] & number], C[1 & keyof C], C[2 & keyof C]>;
        [F_Ref]: Ref<C[X & Exclude<keyof C, ArrKeys>] & C[keyof C & number]>;
    }
}
export declare type ArrayCim = {
    T: [never, Ref<unknown>[]];
    V: [never, unknown[]];
    C: [null, null];
    D: [null, null];
    A: [never, unknown[]];
};
export declare type ArrayTypeKeys = {
    T: typeof F_ArrArgs;
    V: typeof F_ID;
    C: typeof F_C;
    D: typeof F_C;
    A: typeof F_ID;
};
export declare const ArrayN = 1;
export declare type ArrayN = typeof ArrayN;
export declare type ArrayHandler<EH extends EHConstraint<EH, ECtx>, ECtx> = CtxH<unknown[], ArrayCim, ArrayTypeKeys, ArrayN, EH, ECtx>;
export declare const ArrayHandler: <EH extends EHConstraint<EH, ECtx>, ECtx>() => CtxH<unknown[], ArrayCim, ArrayTypeKeys, 1, EH, ECtx>;
export declare type ArrayDestructable<A extends unknown[], EH extends EHConstraint<EH, ECtx>, ECtx> = Destructable<unknown[], ArrayCim, ArrayTypeKeys, A, ArrayN, EH, ECtx>;
export declare type ArrayWithOrigin<A extends unknown[], EH extends EHConstraint<EH, ECtx>, ECtx> = ObsWithOrigin<A, EH, ECtx> & {
    origin: ArrayDestructable<A, EH, ECtx>;
};
export declare const wrapArray: <EH extends EHConstraint<EH, ECtx> & {
    Array: CtxH<unknown[], ArrayCim, ArrayTypeKeys, 1, EH, ECtx>;
}, ECtx>(handlers: EH) => <A extends unknown[]>(args: DeepDestructable<AppX<"A", ArrayCim, ArrayTypeKeys, A>, 1, EH, ECtx>, ...teardownList: TeardownLogic[]) => ArrayDestructable<A, EH, ECtx>;
export declare const toArray: <EH extends EHConstraint<EH, ECtx> & {
    Array: CtxH<unknown[], ArrayCim, ArrayTypeKeys, 1, EH, ECtx>;
}, ECtx>(deref: deref<EH, ECtx>) => <T extends unknown[]>(p: Ref<T>) => import("rxjs").Observable<AppX<"V", ArrayCim, ArrayTypeKeys, T>> & {
    parent: ObsWithOrigin<AppX<"V", ArrayCim, ArrayTypeKeys, T>, EH, ECtx>;
    origin: import("./types").TypedDestructable<AppX<"V", ArrayCim, ArrayTypeKeys, T>, EH, ECtx>;
    readonly destroyed: boolean;
} & {
    origin: Destructable<unknown[], ArrayCim, ArrayTypeKeys, T, 1, EH, ECtx, (v: AppX<"V", ArrayCim, ArrayTypeKeys, T>) => void>;
};
export declare type JsonCim = {
    T: [never, JsonObject];
    V: [never, JsonObject];
    C: [null, null];
    D: [never, JsonObject];
    A: [[], []];
};
export declare type JsonTypeKeys = {
    T: typeof F_ID;
    V: typeof F_ID;
    C: typeof F_C;
    D: typeof F_ID;
    A: typeof F_C;
};
export declare type JsonHandler<EH extends EHConstraint<EH, ECtx>, ECtx> = CtxH<JsonObject, JsonCim, JsonTypeKeys, 1, EH, ECtx>;
export declare const JsonHandler: <EH extends EHConstraint<EH, ECtx>, ECtx>() => CtxH<JsonObject, JsonCim, JsonTypeKeys, 1, EH, ECtx>;
export declare type JsonDestructable<X extends JsonObject, EH extends EHConstraint<EH, ECtx>, ECtx> = Destructable<JsonObject, JsonCim, JsonTypeKeys, X, 1, EH, ECtx>;
export declare const wrapJson: <EH extends EHConstraint<EH, ECtx> & {
    Json: CtxH<JsonObject, JsonCim, JsonTypeKeys, 1, EH, ECtx>;
}, ECtx>(handlers: EH) => <X extends JsonObject>(data: X, ...teardownList: TeardownLogic[]) => JsonDestructable<X, EH, ECtx>;
export declare const toJson: <EH extends EHConstraint<EH, ECtx> & {
    Json: CtxH<JsonObject, JsonCim, JsonTypeKeys, 1, EH, ECtx>;
}, ECtx>(deref: deref<EH, ECtx>) => (p: Ref<JsonObject>) => import("rxjs").Observable<JsonObject> & {
    parent: ObsWithOrigin<JsonObject, EH, ECtx>;
    origin: import("./types").TypedDestructable<JsonObject, EH, ECtx>;
    readonly destroyed: boolean;
} & {
    origin: Destructable<JsonObject, JsonCim, JsonTypeKeys, JsonObject, 1, EH, ECtx, (v: JsonObject) => void>;
};
