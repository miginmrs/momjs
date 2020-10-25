import type { Observable } from 'rxjs';
import type { KeysOfType, AppX, DepConstaint } from 'dependent-type';
import type { TVCDADepConstaint, TVCDA_CIM, Ref } from './basic';
import type { Destructable } from '../destructable';

export type TwoDestructable<A extends unknown[], EH extends EHConstraint<EH, ECtx>, ECtx> = ObsWithOrigin<A[number], EH, ECtx>[] & {
  [k in Exclude<keyof A, keyof any[]>]: ObsWithOrigin<A[k], EH, ECtx>;
};

export type DeepDestructable<A extends unknown[], n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = (n extends 1 ? ObsWithOrigin<A[number], EH, ECtx> : TwoDestructable<A[number] & unknown[], EH, ECtx>)[] & {
  [k in Exclude<keyof A, keyof any[]>]: n extends 1 ? ObsWithOrigin<A[k], EH, ECtx> : TwoDestructable<A[k] & unknown[], EH, ECtx>;
};

export type EntryObs<D, A extends unknown[], n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  args: DeepDestructable<A, n, EH, ECtx>, data: D, n: n
};


export type CtxEH<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  encode: (ctx: { ref: ref<EH, ECtx> }) => <X extends dom>(args: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx> & { c: AppX<'C', cim, k, X>, old?: AppX<'T', cim, k, X> }) => AppX<'T', cim, k, X> | undefined,
  ctr: DestructableCtr<dom, cim, k, n, EH, ECtx>,
  destroy?: RequestHandlerDestroy<dom, cim, k>,
};
export type EHConstraint<EH extends EHConstraint<EH, ECtx>, ECtx> = {
  [k in keyof EH]: CtxEH<any, any, any, any, EH, ECtx>
};

// CtxEH
export type xDerefHandler<
  indices extends number,
  dcim extends Record<indices, [unknown, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: dcim[P][0] },
  N extends Record<indices, 1 | 2>,
  EH extends EHConstraint<EH, ECtx>,
  ECtx, i extends indices> = [KeysOfType<EHConstraint<EH, ECtx>, CtxEH<dcim[i][0], dcim[i][1], keys[i], N[i], EH, ECtx>>, AppX<'C', dcim[i][1], keys[i], X[i]>];

// xDerefHandler
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

// CtxEH
export type derefHandler<
  indices extends number,
  dcim extends Record<indices, [unknown, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  N extends Record<indices, 1 | 2>,
  EH extends EHConstraint<EH, ECtx>,
  ECtx, i extends indices> = KeysOfType<EHConstraint<EH, ECtx>, CtxEH<dcim[i][0], dcim[i][1], keys[i], N[i], EH, ECtx>>;

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


export type ref<EH extends EHConstraint<EH, ECtx>, ECtx> = {
  <V>(obs: ObsWithOrigin<V, EH, ECtx>): Ref<V>,
};

export type DestructableCtr<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  <X extends dom>(args: AppX<'A', cim, k, X>, data: AppX<'D', cim, k, X>, c: AppX<'C', cim, k, X>, old: null | AppX<'V', cim, k, X>, destructable: Destructable<dom, cim, k, X, n, EH, ECtx>): AppX<'V', cim, k, X>
};

export type RequestHandlerCompare<dom, cim extends Pick<TVCDA_CIM, 'D' | 'A'>, k extends DepConstaint<'D' | 'A', dom, cim>, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx> = {
  <X extends dom>(x: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>, y: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, EH, ECtx>): boolean,
}
export type RequestHandlerDestroy<dom, cim extends Pick<TVCDA_CIM, 'D'>, k extends DepConstaint<'D', dom, cim>> = {
  <X extends dom>(data: AppX<'D', cim, k, X>): void,
}

export type TypedDestructable<T, EH extends EHConstraint<EH, ECtx>, ECtx> = Destructable<any, any, any, any, any, EH, ECtx, (v: T) => void>;

export type ObsWithOrigin<V, EH extends EHConstraint<EH, ECtx>, ECtx> = Observable<V> & {
  parent: ObsWithOrigin<V, EH, ECtx>,
  origin: TypedDestructable<V, EH, ECtx>,
  readonly destroyed: boolean;
}
