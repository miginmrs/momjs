import { Destructable, EntryObs, TypedDestructable } from './destructable';
import { TeardownLogic, Observable } from 'rxjs';
import { KeysOfType, App, TypeFuncs, Fun, AppX, DepConstaint } from 'dependent-type';

export type LocalRef<V> = { $: number, _: V };
export type GlobalRef<V> = { id: string, _: V };
export type Ref<V> = LocalRef<V> | GlobalRef<V>;

export type TVCDA_CIM = {
  T: [any, any], V: [any, object], C: [any, unknown], D: [any, any],
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
  EH extends EHConstraint<EH, ECtx>,
  ECtx, i extends indices> = [KeysOfType<EH, CtxEH<dcim[i][0], dcim[i][1], keys[i], EH, ECtx>>, AppX<'C', dcim[i][1], keys[i], X>];
export type derefHandler<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: dcim[P][0] },
  EH extends EHConstraint<EH, ECtx>,
  ECtx, i extends indices> = KeysOfType<EH, CtxEH<dcim[i][0], dcim[i][1], keys[i], EH, ECtx>>;
export type xDerefHandlers<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: dcim[P][0] },
  EH extends EHConstraint<EH, ECtx>,
  ECtx
  > = xDerefHandler<indices, dcim, keys, X, EH, ECtx, indices>[] & {
    [i in indices]: xDerefHandler<indices, dcim, keys, X, EH, ECtx, i>
  };

export type derefReturn<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: dcim[P][0] },
  EH extends EHConstraint<EH, ECtx>,
  ECtx
  > = {
    [P in indices]: Destructable<dcim[P][0], dcim[P][1], keys[P], X[P], EH, ECtx>
  }[indices];

export type derefHandlers<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: dcim[P][0] },
  EH extends EHConstraint<EH, ECtx>,
  ECtx
  > = derefHandler<indices, dcim, keys, X, EH, ECtx, indices>[] & {
    [i in indices]: derefHandler<indices, dcim, keys, X, EH, ECtx, i>
  };

export type xderef<EH extends EHConstraint<EH, ECtx>, ECtx> = {
  <
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: dcim[P][0] },
    >(
    ref: Ref<{ [P in indices]: dcim[P][1]['V'][1] }[indices]>,
    ...handlers: xDerefHandlers<indices, dcim, keys, X, EH, ECtx>
  ): derefReturn<indices, dcim, keys, X, EH, ECtx>,
}
export type deref<EH extends EHConstraint<EH, ECtx>, ECtx> = {
  <V>(ref: Ref<V>): TypedDestructable<V, EH, ECtx>,
  <
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: dcim[P][0] },
    >(
    ref: Ref<{ [P in indices]: AppX<'V', dcim[P][1], keys[P], X[P]> }[indices]>,
    ...handlers: derefHandlers<indices, dcim, keys, X, EH, ECtx>
  ): derefReturn<indices, dcim, keys, X, EH, ECtx>,
};
export type ref<EH extends EHConstraint<EH, ECtx>, ECtx> = {
  <V>(obs: TypedDestructable<V, EH, ECtx>): Ref<V> | PromiseLike<Ref<V>>,
};


export type TVCDADepConstaint<dom, cim extends TVCDA_CIM> = DepConstaint<TVCDA, dom, cim>;

export type DestructableCtr<dom, cim extends Omit<TVCDA_CIM, 'T'>, k extends DepConstaint<Exclude<TVCDA, 'T'>, dom, cim>> = {
  <X extends dom>(args: AppX<'A', cim, k, X>, data: AppX<'D', cim, k, X>, c: AppX<'C', cim, k, X>): AppX<'V', cim, k, X>
};


export type EncodeHandler<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  encode: <X extends dom>(id: string, args: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, EH, ECtx> & { c: AppX<'C', cim, k, X> }) => AppX<'T', cim, k, X>,
};

export type RequestHandlerCompare<dom, cim extends Pick<TVCDA_CIM, 'D' | 'A'>, k extends DepConstaint<'D' | 'A', dom, cim>, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  <X extends dom>(x: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, EH, ECtx>, y: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, EH, ECtx>): boolean,
}
export type RequestHandlerDestroy<dom, cim extends Pick<TVCDA_CIM, 'D'>, k extends DepConstaint<'D', dom, cim>> = {
  <X extends dom>(x: AppX<'D', cim, k, X>): TeardownLogic,
}

