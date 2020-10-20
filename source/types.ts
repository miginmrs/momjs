import type { Destructable, EntryObs } from './destructable';
import type { TeardownLogic, Observable, Subscription } from 'rxjs';
import type { KeysOfType, App, TypeFuncs, Fun, AppX, DepConstaint } from 'dependent-type';


export type prim = number | string | boolean;
export type Json = null | prim | JsonObject;
export type JsonObject = Json[] | { [k in string]: Json };

export type LocalRef<V> = { $: number, _: V };
export type GlobalRef<V> = { id: string, _: V };
export type Ref<V> = LocalRef<V> | GlobalRef<V>;
export type eprim = prim | bigint;

export type TVCDA_CIM = {
  T: [unknown, object | eprim | null], V: [unknown, object], C: [unknown, unknown], D: [unknown, unknown],
  A: [unknown, unknown[]]
};
export type TVCDA = keyof TVCDA_CIM;
export type CDA_Im = Omit<TVCDA_CIM, 'T' | 'V'>;
export type CDA = keyof CDA_Im;

export type xDerefHandler<
  indices extends number,
  dcim extends Record<indices, [unknown, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: dcim[P][0] },
  N extends Record<indices, 1 | 2>,
  EH extends EHConstraint<EH, ECtx>,
  ECtx, i extends indices> = [KeysOfType<EHConstraint<EH, ECtx>, CtxEH<dcim[i][0], dcim[i][1], keys[i], N[i], EH, ECtx>>, AppX<'C', dcim[i][1], keys[i], X[i]>];
export type derefHandler<
  indices extends number,
  dcim extends Record<indices, [unknown, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  N extends Record<indices, 1 | 2>,
  EH extends EHConstraint<EH, ECtx>,
  ECtx, i extends indices> = KeysOfType<EHConstraint<EH, ECtx>, CtxEH<dcim[i][0], dcim[i][1], keys[i], N[i], EH, ECtx>>;
export type xDerefHandlers<
  indices extends number,
  dcim extends Record<indices, [unknown, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: dcim[P][0] },
  N extends Record<indices, 1 | 2>,
  EH extends EHConstraint<EH, ECtx>,
  ECtx,
  > = xDerefHandler<indices, dcim, keys, X, N, EH, ECtx, indices>[] & {
    [i in indices]: xDerefHandler<indices, dcim, keys, X, N, EH, ECtx, i>
  };

export type derefReturn<
  indices extends number,
  dcim extends Record<indices, [unknown, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: dcim[P][0] },
  N extends Record<indices, 1 | 2>,
  EH extends EHConstraint<EH, ECtx>,
  ECtx,
  > = {
    [P in indices]: ObsWithOrigin<AppX<'V', dcim[P][1], keys[P], X[P]>, EH, ECtx> & { origin: Destructable<dcim[P][0], dcim[P][1], keys[P], X[P], N[P], EH, ECtx, (v: AppX<'V', dcim[P][1], keys[P], X[P]>) => void> }
  }[indices];

export type derefHandlers<
  indices extends number,
  dcim extends Record<indices, [unknown, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  N extends Record<indices, 1 | 2>,
  EH extends EHConstraint<EH, ECtx>,
  ECtx
  > = derefHandler<indices, any, any, any, EH, ECtx, indices>[] & {
    [i in indices]: derefHandler<indices, dcim, keys, N, EH, ECtx, i>
  };

export type xderef<EH extends EHConstraint<EH, ECtx>, ECtx> = {
  <
    indices extends number,
    dcim extends Record<indices, [unknown, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: dcim[P][0] },
    N extends Record<indices, 1 | 2>,
    >(
    ref: Ref<{ [P in indices]: dcim[P][1]['V'][1] }[indices]>,
    ...handlers: xDerefHandlers<indices, dcim, keys, X, N, EH, ECtx>
  ): derefReturn<indices, dcim, keys, X, N, EH, ECtx>,
}
export type deref<EH extends EHConstraint<EH, ECtx>, ECtx> = {
  <V>(ref: Ref<V>): ObsWithOrigin<V, EH, ECtx>,
  <
    indices extends number,
    dcim extends Record<indices, [unknown, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: dcim[P][0] },
    N extends Record<indices, 1 | 2>,
    >(
    ref: Ref<{ [P in indices]: AppX<'V', dcim[P][1], keys[P], X[P]> }[indices]>,
    ...handlers: derefHandlers<indices, dcim, keys, N, EH, ECtx>
  ): derefReturn<indices, dcim, keys, X, N, EH, ECtx>,
};

export type ArrKeys = Exclude<keyof any[], number>;

export type ref<EH extends EHConstraint<EH, ECtx>, ECtx> = {
  <V>(obs: ObsWithOrigin<V, EH, ECtx>): Ref<V>,
};

export type TVCDADepConstaint<dom, cim extends TVCDA_CIM> = DepConstaint<TVCDA, dom, cim>;

export type DestructableCtr<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  <X extends dom>(args: AppX<'A', cim, k, X>, data: AppX<'D', cim, k, X>, c: AppX<'C', cim, k, X>, old: null | AppX<'V', cim, k, X>, destructable: Destructable<dom, cim, k, X, n, EH, ECtx>): AppX<'V', cim, k, X>
};

export type RequestHandlerCompare<dom, cim extends Pick<TVCDA_CIM, 'D' | 'A'>, k extends DepConstaint<'D' | 'A', dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  <X extends dom>(x: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>, y: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>): boolean,
}
export type RequestHandlerDestroy<dom, cim extends Pick<TVCDA_CIM, 'D'>, k extends DepConstaint<'D', dom, cim>> = {
  <X extends dom>(x: AppX<'D', cim, k, X>): TeardownLogic,
}

