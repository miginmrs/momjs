import { App, AppX, Fun, KeysOfType } from 'dependent-type';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { defined, GlobalRef, LocalRef, Ref, TVCDADepConstaint, TVCDA_CIM } from './basic';
import { AnyModelDefinition, EModelsDefinition } from './store/definition'
import { ModelsDefinition, RHConstraint, xderef } from './store/handler';
import { Origin } from '../origin';
import { deref, derefHandlers, derefReturn, EHConstraint, ref, SerialObs, TSerialObs, xDerefHandlers } from './serial';
import { BiMap } from '../bimap';
import { nodeps } from '../constants';
import { CallHandler, DCN, FdcpConstraint, FIDS, FkxConstraint, Functions, KX } from './store';
import { PromiseCtr } from '../async';

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
  'next', [AnyModelDefinition<RH, ECtx, 0>]
] | ['error', GlobalRef<unknown>, unknown] | ['complete', GlobalRef<unknown>] | ['unsubscribe', GlobalRef<unknown>];


/** Options of push */
export type PushOptions<V, RH extends RHConstraint<RH, ECtx>, ECtx> = {
  unload?: (ref: GlobalRef<V>) => void,
  nextId?: (obs: TSerialObs<unknown, RH, ECtx>, parentId?: string) => string | undefined,
  local?: Subscription & { [nodeps]?: boolean },
};

export type LocalOption<RH extends RHConstraint<RH, ECtx>, ECtx> = { in?: boolean, out?: boolean } & PushOptions<unknown, RH, ECtx>;
export type LocalObs<RH extends RHConstraint<RH, ECtx>, ECtx> = [TSerialObs<unknown, RH, ECtx>, { id: string } & LocalOption<RH, ECtx>];



export interface IStore<RH extends RHConstraint<RH, ECtx>, ECtx, lfIds extends FIDS, lfdcp extends FdcpConstraint<lfIds>, lfkx extends FkxConstraint<lfIds, lfdcp>> {
  /** inserts or updates multiple entries from serialized data with stored subscription to new ones */
  unserialize<indices extends number, dcim extends Record<indices, [unknown, TVCDA_CIM]>, keys extends {
    [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]>;
  }, X extends {
    [P in indices]: unknown;
  }, N extends Record<indices, 1 | 2>>(getModels: ModelsDefinition<indices, dcim, keys, X, N, RH, ECtx> | ((ref: <i extends indices>(i: i) => LocalRef<AppX<'V', dcim[i][1], keys[i], X[i]>>) => ModelsDefinition<indices, dcim, keys, X, N, RH, ECtx>)): {
    [i in indices]: GlobalRef<AppX<'V', dcim[i][1], keys[i], X[i]>>;
  } & GlobalRef<unknown>[];
  getValue<V>({ id }: GlobalRef<V>): [TSerialObs<V, RH, ECtx>, {
    subscription?: Subscription | undefined;
    externalId?: PromiseLike<string> | undefined;
  }];
  call<fId extends lfIds>(fId: fId, param: lfdcp[fId][2], arg: GlobalRef<AppX<'V', lfdcp[fId][0][1], lfkx[fId][0], lfkx[fId][1]>>, opt?: {
    ignore?: string[];
    graph: true;
  }): Observable<EModelsDefinition<0, [[lfdcp[fId][1][0], lfdcp[fId][1][1]]], [lfkx[fId][2]], [lfkx[fId][3]], [lfdcp[fId][1][2]], RH, ECtx>>;
  call<fId extends lfIds>(fId: fId, param: lfdcp[fId][2], arg: GlobalRef<AppX<'V', lfdcp[fId][0][1], lfkx[fId][0], lfkx[fId][1]>>, opt: {
    ignore?: string[];
    graph?: false;
  }): Observable<GlobalRef<AppX<'V', lfdcp[fId][1][1], lfkx[fId][2], lfkx[fId][3]>>>;
  shutdown(callback: (cb: () => void) => void): void;
}

export type StoreParams<RH extends RHConstraint<RH, ECtx>, ECtx,
  lfIds extends FIDS,
  lfdcp extends FdcpConstraint<lfIds>,
  lfkx extends FkxConstraint<lfIds, lfdcp>,
  rfIds extends FIDS,
  rfdcp extends FdcpConstraint<rfIds>,
  rfkx extends FkxConstraint<rfIds, rfdcp>,
  > = {
    getHandler: <R>(k: KeysOfType<RHConstraint<RH, ECtx>, R>) => R,
    callHandler: CallHandler<DCN, KX, RH, ECtx, rfIds, rfdcp, rfkx>,
    extra: ECtx,
    functions: Functions<RH, ECtx, lfIds, lfdcp, lfkx>,
    promiseCtr?: PromiseCtr,
    name?: string,
    prefix?: string,
    locals?: LocalObs<RH, ECtx>[],
    base?: boolean,
    observe?: <dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2>(
      obs: SerialObs<dom, cim, k, X, n, RH, ECtx>
    ) => (v: AppX<'V', cim, k, X>) => void,
    notifier?: () => Observable<unknown>,
  }
export type Notifier = Subscriber<Notifier>;