export type CtxEH<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  encode: (ctx: { ref: ref<EH, ECtx> }) => <X extends dom>(args: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, EH, ECtx> & { c: AppX<'C', cim, k, X> }) => AppX<'T', cim, k, X> | PromiseLike<AppX<'T', cim, k, X>>,
  ctr: DestructableCtr<dom, cim, k>,
};
export type CtxH<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, EH extends EHConstraint<EH, ECtx>, ECtx> = CtxEH<dom, cim, k, EH, ECtx> & {
  decode: (ctx: { deref: deref<EH, ECtx>, xderef: xderef<EH, ECtx> } & ECtx) => <X extends dom>(id: string, args: AppX<'T', cim, k, X>) => EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, EH, ECtx>,
  compare?: (ctx: ECtx) => RequestHandlerCompare<dom, cim, k, EH, ECtx>,
  destroy?: (ctx: ECtx) => RequestHandlerDestroy<dom, cim, k>
};

export type RequestRemoveCtx<O extends CtxH<any, any, any, any, any>> = O extends (ctx: any) => infer T ? T : never;
export type CtxHandlerTVCDA<O extends CtxH<any, any, any, any, any>> = O extends CtxH<infer dom, infer cim, infer k, infer RH, infer ECtx> ? [dom, cim, k, RH, ECtx] : never;

export type RHConstraint<RH extends RHConstraint<RH, ECtx>, ECtx> = {
  [k in keyof RH]: CtxH<any, any, any, RH, ECtx>
};
export type EHConstraint<EH extends EHConstraint<EH, ECtx>, ECtx> = {
  [k in keyof EH]: CtxEH<any, any, any, EH, ECtx>
};

export type TypedRequestParamsDefinition<RH extends RHConstraint<RH, ECtx>, ECtx> = {
  [type in keyof RH]: { type: type, args: CtxHandlerTVCDA<RH[type]> }
};

export type ContextualRH<RH extends RHConstraint<RH, ECtx>, ECtx> = {
  [type in keyof RH]: RequestRemoveCtx<RH[type]>
}

export type ModelData<T> = { data: T, isNew?: boolean, reuseId?: string } | { data?: undefined, isNew?: undefined, reuseId: string }
export type ModelDefinition<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, RH extends RHConstraint<RH, ECtx>, ECtx> = {
  type: KeysOfType<RH, CtxH<dom, cim, k, RH, ECtx>> & string, c: AppX<'C', cim, k, X>
} & ModelData<AppX<'T', cim, k, X>>;

export type EModelDefinition<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  type: KeysOfType<EH, CtxEH<dom, cim, k, EH, ECtx>> & string, c: AppX<'C', cim, k, X>
} & ModelData<AppX<'T', cim, k, X>>;;

export type AnyEModelDefinition<EH extends EHConstraint<EH, ECtx>, ECtx> = {
  type: keyof EH & string, c: any
} & ModelData<any>;
export type AnyModelsDefinition<EH extends EHConstraint<EH, ECtx>, ECtx, indices extends number = number> = (AnyEModelDefinition<EH, ECtx> & { i: indices })[];
// export type KAnyModelsDefinition<RH extends RHConstraint<RH, ECtx>, ECtx> = ModelsDefinition<number, [any, TVCDA_CIM][], Record<TVCDA, typeof F_C>[], any, RH, ECtx>;
// export type KAnyEModelsDefinition<EH extends EHConstraint<EH, ECtx>, ECtx> = EModelsDefinition<number, [any, TVCDA_CIM][], Record<TVCDA, typeof F_C>[], any, EH, ECtx>;
export type Name<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  P extends indices,
  RH extends RHConstraint<RH, ECtx>,
  ECtx
  > = KeysOfType<RH, CtxH<dcim[P][0], dcim[P][1], keys[P], RH, ECtx>>;

export type ModelsDefinition<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: dcim[P][0] },
  RH extends RHConstraint<RH, ECtx>,
  ECtx
  > = {
    [P in indices]: ModelDefinition<dcim[P][0], dcim[P][1], keys[P], X[P], RH, ECtx> & { i: P }
  } & AnyModelsDefinition<RH, ECtx, indices>;
export type EModelsDefinition<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: dcim[P][0] },
  EH extends EHConstraint<EH, ECtx>,
  ECtx
  > = {
    [P in indices]: EModelDefinition<dcim[P][0], dcim[P][1], keys[P], X[P], EH, ECtx> & { i: P }
  } & AnyModelsDefinition<EH, ECtx, indices>;
export type ObsWithOrigin<V, EH extends EHConstraint<EH, ECtx>, ECtx> = Observable<V> & {
  parent: ObsWithOrigin<V, EH, ECtx>,
  origin: TypedDestructable<V, EH, ECtx>,
  readonly destroyed: boolean;
}


