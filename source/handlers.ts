/// <reference path="../typings/deep-is.d.ts" />

import type { DeepDestructable, EHConstraint, ObsWithOrigin, deref } from './types/destructable';
import type { Ref, JsonObject, Json, TeardownAction, ArrKeys } from './types/basic';
import type { CtxH } from './types/store';
import type { AppX, KeysOfType } from 'dependent-type';

import { map as dep_map } from 'dependent-type';
import { Destructable } from './destructable';
import equal from 'deep-is';

const { depMap } = dep_map;

/** @summary Returns constant C */
export declare const F_C: unique symbol;
/** @summary Identity */
export declare const F_ID: unique symbol;


export type F_C = typeof F_C;
export type F_ID = typeof F_ID;

export declare const F_MapArr: unique symbol;
export type F_MapArr = typeof F_MapArr;
export declare const F_ArrArgs: unique symbol;
export type F_ArrArgs = typeof F_ArrArgs;
export declare const F_Destructable: unique symbol;
export type F_Destructable = typeof F_Destructable;
export declare const F_Ref: unique symbol;
export type F_Ref = typeof F_Ref;

export type ToRef<X extends unknown[]> = Ref<X[number]>[] & { [P in Exclude<keyof X, keyof any[]>]: Ref<X[P] & X[number]> };
export type ToRefMap<X extends [object, unknown]> = [Ref<X[0]>, Ref<X[1]>][];
declare module 'dependent-type' {
  export interface TypeFuncs<C, X> {
    [F_C]: C,
    [F_ID]: X,
    [F_ArrArgs]: ToRef<X & unknown[]>,
    [F_Destructable]: ObsWithOrigin<C[0 & keyof C][X & Exclude<keyof C[0 & keyof C], ArrKeys>] & C[0 & keyof C][keyof C[0 & keyof C] & number], C[1 & keyof C], C[2 & keyof C]>,
    [F_Ref]: Ref<C[X & Exclude<keyof C, ArrKeys>] & C[keyof C & number]>,
  }
}
export type TVCDA_FC = { T: typeof F_C, V: typeof F_C, C: typeof F_C, D: typeof F_C, A: typeof F_C };


export type ArrayCim = { T: [never, Ref<unknown>[]], V: [never, unknown[]], C: [null, null], D: [null, null], A: [never, unknown[]] };
export type ArrayTypeKeys = { T: typeof F_ArrArgs, V: typeof F_ID, C: typeof F_C, D: typeof F_C, A: typeof F_ID };
export const ArrayN = 1;
export type ArrayN = typeof ArrayN;

export type ArrayHandler<EH extends EHConstraint<EH, ECtx>, ECtx> = CtxH<unknown[], ArrayCim, ArrayTypeKeys, ArrayN, EH, ECtx>;
export const ArrayHandler = <EH extends EHConstraint<EH, ECtx>, ECtx>(): ArrayHandler<EH, ECtx> => ({
  decode: ({ deref }) => <C extends unknown[]>(_id: string, data: AppX<'T', ArrayCim, ArrayTypeKeys, C>) => {
    type dom = Exclude<keyof C, keyof any[]>;
    return {
      args: depMap<dom, [[C, unknown], [[C, EH, ECtx], ObsWithOrigin<C[dom], EH, ECtx>]], [F_Ref, F_Destructable]>(
        data, ref => deref(ref)), data: null, n: ArrayN
    }
  },
  encode: ({ ref }) => <C extends unknown[]>({ args }: { args: DeepDestructable<C, ArrayN, EH, ECtx> }): AppX<'T', ArrayCim, ArrayTypeKeys, C> => {
    type dom = Exclude<keyof C, keyof any[]>;
    type cim = [[[C, EH, ECtx], unknown], [C, Ref<C[dom]>],];
    const encoded: Ref<C[dom]>[] & { [X in dom]: Ref<C[X]> } = depMap<dom, cim, [typeof F_Destructable, typeof F_Ref]>(
      args, <X extends dom>(x: AppX<0, cim, [typeof F_Destructable], X>): AppX<0, [cim[1]], [typeof F_Ref], X> => ref<C[X & Exclude<keyof C, ArrKeys>] & C[number]>(x)
    );
    return encoded;
  },
  ctr: <X extends unknown[]>(x: X, _d: null, _c: null, old: unknown[] | null) => {
    if (old) { old.splice(0); x = Object.assign(old, x); }
    return x;
  },
});

export type ArrayDestructable<A extends unknown[], EH extends EHConstraint<EH, ECtx>, ECtx> = Destructable<unknown[], ArrayCim, ArrayTypeKeys, A, ArrayN, EH, ECtx>;
export type ArrayWithOrigin<A extends unknown[], EH extends EHConstraint<EH, ECtx>, ECtx> = ObsWithOrigin<A, EH, ECtx> & {
  origin: ArrayDestructable<A, EH, ECtx>
};
export const wrapArray = <EH extends EHConstraint<EH, ECtx> & { Array: ArrayHandler<EH, ECtx> }, ECtx>(getHandler: <R>(k: KeysOfType<EHConstraint<EH, ECtx>, R>) => R) => <A extends unknown[]>(
  args: DeepDestructable<AppX<'A', ArrayCim, ArrayTypeKeys, A> & A, ArrayN, EH, ECtx>, ...teardownList: TeardownAction[]
): ArrayDestructable<A, EH, ECtx> => new Destructable(
  getHandler, 'Array', null, { data: null, args, n: ArrayN }, undefined, ...teardownList
);

