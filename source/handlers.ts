/// <reference path="../typings/deep-is.d.ts" />

import { CtxH, Ref, EHConstraint, DestructableCtr, ref, CtxEH, JsonObject, Json, TVCDA_CIM } from './types';
import { DeepDestructable, TypedDestructable, Destructable, EntryObs, TwoDestructable } from './destructable';
import { map as dep_map, AppX, DepConstaint } from 'dependent-type';
import type { BadApp, Fun } from 'dependent-type';
import { toCond } from '../utils/guards';
import { deref } from '.';
import { identity, TeardownLogic } from 'rxjs';
import equal from 'deep-is';

const { depMap } = dep_map;

/** @summary Filters X by C */
export declare const F_F: unique symbol;
/** @summary Returns constant C */
export declare const F_C: unique symbol;
/** @summary Identity */
export declare const F_ID: unique symbol;


export type F_F = typeof F_F;
export type F_C = typeof F_C;
export type F_ID = typeof F_ID;

export declare const F_MapArr: unique symbol;
export type F_MapArr = typeof F_MapArr;
export declare const F_ArrArgs: unique symbol;
export type F_ArrArgs = typeof F_ArrArgs;
export declare const F_MapArgs: unique symbol;
export type F_MapArgs = typeof F_MapArgs;
export declare const F_ToMap: unique symbol;
export type F_ToMap = typeof F_ToMap;
export declare const F_Destructable: unique symbol;
export type F_Destructable = typeof F_Destructable;
export declare const F_Ref: unique symbol;
export type F_Ref = typeof F_Ref;

export type ToRef<X extends unknown[]> = Ref<unknown>[] & { [P in Exclude<keyof X, keyof any[]>]: Ref<X[P]> };
export type ToRefMap<X extends [object, unknown]> = [Ref<X[0]>, Ref<X[1]>][];
declare module 'dependent-type' {
  export interface TypeFuncs<C, X> {
    [F_F]: X extends C ? X : BadApp<Fun<typeof F_F, C>, X>;
    [F_C]: C,
    [F_ID]: X,
    [F_ArrArgs]: X extends unknown[] ? ToRef<X> : BadApp<Fun<typeof F_ArrArgs, C>, X>,
    [F_MapArr]: X extends [object, unknown] ? [X[0], X[1]][] : BadApp<Fun<typeof F_MapArr, C>, X>,
    [F_ToMap]: X extends [object, unknown] ? Map<X[0], X[1]> : BadApp<Fun<typeof F_ToMap, C>, X>,
    [F_MapArgs]: X extends [object, unknown] ? ToRefMap<X> : BadApp<Fun<typeof F_ArrArgs, C>, X>,
    [F_Destructable]: TypedDestructable<C[0 & keyof C][X & keyof C[0 & keyof C]], C[1 & keyof C], C[2 & keyof C]>,
    [F_Ref]: Ref<C[X & keyof C]>,
  }
}


export declare const F_Any: unique symbol;

declare module 'dependent-type' {
  export interface TypeFuncs<C, X> {
    [F_Any]: any,
  }
}


export type ArrayCim = { T: [never, Ref<any>[]], V: [never, unknown[]], C: [null, null], D: [null, null], A: [never, unknown[]] };
export type ArrayTypeKeys = { T: typeof F_ArrArgs, V: typeof F_ID, C: typeof F_C, D: typeof F_C, A: typeof F_ID };
export const ArrayN = 1;
export type ArrayN = typeof ArrayN;

export const ArrayCtr: DestructableCtr<unknown[], ArrayCim, ArrayTypeKeys> = <X extends unknown[]>(x: X, _d: null, _c: null, old: unknown[] | null) => {
  if (old) { old.splice(0); x = Object.assign(old, x); }
  return x;
}

export type ArrayHandler<EH extends EHConstraint<EH, ECtx>, ECtx> = CtxH<unknown[], ArrayCim, ArrayTypeKeys, ArrayN, EH, ECtx>;
export const ArrayHandler = <EH extends EHConstraint<EH, ECtx>, ECtx>(): ArrayHandler<EH, ECtx> => ({
  decode: ({ deref }) => (_id, data) => ({ args: data.map(ref => deref(ref)) as any, data: null, n: ArrayN }),
  encode: ({ ref }) => <C extends unknown[]>({ args }: { args: DeepDestructable<C, ArrayN, EH, ECtx> }): AppX<'T', ArrayCim, ArrayTypeKeys, C> => toCond<unknown[], C, ToRef<C>>(
    depMap<Exclude<keyof C, keyof any[]>, [
      [[C, EH, ECtx], TypedDestructable<C[number], EH, ECtx>],
      [C, Ref<C[Exclude<keyof C, keyof any[]>]>],
    ], [typeof F_Destructable, typeof F_Ref]>(args, ref)),
  ctr: ArrayCtr,
});

export type ArrayDestructable<A extends unknown[], EH extends EHConstraint<EH, ECtx>, ECtx> = Destructable<unknown[], ArrayCim, ArrayTypeKeys, A, ArrayN, EH, ECtx>;
export const wrapArray = <EH extends EHConstraint<EH, ECtx> & { Array: ArrayHandler<EH, ECtx> }, ECtx>(handlers: EH) => <A extends unknown[]>(
  args: DeepDestructable<A, ArrayN, EH, ECtx>, ...teardownList: TeardownLogic[]
): ArrayDestructable<A, EH, ECtx> => new Destructable(
  handlers, 'Array', null, { data: null, args, n: ArrayN }, undefined, ...teardownList
);

export const toArray = <EH extends EHConstraint<EH, ECtx> & { Array: ArrayHandler<EH, ECtx> }, ECtx>(
  deref: deref<EH, ECtx>
) => <T extends unknown[]>(p: Ref<T>) => deref<0, [[unknown[], ArrayCim]], [ArrayTypeKeys], [T], [ArrayN]>(p, 'Array');