export type CtxEH<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  encode: (ctx: { ref: ref<EH, ECtx> }) => <X extends dom>(args: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx> & { c: AppX<'C', cim, k, X>, old?: AppX<'T', cim, k, X> }) => AppX<'T', cim, k, X> | undefined,
  ctr: DestructableCtr<dom, cim, k, n, EH, ECtx>,
};
export type CtxH<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = CtxEH<dom, cim, k, n, EH, ECtx> & {
  decode: (ctx: { deref: deref<EH, ECtx>, xderef: xderef<EH, ECtx> } & ECtx) => <X extends dom>(id: string, args: AppX<'T', cim, k, X>, old: ObsWithOrigin<AppX<'V', cim, k, X>, EH, ECtx> & { origin: Destructable<dom, cim, k, X, n, EH, ECtx> } | null) => EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>,
  compare?: (ctx: ECtx) => RequestHandlerCompare<dom, cim, k, n, EH, ECtx>,
  destroy?: (ctx: ECtx) => RequestHandlerDestroy<dom, cim, k>
};

export type RequestRemoveCtx<O extends CtxH<any, any, any, any, any, any>> = O extends (ctx: any) => infer T ? T : never;
export type CtxHandlerTVCDA<O extends CtxH<any, any, any, any, any, any>> = O extends CtxH<infer dom, infer cim, infer k, infer n, infer RH, infer ECtx> ? [dom, cim, k, n, RH, ECtx] : never;

export type RHConstraint<RH extends RHConstraint<RH, ECtx>, ECtx> = {
  [k in keyof RH]: CtxH<any, any, any, any, RH, ECtx>
};
export type EHConstraint<EH extends EHConstraint<EH, ECtx>, ECtx> = {
  [k in keyof EH]: CtxEH<any, any, any, any, EH, ECtx>
};

export type ModelData<T> = { data: T, new?: boolean, id?: string } | { data?: undefined, new?: undefined, id: string }
export type ModelDefinition<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2, RH extends RHConstraint<RH, ECtx>, ECtx> = {
  type: KeysOfType<RHConstraint<RH, ECtx>, CtxH<dom, cim, k, n, RH, ECtx>> & string, c: AppX<'C', cim, k, X>
} & ModelData<AppX<'T', cim, k, X>>;

export type EModelDefinition<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  type: KeysOfType<EHConstraint<EH, ECtx>, CtxEH<dom, cim, k, n, EH, ECtx>> & string, c: AppX<'C', cim, k, X>,
} & ModelData<AppX<'T', cim, k, X>>;