export const toArray = <EH extends EHConstraint<EH, ECtx> & { Array: ArrayHandler<EH, ECtx> }, ECtx>(
  deref: deref<EH, ECtx>
) => <T extends unknown[]>(p: Ref<T>) => deref<0, [[unknown[], ArrayCim]], [ArrayTypeKeys], [T], [ArrayN]>(p, 'Array');

export type JsonCim = { T: [never, JsonObject], V: [never, JsonObject], C: [null, null], D: [never, JsonObject], A: [[], []] };
export type JsonTypeKeys = { T: typeof F_ID, V: typeof F_ID, C: typeof F_C, D: typeof F_ID, A: typeof F_C };
const deepUpdate = <T extends JsonObject>(target: JsonObject, source: T) => {
  const keys = (o: JsonObject) => Object.keys(o) as never[];
  const onlyTargetKeys = new Set(keys(target));
  for (const key of keys(source)) {
    onlyTargetKeys.delete(key);
    const targetItem = target[key] as Json | undefined, sourceItem = source[key] as Json;
    if (targetItem && sourceItem && typeof targetItem === 'object' && typeof sourceItem === 'object' && Array.isArray(targetItem) === Array.isArray(sourceItem)) {
      deepUpdate(targetItem, sourceItem);
    } else target[key] = sourceItem as never;
  }
  for (const key of onlyTargetKeys) delete target[key];
  return target as T;
}

const clone = <T extends Json>(o: T): T => {
  return o === null ? o : o instanceof Array ? o.map(clone) as T : typeof o === 'object' ? Object.fromEntries(Object.entries(o as JsonObject).map(([k, v]) => [k, clone(v)])) as T : o;
};

export type JsonHandler<EH extends EHConstraint<EH, ECtx>, ECtx> = CtxH<JsonObject, JsonCim, JsonTypeKeys, 1, EH, ECtx>;
export const JsonHandler = <EH extends EHConstraint<EH, ECtx>, ECtx>(): JsonHandler<EH, ECtx> => ({
  decode: () => (_id, data) => ({ args: [] as [], data, n: 1 }),
  encode: () => ({ data, old }) => old && equal(data, old) ? undefined : clone(data),
  ctr: <X extends JsonObject>(
    _: [], data: X, _c: null, old: X | null
  ) => old ? deepUpdate(old, data) : data,
});
export type JsonDestructable<X extends JsonObject, EH extends EHConstraint<EH, ECtx>, ECtx> = Destructable<JsonObject, JsonCim, JsonTypeKeys, X, 1, EH, ECtx>;
export const wrapJson = <EH extends EHConstraint<EH, ECtx> & { Json: JsonHandler<EH, ECtx> }, ECtx>(getHandler: <R>(k: KeysOfType<EHConstraint<EH, ECtx>, R>) => R) => <X extends JsonObject>(
  data: X, ...teardownList: TeardownAction[]
): JsonDestructable<X, EH, ECtx> => new Destructable(
  getHandler, 'Json', null, { args: [] as [], data, n: 1 }, undefined, ...teardownList
);

export const toJson = <EH extends EHConstraint<EH, ECtx> & { Json: JsonHandler<EH, ECtx> }, ECtx>(
  deref: deref<EH, ECtx>
) => (p: Ref<JsonObject>) => deref<0, [[JsonObject, JsonCim]], [JsonTypeKeys], [JsonObject], [1]>(p, 'Json');



export type LocalCim = { T: [null, null], V: [never, object], C: [null, null], D: [never, object], A: [[], []] };
export type LocalTypeKeys = { T: typeof F_C, V: typeof F_ID, C: typeof F_C, D: typeof F_ID, A: typeof F_C };

export type LocalHandler<EH extends EHConstraint<EH, ECtx>, ECtx> = CtxH<object, LocalCim, LocalTypeKeys, 1, EH, ECtx>;
export const LocalHandler = <EH extends EHConstraint<EH, ECtx>, ECtx>(): LocalHandler<EH, ECtx> => ({
  decode: () => () => ({ args: [], data: {} as any, c: null, n: 1 }),
  encode: () => () => null,
  ctr: <X extends object>([]: [], data: X): X => data,
});

export type LocalDestructable<X extends object, EH extends EHConstraint<EH, ECtx>, ECtx> = Destructable<object, LocalCim, LocalTypeKeys, X, 1, EH, ECtx>;

export const wrapLocal = <EH extends EHConstraint<EH, ECtx> & { Local: LocalHandler<EH, ECtx> }, ECtx>(getHandler: <R>(k: KeysOfType<EHConstraint<EH, ECtx>, R>) => R) => <X extends object>(
  data: X, ...teardownList: TeardownAction[]
): LocalDestructable<X, EH, ECtx> => new Destructable(
  getHandler, 'Local', null, { args: [] as [], data, n: 1 }, undefined, ...teardownList
);
