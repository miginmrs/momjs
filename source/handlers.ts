import { CtxRequestHandler, Ref, GlobalRef, DestructableCtr } from "./types";
import { identity } from "rxjs";
import { DeepDestructable, Destructable } from "./destructable";
import { depMap } from "../utils/dep-map";
import { toCond } from "../utils/guards";
import { AppX } from "../utils/dependent-type";

/** @summary Filters X by C */
export declare const F_F: unique symbol;
/** @summary Returns constant C */
export declare const F_C: unique symbol;
/** @summary Identity */
export declare const F_ID: unique symbol;

declare const F_ArrArgs: unique symbol;
declare const F_Destructable: unique symbol;
declare const F_Ref: unique symbol;

type ToRef<X extends any[]> = Ref<any>[] & { [P in number & keyof X]: Ref<X[P]> };
declare module '../utils/dependent-type' {
  export interface TypeFuncs<C, X> {
    [F_F]: X extends C ? X : BadApp<Fun<typeof F_F, C>, X>;
    [F_C]: C,
    [F_ID]: X,
    [F_ArrArgs]: X extends any[] ? ToRef<X> : BadApp<Fun<typeof F_ArrArgs, C>, X>,
    [F_Destructable]: Destructable<C[X & keyof C], any, any, any>,
    [F_Ref]: GlobalRef<C[X & keyof C]>,
  }
}


export type ArrayCim = { T: [never, Ref<any>[]], V: [never, any[]], C: [null, null], D: [null, null], A: [never, any[]] };
export type ArrayTypeKeys = { T: typeof F_ArrArgs, V: typeof F_ID, C: typeof F_C, D: typeof F_C, A: typeof F_ID };

const ArrayCtr = <X extends any[]>(x: X) => x
export { ArrayCtr };

export namespace RequestHandlers {
  export const Array: CtxRequestHandler<any[], ArrayCim, ArrayTypeKeys> = ({ deref, ref }) => ({
    decode: (_id, data) => ({ args: data.map(ref => deref(ref)) as any, data: null, c: null }),
    encode: <C extends any[]>(_: string, { args }: { args: DeepDestructable<C> }) => toCond<any[], C, ToRef<C>>(
      depMap<number & keyof C, [
        [C, Destructable<C[number], any, any, any>],
        [C, GlobalRef<C[number]>]
      ], [typeof F_Destructable, typeof F_Ref]>(args, ref)),
    ctr: ArrayCtr,
  });
}
export type Json = null | number | string | Json[] | { [k in string]: Json };
export type JsonObject = Json[] | { [k in string]: Json };
export type JsonCim = { T: [never, JsonObject], V: [never, JsonObject], C: [null, null], D: [never, JsonObject], A: [[], []] };
export type JsonTypeKeys = { T: typeof F_ID, V: typeof F_ID, C: typeof F_C, D: typeof F_ID, A: typeof F_C };
const JsonCtr = <X extends JsonObject>(_: [], data: X) => data;
export { JsonCtr };
export namespace RequestHandlers {
  export const Json: CtxRequestHandler<JsonObject, JsonCim, JsonTypeKeys> = () => ({
    decode: (_id, data) => ({ args: [], data, c: null }),
    encode: (_: string, { data }) => data,
    ctr: JsonCtr,
  });
}
export type RequestHandlers = typeof RequestHandlers;