export type AnyEModelDefinition<EH extends EHConstraint<EH, ECtx>, ECtx> = {
  type: keyof EH & string, c: any
} & ModelData<any>;
export type AnyModelDefinition<EH extends EHConstraint<EH, ECtx>, ECtx, indices extends number = number> = (AnyEModelDefinition<EH, ECtx> & { i: indices });
export type Name<
  indices extends number,
  dcim extends Record<indices, [unknown, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  P extends indices,
  N extends Record<indices, 1 | 2>,
  RH extends RHConstraint<RH, ECtx>,
  ECtx
  > = KeysOfType<RH, CtxH<dcim[P][0], dcim[P][1], keys[P], N[P], RH, ECtx>>;

export type ModelsDefinition<
  indices extends number,
  dcim extends Record<indices, [unknown, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: dcim[P][0] },
  N extends Record<indices, 1 | 2>,
  RH extends RHConstraint<RH, ECtx>,
  ECtx
  > = {
    [P in indices]: ModelDefinition<dcim[P][0], dcim[P][1], keys[P], X[P], N[P], RH, ECtx> & { i: P }
  } & AnyModelDefinition<RH, ECtx, indices>[];
export type EModelsDefinition<
  indices extends number,
  dcim extends Record<indices, [unknown, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: dcim[P][0] },
  N extends Record<indices, 1 | 2>,
  EH extends EHConstraint<EH, ECtx>,
  ECtx
  > = {
    [P in indices]: EModelDefinition<dcim[P][0], dcim[P][1], keys[P], X[P], N[P], EH, ECtx> & { i: P }
  } & (AnyModelDefinition<EH, ECtx, indices>)[];
export type TypedDestructable<T, EH extends EHConstraint<EH, ECtx>, ECtx> = Destructable<any, any, any, any, any, EH, ECtx, (v: T) => void>;
export type ObsWithOrigin<V, EH extends EHConstraint<EH, ECtx>, ECtx> = Observable<V> & {
  parent: ObsWithOrigin<V, EH, ECtx>;
  origin: TypedDestructable<V, EH, ECtx>;
  readonly destroyed: boolean;
  add(teardown: TeardownLogic): Subscription;
}
export type FIDS = number | string;
export type FdcpConstraint<fIds extends FIDS> = Record<fIds, [[unknown, TVCDA_CIM, 1 | 2], [unknown, TVCDA_CIM, 1 | 2], Json]>;
export type FkxConstraint<fIds extends FIDS, fdcp extends FdcpConstraint<fIds>> = {
  [P in fIds]: [TVCDADepConstaint<fdcp[P][0][0], fdcp[P][0][1]>, fdcp[P][0][0], TVCDADepConstaint<fdcp[P][1][0], fdcp[P][1][1]>, fdcp[P][1][0]];
};
export type Functions<
  EH extends EHConstraint<EH, ECtx>,
  ECtx,
  fIds extends FIDS,
  fdcp extends FdcpConstraint<fIds>,
  fkx extends FkxConstraint<fIds, fdcp>,
  > = {
    [fId in fIds]: (param: fdcp[fId][2], arg: ObsWithOrigin<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>, EH, ECtx> & {
      origin: Destructable<fdcp[fId][0][0], fdcp[fId][0][1], fkx[fId][0], fkx[fId][1], fdcp[fId][0][2], EH, ECtx>
    }) => PromiseLike<ObsWithOrigin<AppX<'V', fdcp[fId][1][1], fkx[fId][2], fkx[fId][3]>, EH, ECtx> & {
      origin: Destructable<fdcp[fId][1][0], fdcp[fId][1][1], fkx[fId][2], fkx[fId][3], fdcp[fId][1][2], EH, ECtx>
    }>
  };

export type CallHandler<
  RH extends RHConstraint<RH, ECtx>,
  ECtx,
  fIds extends FIDS,
  fdcp extends FdcpConstraint<fIds>,
  fkx extends FkxConstraint<fIds, fdcp>,
  > = {
    handlers: <fId extends fIds>() => {
      end_call: () => void,
      unsubscribe: (ref: GlobalRef<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>>) => void,
      complete: (ref: GlobalRef<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>>) => void,
      put: (def: EModelsDefinition<0, [[fdcp[fId][0][0], fdcp[fId][0][1]]], [fkx[fId][0]], [fkx[fId][1]], [fdcp[fId][0][2]], RH, ECtx>) => PromiseLike<{ 0: GlobalRef<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>>; } & GlobalRef<any>[]>,
      call: (fId: fId, param: fdcp[fId][2], ref: GlobalRef<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>>, opt: { ignore?: string[], global?: boolean }) => void,
      error: (ref: GlobalRef<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>>, err: any) => void,
      subscribeToResult: (cbs: {
        resp_id: (ref: GlobalRef<AppX<'V', fdcp[fId][1][1], fkx[fId][2], fkx[fId][3]>>) => void;
        resp_call: (data: ModelsDefinition<0, [[fdcp[fId][1][0], fdcp[fId][1][1]]], [fkx[fId][2]], [fkx[fId][3]], [fdcp[fId][1][2]], RH, ECtx>) => void;
        err_call: (err: any) => PromiseLike<void>;
        comp_call: () => PromiseLike<void>;
      }) => Subscription,
    },
    serialized: WeakMap<ObsWithOrigin<any, RH, ECtx>, Observable<GlobalRef<any>>>
  };
