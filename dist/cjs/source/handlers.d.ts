/// <reference path="../../../typings/deep-is.d.ts" />
import { CtxH, Ref, EHConstraint, JsonObject } from './types';
import { DeepDestructable, TypedDestructable, Destructable } from './destructable';
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
export declare type ToRef<X extends unknown[]> = Ref<unknown>[] & {
    [P in Exclude<keyof X, keyof any[]>]: Ref<X[P]>;
};
export declare type ToRefMap<X extends [object, unknown]> = [Ref<X[0]>, Ref<X[1]>][];
declare module 'dependent-type' {
    interface TypeFuncs<C, X> {
        [F_F]: X extends C ? X : BadApp<Fun<typeof F_F, C>, X>;
        [F_C]: C;
        [F_ID]: X;
        [F_ArrArgs]: X extends unknown[] ? ToRef<X> : BadApp<Fun<typeof F_ArrArgs, C>, X>;
        [F_MapArr]: X extends [object, unknown] ? [X[0], X[1]][] : BadApp<Fun<typeof F_MapArr, C>, X>;
        [F_ToMap]: X extends [object, unknown] ? Map<X[0], X[1]> : BadApp<Fun<typeof F_ToMap, C>, X>;
        [F_MapArgs]: X extends [object, unknown] ? ToRefMap<X> : BadApp<Fun<typeof F_ArrArgs, C>, X>;
        [F_Destructable]: TypedDestructable<C[0 & keyof C][X & keyof C[0 & keyof C]], C[1 & keyof C], C[2 & keyof C]>;
        [F_Ref]: Ref<C[X & keyof C]>;
    }
}
export declare const F_Any: unique symbol;
declare module 'dependent-type' {
    interface TypeFuncs<C, X> {
        [F_Any]: any;
    }
}
export declare type ArrayCim = {
    T: [never, Ref<any>[]];
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
export declare const wrapArray: <EH extends EHConstraint<EH, ECtx> & {
    Array: CtxH<unknown[], ArrayCim, ArrayTypeKeys, 1, EH, ECtx>;
}, ECtx>(handlers: EH) => <A extends unknown[]>(args: DeepDestructable<A, 1, EH, ECtx>, ...teardownList: TeardownLogic[]) => ArrayDestructable<A, EH, ECtx>;
export declare const toArray: <EH extends EHConstraint<EH, ECtx> & {
    Array: CtxH<unknown[], ArrayCim, ArrayTypeKeys, 1, EH, ECtx>;
}, ECtx>(deref: deref<EH, ECtx>) => <T extends unknown[]>(p: Ref<T>) => Destructable<unknown[], ArrayCim, ArrayTypeKeys, T, 1, EH, ECtx>;
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
}, ECtx>(deref: deref<EH, ECtx>) => (p: Ref<JsonObject>) => Destructable<JsonObject, JsonCim, JsonTypeKeys, JsonObject, 1, EH, ECtx>;
