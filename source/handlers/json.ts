/// <reference path="../../typings/deep-is.d.ts" />

import type { EHConstraint, deref, SerialObs } from '../types/serial';
import type { Ref, JsonObject, Json as Json, TeardownAction } from '../types/basic';
import type { CtxH } from '../types/store';
import type { KeysOfType } from 'dependent-type';

import * as origin from '../origin';
import equal from 'deep-is';
import { F_C, F_ID } from '../handlers/common';

export namespace json {
  export type dom = JsonObject;
  export type cim = { T: [never, JsonObject], V: [never, JsonObject], C: [null, null], D: [never, JsonObject], A: [[], []] };
  export type keys = { T: F_ID, V: F_ID, C: F_C, D: F_ID, A: F_C };
  export const n = 1;
  export type n = typeof n;

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

  export type Handler<EH extends EHConstraint<EH, ECtx>, ECtx> = CtxH<dom, cim, keys, n, EH, ECtx>;
  export const Handler = <EH extends EHConstraint<EH, ECtx>, ECtx>(): Handler<EH, ECtx> => ({
    decode: () => (_id, data) => ({ args: [] as [], data, n }),
    encode: () => ({ data, old }) => old && equal(data, old) ? undefined : clone(data),
    ctr: <X extends dom>(
      _: [], data: X, _c: null, old: X | null
    ) => old ? deepUpdate(old, data) : data,
  });
  export type Origin<X extends dom, EH extends EHConstraint<EH, ECtx>, ECtx> = origin.Origin<dom, cim, keys, X, n, EH, ECtx>;
  export type Serial<X extends dom, EH extends EHConstraint<EH, ECtx>, ECtx> = SerialObs<dom, cim, keys, X, n, EH, ECtx>;

  export const create = <EH extends EHConstraint<EH, ECtx> & { Json: Handler<EH, ECtx> }, ECtx>(getHandler: <R>(k: KeysOfType<EHConstraint<EH, ECtx>, R>) => R) => <X extends JsonObject>(
    data: X, ...teardownList: TeardownAction[]
  ): Origin<X, EH, ECtx> => new origin.Origin(getHandler, 'Json', null, { args: [] as [], data, n }, undefined, ...teardownList);

  export const cast = <EH extends EHConstraint<EH, ECtx> & { Json: Handler<EH, ECtx> }, ECtx>(
    deref: deref<EH, ECtx>
  ) => (p: Ref<cim['V'][1]>) => deref<0, [[dom, cim]], [keys], [cim['V'][1]], [n]>(p, 'Json');

}