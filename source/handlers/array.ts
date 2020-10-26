import type { DeepSerial, EHConstraint, TSerialObs, deref, SerialObs } from '../types/serial';
import type { Ref, JsonObject, Json, TeardownAction, ArrKeys } from '../types/basic';
import type { CtxH } from '../types/store';
import type { AppX, KeysOfType } from 'dependent-type';

import { map as dep_map } from 'dependent-type';
import * as origin from '../origin';
import { F_ArrArgs, F_C, F_ID, F_Ref, F_Serial } from './common';
const { depMap } = dep_map;

export namespace array {
  export const n = 1;
  export type n = typeof n;
  export type cim = { T: [never, Ref<unknown>[]], V: [never, unknown[]], C: [null, null], D: [null, null], A: [never, unknown[]] };
  export type dom = unknown[];
  export type keys = { T: typeof F_ArrArgs, V: typeof F_ID, C: F_C, D: F_C, A: F_ID };
  export type Handler<EH extends EHConstraint<EH, ECtx>, ECtx> = CtxH<dom, cim, keys, n, EH, ECtx>;
  export const Handler = <EH extends EHConstraint<EH, ECtx>, ECtx>(): Handler<EH, ECtx> => ({
    decode: ({ deref }) => <C extends dom>(_id: string, data: AppX<'T', cim, keys, C>) => {
      type dom = Exclude<keyof C, keyof any[]>;
      return {
        args: depMap<dom, [[C, unknown], [[C, EH, ECtx], TSerialObs<C[dom], EH, ECtx>]], [F_Ref, F_Serial]>(data, ref => deref(ref)), data: null, n
      }
    },
    encode: ({ ref }) => <C extends dom>({ args }: { args: DeepSerial<C, n, EH, ECtx> }): AppX<'T', cim, keys, C> => {
      type dom = Exclude<keyof C, keyof any[]>;
      type cim = [[[C, EH, ECtx], unknown], [C, Ref<C[dom]>],];
      const encoded: Ref<C[dom]>[] & { [X in dom]: Ref<C[X]> } = depMap<dom, cim, [typeof F_Serial, typeof F_Ref]>(
        args, <X extends dom>(x: AppX<0, cim, [typeof F_Serial], X>): AppX<0, [cim[1]], [typeof F_Ref], X> => ref<C[X & Exclude<keyof C, ArrKeys>] & C[number]>(x)
      );
      return encoded;
    },
    ctr: <X extends dom>(x: X, _d: null, _c: null, old: cim['V'][1] | null) => {
      if (old) { old.splice(0); x = Object.assign(old, x); }
      return x;
    },
  });

  export type Origin<A extends dom, EH extends EHConstraint<EH, ECtx>, ECtx> = origin.Origin<dom, cim, keys, A, n, EH, ECtx>;
  export type Serial<A extends dom, EH extends EHConstraint<EH, ECtx>, ECtx> = SerialObs<dom, cim, keys, A, n, EH, ECtx>;

  export const create = <EH extends EHConstraint<EH, ECtx> & { Array: Handler<EH, ECtx> }, ECtx>(getHandler: <R>(k: KeysOfType<EHConstraint<EH, ECtx>, R>) => R) => <A extends unknown[]>(
    args: DeepSerial<AppX<'A', cim, keys, A> & A, n, EH, ECtx>, ...teardownList: TeardownAction[]
  ): Origin<A, EH, ECtx> => new origin.Origin(getHandler, 'Array', null, { data: null, args, n }, undefined, ...teardownList);

  export const cast = <EH extends EHConstraint<EH, ECtx> & { Array: Handler<EH, ECtx> }, ECtx>(
    deref: deref<EH, ECtx>
  ) => <T extends unknown[]>(p: Ref<T>) => deref<0, [[unknown[], cim]], [keys], [T], [n]>(p, 'Array');
  
}




