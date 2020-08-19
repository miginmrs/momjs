import { XDestructable, EntryObs } from './destructable';
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

type xDerefCtrsI<dom, indices extends number, T extends [any, object], Tk extends KeysOfType<TypeFuncs<T[0], dom>, T[1]>, cim extends Record<indices, CDA_Im>, k extends { [i in indices]: { [P in CDA]: KeysOfType<TypeFuncs<cim[i][P][0], dom>, cim[i][P][1]> } }, X, i extends indices> = [{
  <X extends dom>(args: AppX<'A', cim[i], k[i], X>, data: AppX<'D', cim[i], k[i], X>, c: AppX<'C', cim[i], k[i], X>): App<Fun<Tk, T[0]>, X> & T[1]
  (args: cim[i]['A'][1], data: cim[i]['D'][1], c: cim[i]['C'][1]): T[1]
}, AppX<'C', cim[i], k[i], X>];
export type xDerefCtrs<dom, indices extends number, T extends [any, object], Tk extends KeysOfType<TypeFuncs<T[0], dom>, T[1]>, cim extends Record<indices, CDA_Im>, k extends { [i in indices]: { [P in CDA]: KeysOfType<TypeFuncs<cim[i][P][0], dom>, cim[i][P][1]> } }, X>
  = xDerefCtrsI<dom, indices, T, Tk, cim, k, X, indices>[] & { [i in indices]: xDerefCtrsI<dom, indices, T, Tk, cim, k, X, i> };

export type xDerefReturn<dom, indices extends number, T extends [any, object], Tk extends KeysOfType<TypeFuncs<T[0], dom>, T[1]>, cim extends Record<indices, CDA_Im>, k extends { [i in indices]: { [P in CDA]: KeysOfType<TypeFuncs<cim[i][P][0], dom>, cim[i][P][1]> } }, X> = {
  [i in indices]: Destructable<App<Fun<Tk, T[0]>, X> & T[1], AppX<'C', cim[i], k[i], X>, AppX<'D', cim[i], k[i], X>, AppX<'A', cim[i], k[i], X>> }[indices];

export type refCtrs<T, ADC extends [any, any, any][]> = { [i in keyof ADC]: (...args: ADC[i & number]) => T };
export type refReturn<T, ADC extends [any[], any, any][]> = {
  [i in keyof ADC]: Destructable<T, ADC[i & number][2], ADC[i & number][1], ADC[i & number][0]> }[number];
export type xderef = {
  <dom, T extends [any, object], Tk extends KeysOfType<TypeFuncs<T[0], dom>, T[1]>, cim extends Record<indices, CDA_Im>, k extends { [i in indices]: { [P in CDA]: KeysOfType<TypeFuncs<cim[i][P][0], dom>, cim[i][P][1]> } }, X, indices extends number = keyof cim & number>(
    ref: Ref<T[1]>, ...ctrs: xDerefCtrs<dom, indices, T, Tk, cim, k, X>): xDerefReturn<dom, indices, T, Tk, cim, k, X>,
}
export type deref = {
  <T>(ref: Ref<T>): Destructable<T, any, any, any>,
  <T, ADC extends [any, any, any][]>(ref: Ref<T>, ...ctrs: refCtrs<T, ADC>): refReturn<T, ADC>,
};
export type ref = {
  <T>(obs: Destructable<T, any, any, any>): Ref<T>,
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

export type RequestHandler<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>> =
  Partial<RequestHandlerDestroy<dom, cim, k>> & {
    decode: <X extends dom>(id: string, args: AppX<'T', cim, k, X>) => EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>>,
    encode: <X extends dom>(id: string, args: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>> & { c: AppX<'C', cim, k, X> }) => AppX<'T', cim, k, X>,
    ctr: DestructableCtr<dom, cim, k>,
    compare?: RequestHandlerCompare<dom, cim, k>,
    destroy?: RequestHandlerDestroy<dom, cim, k>
  };

export type RequestHandlerCompare<dom, cim extends Pick<TVCDA_CIM, 'D' | 'A'>, k extends DepConstaint<'D' | 'A', dom, cim>> = {
  <X extends dom>(x: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>>, y: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>>): boolean,
}
export type RequestHandlerDestroy<dom, cim extends Pick<TVCDA_CIM, 'D'>, k extends DepConstaint<'D', dom, cim>> = {
  <X extends dom>(x: AppX<'D', cim, k, X>): TeardownLogic,
}

export type CtxH<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, ECtx> = (ctx: Context & ECtx) => RequestHandler<dom, cim, k>;
export type RequestRemoveCtx<O extends CtxH<any, any, any, any>> = O extends (ctx: any) => infer T ? T : never;
export type CtxHandlerTVCDA<O extends CtxH<any, any, any, any>> = O extends CtxH<infer dom, infer cim, infer k, infer Ctx> ? [dom, cim, k, Ctx] : never;

export type RHConstraint<RH> = {
  [k in keyof RH]: RH[k] extends CtxH<infer dom, infer cim, infer k, infer Ctx> ? CtxH<dom, cim, k, Ctx> : never
};

export type TypedRequestParamsDefinition<RH extends RHConstraint<RH>> = {
  [type in keyof RH]: { type: type, args: CtxHandlerTVCDA<RH[type]> }
};

export type ContextualRH<RH extends RHConstraint<RH>> = {
  [type in keyof RH]: RequestRemoveCtx<RH[type]>
}

export type ModelDefinition<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, RH extends RHConstraint<RH>, ECtx> = {
  type: KeysOfType<RH, CtxH<dom, cim, k, ECtx>>, c: AppX<'C', cim, k, X>
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
  RH extends RHConstraint<RH>,
  ECtx
  > = KeysOfType<RH, CtxH<dcim[P][0], dcim[P][1], keys[P], ECtx>>;

export type ModelsDefinition<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: any },
  RH extends RHConstraint<RH>,
  ECtx
  > = { [P in indices]: ModelDefinition<dcim[P][0], dcim[P][1], keys[P], X[P], RH, ECtx> & { i: P } } & any[];
export type ObsWithOrigin<T> = Observable<T> & { origin: Destructable<T, any, any, any> }