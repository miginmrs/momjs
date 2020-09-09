import { CtxH, Ref, EHConstraint, DestructableCtr, CtxEH, JsonObject, Json } from './types';
import { DeepDestructable, TypedDestructable, Destructable } from './destructable';
import { asyncDepMap } from 'dependent-type/dist/cjs/map';
import { toCond } from '../utils/guards';
import { deref, KeysOfType } from '.';
import { TeardownLogic } from 'rxjs';
import equal from 'deep-is';
import { QuickPromise } from '../utils/quick-promise';

/** @summary Filters X by C */
export declare const F_F: unique symbol;
/** @summary Returns constant C */
export declare const F_C: unique symbol;
/** @summary Identity */
export declare const F_ID: unique symbol;

export declare const F_ArrArgs: unique symbol;
export declare const F_Destructable: unique symbol;
export declare const F_Ref: unique symbol;

export type ToRef<X extends any[]> = Ref<any>[] & { [P in Exclude<keyof X, keyof any[]>]: Ref<X[P]> };
declare module 'dependent-type' {
  export interface TypeFuncs<C, X> {
    [F_F]: X extends C ? X : BadApp<Fun<typeof F_F, C>, X>;
    [F_C]: C,
    [F_ID]: X,
    [F_ArrArgs]: X extends any[] ? ToRef<X> : BadApp<Fun<typeof F_ArrArgs, C>, X>,
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


export type ArrayCim = { T: [never, Ref<any>[]], V: [never, any[]], C: [null, null], D: [null, null], A: [never, any[]] };
export type ArrayTypeKeys = { T: typeof F_ArrArgs, V: typeof F_ID, C: typeof F_C, D: typeof F_C, A: typeof F_ID };

export const ArrayCtr: DestructableCtr<any[], ArrayCim, ArrayTypeKeys> = <X extends any[]>(x: X, _d: null, _c: null, old: any[] | null) => {
  if (old) { old.splice(0); x = Object.assign(old, x); }
  return x;
}

export type ArrayHandler<EH extends EHConstraint<EH, ECtx>, ECtx> = CtxH<any[], ArrayCim, ArrayTypeKeys, 1, EH, ECtx>;
export const ArrayHandler = <EH extends EHConstraint<EH, ECtx>, ECtx>(): ArrayHandler<EH, ECtx> => ({
  decode: ({ deref }) => (_id, data) => ({ args: data.map(ref => deref(ref)) as any, data: null, n: 1 }),
  encode: ({ ref }) => <C extends any[]>({ args }: { args: DeepDestructable<C, 1, EH, ECtx> }) =>
    asyncDepMap<Exclude<keyof C, keyof any[]>, [
      [[C, EH, ECtx], TypedDestructable<C[number], EH, ECtx>],
      [C, Ref<C[Exclude<keyof C, keyof any[]>]>],
    ], [typeof F_Destructable, typeof F_Ref]>(args, ref, QuickPromise).then(v => toCond<any[], C, ToRef<C>, any>(v)),
  ctr: ArrayCtr,
});

export type ArrayDestructable<A extends any[], EH extends EHConstraint<EH, ECtx>, ECtx> = Destructable<any[], ArrayCim, ArrayTypeKeys, A, 1, EH, ECtx>;
export const wrapArray = <A extends any[], EH extends EHConstraint<EH, ECtx> & { Array: ArrayHandler<EH, ECtx> }, ECtx>(args: DeepDestructable<A, 1, EH, ECtx>, handlers: EH, ...teardownList: TeardownLogic[]): ArrayDestructable<A, EH, ECtx> => new Destructable(
  handlers, 'Array', null, { data: null, args, n: 1 }, undefined, ...teardownList
);

export const toArray = <EH extends EHConstraint<EH, ECtx> & { Array: ArrayHandler<EH, ECtx> }, ECtx>(
  deref: deref<EH, ECtx>
) => (p: Ref<any[]>) => deref<0, [[any[], ArrayCim]], [ArrayTypeKeys], [any[]], [1]>(p, 'Array');


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
export const wrapJson = <X extends JsonObject, EH extends EHConstraint<EH, ECtx> & { Json: JsonHandler<EH, ECtx> }, ECtx>(data: X, handlers: EH, ...teardownList: TeardownLogic[]): JsonDestructable<X, EH, ECtx> => new Destructable(
  handlers, 'Json', null, { args: [] as [], data, n: 1 }, undefined, ...teardownList
);

export const toJson = <EH extends EHConstraint<EH, ECtx> & { Json: JsonHandler<EH, ECtx> }, ECtx>(
  deref: deref<EH, ECtx>
) => (p: Ref<JsonObject>) => deref<0, [[JsonObject, JsonCim]], [JsonTypeKeys], [JsonObject], [1]>(p, 'Json');