// export type MapCim = { T: [never, [Ref<object>, Ref<unknown>][]], V: [never, Map<object, unknown>], C: [null, null], D: [null, null], A: [never, [object, unknown][]] };
// export type MapTypeKeys = { T: typeof F_MapArgs, V: typeof F_ToMap, C: typeof F_C, D: typeof F_C, A: typeof F_MapArr };
// export const MapN = 2;
// export type MapN = typeof MapN;
// export const MapCtr: DestructableCtr<[object, unknown], MapCim, MapTypeKeys> = <X extends [object, unknown]>(
//   args: [X[0], X[1]][], _d: null, _c: null, old: Map<X[0], X[1]> | null
// ): AppX<"V", MapCim, MapTypeKeys, X> => {
//   const res = toCond<[object, unknown], X, Map<X[0], X[1]>>(old ?? new Map);
//   if (old) { old.clear(); };
//   args.forEach(([k, v]) => res.set(k, v));
//   return res;
// }

// export type MapHandler<EH extends EHConstraint<EH, ECtx>, ECtx> = CtxH<[object, unknown], MapCim, MapTypeKeys, MapN, EH, ECtx>;
// export const MapHandler = <EH extends EHConstraint<EH, ECtx>, ECtx>(): MapHandler<EH, ECtx> => ({
//   decode: ({ deref }) => <X extends [object, unknown]>(_id: string, data: AppX<"T", MapCim, MapTypeKeys, X>): EntryObs<null, AppX<"A", MapCim, MapTypeKeys, X>, 2, EH, ECtx> => ({ 
//     args: data.map<[TypedDestructable<X[0], EH, ECtx>, TypedDestructable<X[1], EH, ECtx>]>(ref => [deref(ref[0]), deref(ref[1])]) as any as DeepDestructable<[X[0], X[1]][], 2, EH, ECtx>
//     , data: null, n: MapN,
//    }),
//   encode: ({ ref }) => <C extends unknown[]>({ args }: { args: DeepDestructable<C, 1, EH, ECtx> }): AppX<'T', MapCim, MapTypeKeys, C> => toCond<unknown[], C, ToRef<C>>(
//     depMap<Exclude<keyof C, keyof any[]>, [
//       [[C, EH, ECtx], TypedDestructable<C[number], EH, ECtx>],
//       [C, Ref<C[Exclude<keyof C, keyof any[]>]>],
//     ], [typeof F_Destructable, typeof F_Ref]>(args, ref)),
//   ctr: MapCtr,
// });

// export type MapDestructable<A extends unknown[], EH extends EHConstraint<EH, ECtx>, ECtx> = Destructable<unknown[], MapCim, MapTypeKeys, A, 1, EH, ECtx>;
// export const wrapMap = <EH extends EHConstraint<EH, ECtx> & { Map: MapHandler<EH, ECtx> }, ECtx>(handlers: EH) => <A extends unknown[]>(
//   args: DeepDestructable<A, 1, EH, ECtx>, ...teardownList: TeardownLogic[]
// ): MapDestructable<A, EH, ECtx> => new Destructable(
//   handlers, 'Map', null, { data: null, args, n: 1 }, undefined, ...teardownList
// );

// export const toMap = <EH extends EHConstraint<EH, ECtx> & { Map: MapHandler<EH, ECtx> }, ECtx>(
//   deref: deref<EH, ECtx>
// ) => <T>(p: Ref<T[]>) => deref<0, [[unknown[], MapCim]], [MapTypeKeys], [T[]], [1]>(p, 'Map');



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
export const JsonCtr: DestructableCtr<JsonObject, JsonCim, JsonTypeKeys> = <X extends JsonObject>(
  _: [], data: X, _c: null, old: X | null
) => old ? deepUpdate(old, data) : data;

const clone = <T extends Json>(o: T): T => {
  return o === null ? o : o instanceof Array ? o.map(clone) as T : typeof o === 'object' ? Object.fromEntries(Object.entries(o as JsonObject).map(([k, v]) => [k, clone(v)])) as T : o;
};

export type JsonHandler<EH extends EHConstraint<EH, ECtx>, ECtx> = CtxH<JsonObject, JsonCim, JsonTypeKeys, 1, EH, ECtx>;
export const JsonHandler = <EH extends EHConstraint<EH, ECtx>, ECtx>(): JsonHandler<EH, ECtx> => ({
  decode: () => (_id, data) => ({ args: [] as [], data, n: 1 }),
  encode: () => ({ data, old }) => old && equal(data, old) ? undefined : clone(data),
  ctr: JsonCtr,
});
export type JsonDestructable<X extends JsonObject, EH extends EHConstraint<EH, ECtx>, ECtx> = Destructable<JsonObject, JsonCim, JsonTypeKeys, X, 1, EH, ECtx>;
export const wrapJson = <EH extends EHConstraint<EH, ECtx> & { Json: JsonHandler<EH, ECtx> }, ECtx>(handlers: EH) => <X extends JsonObject>(
  data: X, ...teardownList: TeardownLogic[]
): JsonDestructable<X, EH, ECtx> => new Destructable(
  handlers, 'Json', null, { args: [] as [], data, n: 1 }, undefined, ...teardownList
);

export const toJson = <EH extends EHConstraint<EH, ECtx> & { Json: JsonHandler<EH, ECtx> }, ECtx>(
  deref: deref<EH, ECtx>
) => (p: Ref<JsonObject>) => deref<0, [[JsonObject, JsonCim]], [JsonTypeKeys], [JsonObject], [1]>(p, 'Json');

