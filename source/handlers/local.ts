
import type { EHConstraint } from '../types/serial';
import type { TeardownAction } from '../types/basic';
import type { CtxH } from '../types/store';
import type { KeysOfType } from 'dependent-type';

import * as origin from '../origin';
import { F_C, F_ID } from '../handlers/common';


export namespace local {
  export type dom = object;
  export type cim = { T: [null, null], V: [never, object], C: [null, null], D: [never, object], A: [[], []] };
  export type keys = { T: typeof F_C, V: typeof F_ID, C: typeof F_C, D: typeof F_ID, A: typeof F_C };

  export type Handler<EH extends EHConstraint<EH, ECtx>, ECtx> = CtxH<dom, cim, keys, 1, EH, ECtx>;
  export const Handler = <EH extends EHConstraint<EH, ECtx>, ECtx>(): Handler<EH, ECtx> => ({
    decode: () => () => ({ args: [], data: {} as any, c: null, n: 1 }),
    encode: () => () => null,
    ctr: <X extends dom>([]: [], data: X): X => data,
  });

  export type Origin<X extends object, EH extends EHConstraint<EH, ECtx>, ECtx> = origin.Origin<object, cim, keys, X, 1, EH, ECtx>;

  export const create = <EH extends EHConstraint<EH, ECtx> & { Local: Handler<EH, ECtx> }, ECtx>(getHandler: <R>(k: KeysOfType<EHConstraint<EH, ECtx>, R>) => R) => <X extends object>(
    data: X, ...teardownList: TeardownAction[]
  ): Origin<X, EH, ECtx> => new origin.Origin(getHandler, 'Local', null, { args: [] as [], data, n: 1 }, undefined, ...teardownList);

}
