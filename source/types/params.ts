import { App, Fun } from 'dependent-type';
import { Subscription } from 'rxjs';
import { GlobalRef, TVCDADepConstaint, TVCDA_CIM } from './basic';
import { EModelsDefinition } from './store/definition'
import { RHConstraint } from './store/handler';
import { Origin } from '../origin';
import { EHConstraint } from './serial';

export type ObsCache<
  indices extends number,
  dcim extends Record<indices, [unknown, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: unknown },
  N extends Record<indices, 1 | 2>,
  EH extends EHConstraint<EH, ECtx>,
  ECtx
  > = {
    [i in indices]?: {
      obs: Origin<dcim[i][0], dcim[i][1], keys[i], X[i], N[i], EH, ECtx>,
      id: string, subs?: Subscription
    }
  };

export declare const F_Custom_Ref: unique symbol;
export declare const F_I_X: unique symbol;

type ParentOfC = { 0: any, 1: any, 2: any };
type RefHelper<C extends ParentOfC, X extends number> = App<Fun<C[1][X], C[0][X][0]>, C[2][X]> & C[0][X][1];
export type CondRefHelper<C, X> = RefHelper<C & ParentOfC, X & number>;
export type GlobalRefHelper<indices extends number, C extends ParentOfC> = { [i in indices]: RefHelper<C, i & number> } & GlobalRef<unknown>[]
declare module 'dependent-type' {
  export interface TypeFuncs<C, X> {
    [F_Custom_Ref]: CondRefHelper<C, X>;
    [F_I_X]: { i: X };
  }
}


/** Options of serialization */
export type SerializationOptions = {
  /** @property {boolean} isNew whether the first entry of the first emission should be indicated new or not */
  isNew: boolean,
  /**
   * @property {boolean} push whether the observable should be pushed into the store or not
   * @default true
   */
  push?: boolean,
  /**
   * @property {string[]} ignore ids of serial observables that should be ignored from serialization 
   */
  ignore?: string[],
}

export type Notif<RH extends RHConstraint<RH, ECtx>, ECtx> = [
  'next', EModelsDefinition<0, [[unknown, TVCDA_CIM]], [TVCDADepConstaint<unknown, TVCDA_CIM>], [unknown], [1 | 2], RH, ECtx>
] | ['error', GlobalRef<unknown>, unknown] | ['complete', GlobalRef<unknown>] | ['unsubscribe', GlobalRef<unknown>];
