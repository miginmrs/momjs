import type { TSerialObs } from '../types/serial';
import type { Ref, ArrKeys, JsonObject } from '../types/basic';

/** @summary Returns constant C */
export declare const F_C: unique symbol;
/** @summary Identity */
export declare const F_ID: unique symbol;


export type F_C = typeof F_C;
export type F_ID = typeof F_ID;

export declare const F_ArrArgs: unique symbol;
export type F_ArrArgs = typeof F_ArrArgs;
export declare const F_Serial: unique symbol;
export type F_Serial = typeof F_Serial;
export declare const F_Ref: unique symbol;
export type F_Ref = typeof F_Ref;
export declare const F_Json: unique symbol;
export type F_Json = typeof F_Json;

export type TVCDA_FC = { T: F_C, V: F_C, C: F_C, D: F_C, A: F_C };

export type ToRef<X extends unknown[]> = Ref<X[number]>[] & { [P in Exclude<keyof X, keyof any[]>]: Ref<X[P] & X[number]> };
export type ToRefMap<X extends [object, unknown]> = [Ref<X[0]>, Ref<X[1]>][];
declare module 'dependent-type' {
  export interface TypeFuncs<C, X> {
    [F_C]: C,
    [F_ID]: X,
    [F_Json]: [X] extends [C] ? null | 'str' : 'str',
    [F_ArrArgs]: ToRef<X & unknown[]>,
    [F_Serial]: TSerialObs<C[0 & keyof C][X & Exclude<keyof C[0 & keyof C], ArrKeys>] & C[0 & keyof C][keyof C[0 & keyof C] & number], C[1 & keyof C], C[2 & keyof C]>,
    [F_Ref]: Ref<C[X & Exclude<keyof C, ArrKeys>] & C[keyof C & number]>,
  }
}

