import { Destructable, EntryObs, TypedDestructable } from './destructable';
import { TeardownLogic, Observable } from 'rxjs';
import { KeysOfType, App, TypeFuncs, Fun, AppX, DepConstaint } from 'dependent-type';

export type LocalRef<T> = { $: number, _: T };
export type GlobalRef<T> = { id: string, _: T };
export type Ref<T> = LocalRef<T> | GlobalRef<T>;

export type TVCDA_CIM = {
  T: [any, any], V: [any, object], C: [any, unknown], D: [any, any],
  A: [any, any[]]
};
export type TVCDA = keyof TVCDA_CIM;
export type CDA_Im = Omit<TVCDA_CIM, 'T' | 'V'>;
export type CDA = keyof CDA_Im;

type xDerefCtrsI<dom, indices extends number, T extends [any, object], Tk extends KeysOfType<TypeFuncs<T[0], dom>, T[1]>, cim extends Record<indices, CDA_Im>, k extends { [i in indices]: { [P in CDA]: KeysOfType<TypeFuncs<cim[i][P][0], dom>, cim[i][P][1]> } }, X extends dom, i extends indices> = [{
  (args: AppX<'A', cim[i], k[i], X>, data: AppX<'D', cim[i], k[i], X>, c: AppX<'C', cim[i], k[i], X>): App<Fun<Tk, T[0]>, X> & T[1]
}, AppX<'C', cim[i], k[i], X>];
export type xDerefCtrs<dom, indices extends number, T extends [any, object], Tk extends KeysOfType<TypeFuncs<T[0], dom>, T[1]>, cim extends Record<indices, CDA_Im>, k extends { [i in indices]: { [P in CDA]: KeysOfType<TypeFuncs<cim[i][P][0], dom>, cim[i][P][1]> } }, X extends dom>
  = xDerefCtrsI<dom, indices, T, Tk, cim, k, X, indices>[] & { [i in indices]: xDerefCtrsI<dom, indices, T, Tk, cim, k, X, i> };

export type xDerefReturn<dom, indices extends number, T extends [any, object], Tk extends KeysOfType<TypeFuncs<T[0], dom>, T[1]>, cim extends Record<indices, CDA_Im>, k extends { [i in indices]: { [P in CDA]: KeysOfType<TypeFuncs<cim[i][P][0], dom>, cim[i][P][1]> } }, X> = {
  [i in indices]: Destructable<any, App<Fun<Tk, T[0]>, X> & T[1], AppX<'C', cim[i], k[i], X>, AppX<'D', cim[i], k[i], X>, AppX<'A', cim[i], k[i], X>> }[indices];

export type refCtrs<V, ADC extends [any, any, any][]> = { [i in keyof ADC]: (...args: ADC[i & number]) => V };
export type derefReturn<V, ADC extends [any[], any, any][]> = {
  [i in keyof ADC]: Destructable<any, V, ADC[i & number][2], ADC[i & number][1], ADC[i & number][0]> }[number];
export type xderef = {
  <dom, T extends [any, object], Tk extends KeysOfType<TypeFuncs<T[0], dom>, T[1]>, cim extends Record<indices, CDA_Im>, k extends { [i in indices]: { [P in CDA]: KeysOfType<TypeFuncs<cim[i][P][0], dom>, cim[i][P][1]> } }, X extends dom, indices extends number = keyof cim & number>(
    ref: Ref<App<Fun<Tk, T[0]>, X> & T[1]>, ...ctrs: xDerefCtrs<dom, indices, T, Tk, cim, k, X>): xDerefReturn<dom, indices, T, Tk, cim, k, X>,
}
export type deref = {
  <V>(ref: Ref<V>): TypedDestructable<V, any, any>,
  <V, ADC extends [any, any, any][]>(ref: Ref<V>, ...ctrs: refCtrs<V, ADC>): derefReturn<V, ADC>,
};
export type ref = {
  <V>(obs: Destructable<any, V, any, any, any>): Ref<V>,
};



export namespace Context {
  export declare const deref: deref;
  export declare const xderef: xderef;
  export declare const ref: ref;
}

export type Context = typeof Context;

export type TVCDADepConstaint<dom, cim extends TVCDA_CIM> = DepConstaint<TVCDA, dom, cim>;

export type DestructableCtr<dom, cim extends Omit<TVCDA_CIM, 'T'>, k extends DepConstaint<Exclude<TVCDA, 'T'>, dom, cim>> = {
  <X extends dom>(args: AppX<'A', cim, k, X>, data: AppX<'D', cim, k, X>, c: AppX<'C', cim, k, X>): AppX<'V', cim, k, X>
};

export type RequestHandler<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, EH extends EHConstraint<EH, ECtx>, ECtx> = 
EncodeHandler<dom, cim, k, EH, ECtx> & {
  decode: <X extends dom>(id: string, args: AppX<'T', cim, k, X>) => EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, EH, ECtx>,
  ctr: DestructableCtr<dom, cim, k>,
  compare?: RequestHandlerCompare<dom, cim, k, EH, ECtx>,
  destroy?: RequestHandlerDestroy<dom, cim, k>
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

export type CtxH<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, EH extends EHConstraint<EH, ECtx>, ECtx> = (ctx: Context & ECtx) => RequestHandler<dom, cim, k, EH, ECtx>;
export type CtxEH<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, EH extends EHConstraint<EH, ECtx>, ECtx> = (ctx: Context & ECtx) => EncodeHandler<dom, cim, k, EH, ECtx>;
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

export type ModelDefinition<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, RH extends RHConstraint<RH, ECtx>, ECtx> = {
  type: KeysOfType<RH, CtxH<dom, cim, k, RH, ECtx>>, c: AppX<'C', cim, k, X>
} & ({
  data: AppX<'T', cim, k, X>, isNew?: boolean, reuseId?: string
} | {
  data?: undefined, isNew?: undefined, reuseId: string
});

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
  X extends { [P in indices]: any },
  RH extends RHConstraint<RH, ECtx>,
  ECtx
  > = { [P in indices]: ModelDefinition<dcim[P][0], dcim[P][1], keys[P], X[P], RH, ECtx> & { i: P } } & any[];
export type ObsWithOrigin<T> = Observable<T> & { origin: Destructable<any, T, any, any, any> }