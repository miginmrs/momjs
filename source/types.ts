import { Destructable, EntryObs, TypedDestructable } from './destructable';
import { TeardownLogic, Observable } from 'rxjs';
import { KeysOfType, App, TypeFuncs, Fun, AppX, DepConstaint } from 'dependent-type';

export type LocalRef<V> = { $: number, _: V };
export type GlobalRef<V> = { id: string, _: V };
export type Ref<V> = LocalRef<V> | GlobalRef<V>;

export type TVCDA_CIM = {
  T: [any, object], V: [any, object], C: [any, unknown], D: [any, any],
  A: [any, any[]]
};
export type TVCDA = keyof TVCDA_CIM;
export type CDA_Im = Omit<TVCDA_CIM, 'T' | 'V'>;
export type CDA = keyof CDA_Im;

export type xDerefHandler<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: dcim[P][0] },
  N extends Record<indices, 1 | 2>,
  EH extends EHConstraint<EH, ECtx>,
  ECtx, i extends indices> = [KeysOfType<EHConstraint<EH, ECtx>, CtxEH<dcim[i][0], dcim[i][1], keys[i], N[i], EH, ECtx>>, AppX<'C', dcim[i][1], keys[i], X[i]>];
export type derefHandler<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  N extends Record<indices, 1 | 2>,
  EH extends EHConstraint<EH, ECtx>,
  ECtx, i extends indices> = KeysOfType<EHConstraint<EH, ECtx>, CtxEH<dcim[i][0], dcim[i][1], keys[i], N[i], EH, ECtx>>;
export type xDerefHandlers<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
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
  dcim extends Record<indices, [any, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: dcim[P][0] },
  N extends Record<indices, 1 | 2>,
  EH extends EHConstraint<EH, ECtx>,
  ECtx,
  > = {
    [P in indices]: Destructable<dcim[P][0], dcim[P][1], keys[P], X[P], N[P], EH, ECtx>
  }[indices];

export type derefHandlers<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
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
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: dcim[P][0] },
    N extends Record<indices, 1 | 2>,
    >(
    ref: Ref<{ [P in indices]: dcim[P][1]['V'][1] }[indices]>,
    ...handlers: xDerefHandlers<indices, dcim, keys, X, N, EH, ECtx>
  ): derefReturn<indices, dcim, keys, X, N, EH, ECtx>,
}
export type deref<EH extends EHConstraint<EH, ECtx>, ECtx> = {
  <V>(ref: Ref<V>): TypedDestructable<V, EH, ECtx>,
  <
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: dcim[P][0] },
    N extends Record<indices, 1 | 2>,
    >(
    ref: Ref<{ [P in indices]: AppX<'V', dcim[P][1], keys[P], X[P]> }[indices]>,
    ...handlers: derefHandlers<indices, dcim, keys, N, EH, ECtx>
  ): derefReturn<indices, dcim, keys, X, N, EH, ECtx>,
};

type MaybePromise<T> = T | PromiseLike<T>;

export type ref<EH extends EHConstraint<EH, ECtx>, ECtx> = {
  <V>(obs: TypedDestructable<V, EH, ECtx>): MaybePromise<Ref<V>>,
};

export type TVCDADepConstaint<dom, cim extends TVCDA_CIM> = DepConstaint<TVCDA, dom, cim>;

export type DestructableCtr<dom, cim extends Omit<TVCDA_CIM, 'T'>, k extends DepConstaint<Exclude<TVCDA, 'T'>, dom, cim>> = {
  <X extends dom>(args: AppX<'A', cim, k, X>, data: AppX<'D', cim, k, X>, c: AppX<'C', cim, k, X>, old: null | cim['V'][1]): AppX<'V', cim, k, X>
};

export type RequestHandlerCompare<dom, cim extends Pick<TVCDA_CIM, 'D' | 'A'>, k extends DepConstaint<'D' | 'A', dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  <X extends dom>(x: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>, y: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>): boolean,
}
export type RequestHandlerDestroy<dom, cim extends Pick<TVCDA_CIM, 'D'>, k extends DepConstaint<'D', dom, cim>> = {
  <X extends dom>(x: AppX<'D', cim, k, X>): TeardownLogic,
}

export type CtxEH<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  encode: (ctx: { ref: ref<EH, ECtx> }) => <X extends dom>(args: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx> & { c: AppX<'C', cim, k, X>, old?: cim['T'][1] }) => MaybePromise<AppX<'T', cim, k, X> | undefined>,
  ctr: DestructableCtr<dom, cim, k>,
};
export type CtxH<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = CtxEH<dom, cim, k, n, EH, ECtx> & {
  decode: (ctx: { deref: deref<EH, ECtx>, xderef: xderef<EH, ECtx> } & ECtx) => <X extends dom>(id: string, args: AppX<'T', cim, k, X>) => EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>,
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

export type TypedRequestParamsDefinition<RH extends RHConstraint<RH, ECtx>, ECtx> = {
  [type in keyof RH]: { type: type, args: CtxHandlerTVCDA<RH[type]> }
};

export type ContextualRH<RH extends RHConstraint<RH, ECtx>, ECtx> = {
  [type in keyof RH]: RequestRemoveCtx<RH[type]>
}

export type ModelData<T> = { data: T, new?: boolean, id?: string } | { data?: undefined, new?: undefined, id: string }
export type ModelDefinition<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2, RH extends RHConstraint<RH, ECtx>, ECtx> = {
  type: KeysOfType<RHConstraint<RH, ECtx>, CtxH<dom, cim, k, n, RH, ECtx>> & string, c: AppX<'C', cim, k, X>
} & ModelData<AppX<'T', cim, k, X>>;

export type EModelDefinition<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  type: KeysOfType<EHConstraint<EH, ECtx>, CtxEH<dom, cim, k, n, EH, ECtx>> & string, c: AppX<'C', cim, k, X>,
  resolve?: (ref: GlobalRef<AppX<'V', cim, k, X>>) => void
} & ModelData<AppX<'T', cim, k, X>>;

export type AnyEModelDefinition<EH extends EHConstraint<EH, ECtx>, ECtx> = {
  type: keyof EH & string, c: any
} & ModelData<any>;
export type AnyModelDefinition<EH extends EHConstraint<EH, ECtx>, ECtx, indices extends number = number> = (AnyEModelDefinition<EH, ECtx> & { i: indices });
// export type KAnyModelsDefinition<RH extends RHConstraint<RH, ECtx>, ECtx> = ModelsDefinition<number, [any, TVCDA_CIM][], Record<TVCDA, typeof F_C>[], any, RH, ECtx>;
// export type KAnyEModelsDefinition<EH extends EHConstraint<EH, ECtx>, ECtx> = EModelsDefinition<number, [any, TVCDA_CIM][], Record<TVCDA, typeof F_C>[], any, EH, ECtx>;
export type Name<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  P extends indices,
  N extends Record<indices, 1 | 2>,
  RH extends RHConstraint<RH, ECtx>,
  ECtx
  > = KeysOfType<RH, CtxH<dcim[P][0], dcim[P][1], keys[P], N[P], RH, ECtx>>;

export type ModelsDefinition<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
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
  dcim extends Record<indices, [any, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: dcim[P][0] },
  N extends Record<indices, 1 | 2>,
  EH extends EHConstraint<EH, ECtx>,
  ECtx
  > = {
    [P in indices]: EModelDefinition<dcim[P][0], dcim[P][1], keys[P], X[P], N[P], EH, ECtx> & { i: P }
  } & (AnyModelDefinition<EH, ECtx, indices> & { resolve?: (ref: GlobalRef<any>) => void })[];
export type ObsWithOrigin<V, EH extends EHConstraint<EH, ECtx>, ECtx> = Observable<V> & {
  parent: ObsWithOrigin<V, EH, ECtx>,
  origin: TypedDestructable<V, EH, ECtx>,
  readonly destroyed: boolean;
}


