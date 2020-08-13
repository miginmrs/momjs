import { Observable, Subscription } from 'rxjs';
import {
  GlobalRef, LocalRef, Ref, deref, Context, CtxRequestHandler, RequestHandler, TVCDA_CIM, TVCDADepConstaint,
  TVCDA, ModelsDefinition, xDerefCtrs, ContextualRequestHanlers, ModelDefinition, CDA, CDA_Im, xDerefReturn,
  xderef, refCtrs, DestructableCtr, RequestHandlerDestroy, RequestHandlerCompare, ref,
} from './types'
import { RequestHandlers } from './handlers';
import { Destructable, FunctionalObs } from './destructable';
import { TypeFuncs, AppX, DepConstaint, keytype, App, Fun, BadApp } from '../utils/dependent-type';
import { NonUndefined } from 'utility-types';
import { KeysOfType, KeysOfTypeObj } from '../utils/filter';
import { byKey, toCond } from '../utils/guards';
import { depMap } from '../utils/dep-map';




export const withContext = (ctx: Context) => Object.fromEntries(
  Object.entries(RequestHandlers).map(([k, f]) => [k, f(ctx)] as const)
) as ContextualRequestHanlers;



type ObsCache<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: any },
  > = {
    [i in indices]?: {
      obs: Destructable<AppX<'V', dcim[i][1], keys[i], X[i]>, AppX<'C', dcim[i][1], keys[i], X[i]>, AppX<'D', dcim[i][1], keys[i], X[i]>, AppX<'A', dcim[i][1], keys[i], X[i]>>,
      id: string, subs: Subscription | null
    }
  };

export declare const F_Custom_Ref: unique symbol;
declare const F_I_X: unique symbol;
// Record<indices, [any, TVCDA_CIM]>
type ParentOfC = { 0: any, 1: any, 2: any };
type RefHelper<C extends ParentOfC, X extends number> = App<Fun<C[1][X], C[0][X][0]>, C[2][X]> & C[0][X][1];
type RefTypeError<C, X> = BadApp<Fun<typeof F_Custom_Ref, C>, X>;
type CondRefHelper<C, X> = X extends number ? C extends ParentOfC ? RefHelper<C, X> : RefTypeError<C, X> : RefTypeError<C, X>;
type GlobalRefHelper<indices extends number, C extends ParentOfC> = { [i in indices]: i extends number ? RefHelper<C, i> : RefTypeError<C, i> } & any[]
declare module '../utils/dependent-type' {
  export interface TypeFuncs<C, X> {
    [F_Custom_Ref]: CondRefHelper<C, X>;
    [F_I_X]: { i: X };
  }
}

class BiMap {
  private byId = new Map<string, [Destructable<any, any, any, any>, Subscription | null]>();
  private byObs = new Map<Destructable<any, any, any, any>, string>();
  get(id: string) { return this.byId.get(id); }
  delete(id: string) { return this.byId.delete(id); }
  set(id: string, value: [Destructable<any, any, any, any>, Subscription | null]) {
    this.byObs.set(value[0], id);
    this.byId.set(id, value);
  };
  find(obs: Destructable<any, any, any, any>) {
    return this.byObs.get(obs);
  };
}

export class Store {
  private map = new BiMap;
  private next = BigInt(1);

  constructor(private extra: Omit<Context, 'deref' | 'xderef' | 'ref'>) { }

  private _unserialize<
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: any },
    i extends indices,
    >(
      handler: RequestHandler<dcim[i][0], dcim[i][1], keys[i]>,
      models: ModelsDefinition<indices, dcim, keys, X> & { [_ in i]: ModelDefinition<dcim[i][0], dcim[i][1], keys[i], X[i]> },
      cache: ObsCache<indices, dcim, keys, X>,
      i: i
    ): NonUndefined<ObsCache<indices, dcim, keys, X>[i]> {
    if (cache[i] !== undefined) return cache[i] as NonUndefined<typeof cache[i]>;
    const model: ModelDefinition<dcim[i][0], dcim[i][1], keys[i], X[i]> = models[i], { reuseId } = model;
    if (model.data === undefined) throw new Error('Trying to access a destructed object');
    const id = reuseId ?? `${this.next++}`;
    const functional = handler.decode(id, model.data);
    if (reuseId !== undefined) {
      const stored = this.map.get(reuseId);
      if (stored !== undefined) {
        stored[0].subject.next(functional);
        const res: ObsCache<indices, dcim, keys, X>[i] = { id: reuseId, obs: stored[0], subs: stored[1] };
        return res as NonUndefined<typeof res>;
      }
    }
    const obs = this._push(handler, functional, id, model.c);
    cache[i] = { obs, id, subs: null };
    return cache[i] as NonUndefined<typeof cache[i]>
  }
  private _push<
    dom,
    cim extends Omit<TVCDA_CIM, 'T'>,
    k extends DepConstaint<Exclude<TVCDA, 'T'>, dom, cim>,
    X extends dom>(
      handler: {
        ctr: DestructableCtr<dom, cim, k>,
        compare?: RequestHandlerCompare<dom, cim, k>,
        destroy?: RequestHandlerDestroy<dom, cim, k>
      },
      functional: FunctionalObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>> & { c: AppX<'C', cim, k, X> },
      id: string,
      c: AppX<'C', cim, k, X>,
  ) {
    const obs = new Destructable<AppX<'V', cim, k, X>, AppX<'C', cim, k, X>, AppX<'D', cim, k, X>, AppX<'A', cim, k, X>>(handler.ctr, c, functional, handler.compare);
    obs.addTearDown(handler.destroy?.(functional.data))
    obs.addTearDown(() => this.map.delete(id));
    this.map.set(id, [obs, null]);
    return obs;
  }
  unserialize<
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: any }
  >(
    getModels: ModelsDefinition<indices, dcim, keys, X> | ((ref: <i extends indices>(i: i) => LocalRef<AppX<'V', dcim[i][1], keys[i], X[i]>>) => ModelsDefinition<indices, dcim, keys, X>)
  ): null | { [i in indices]: GlobalRef<AppX<'V', dcim[i][1], keys[i], X[i]>> } & any[] {
    const session = [] as ObsCache<indices, dcim, keys, X>;
    const models = getModels instanceof Function ? getModels(<i extends number>(i: i) => ({ $: i } as { $: i, _: any })) : getModels;
    const _push = <i extends indices>(i: i) => {
      const modelsAsObject: { [i in indices]: ModelDefinition<dcim[i][0], dcim[i][1], keys[i], X[i]> & { i: i } } = models;
      const m: ModelDefinition<dcim[i][0], dcim[i][1], keys[i], X[i]> & { i: i } = modelsAsObject[i];
      const handler: CtxRequestHandler<dcim[i][0], dcim[i][1], keys[i]> = byKey(RequestHandlers, m.type);
      const modelsNotChanged = Object.assign(models, { [i]: m });
      return { ...this._unserialize<indices, dcim, keys, X, i>(handler(ctx), modelsNotChanged, session, i), m };
    }
    const xderef: xderef = <dom, list extends number, T extends [any, object], Tk extends KeysOfType<TypeFuncs<T[0], dom>, T[1]>, cim extends Record<list, CDA_Im>, k extends { [i in list]: { [P in CDA]: KeysOfType<TypeFuncs<cim[i][P][0], dom>, cim[i][P][1]> } }, X>(
      r: Ref<T[1]>, ...ctrs: xDerefCtrs<dom, list, T, Tk, cim, k, X>): xDerefReturn<dom, list, T, Tk, cim, k, X> => {
      const v = ('id' in r ? this.map.get(r.id)![0] : _push(r.$ as indices).obs) as Destructable<TypeFuncs<T[0], X>[Tk] & T[1], any, any, any>;
      if (ctrs.length && !ctrs.some(([ctr, c]) => v.ctr === ctr && v.c === c)) {
        throw new Error('Type Mismatch');
      }
      return v;
    };
    const deref: deref = <T extends object, ADC extends [any[], any, any][]>(
      r: Ref<T>, ...ctrs: refCtrs<T, ADC>) => {
      const v = ('id' in r ? this.map.get(r.id)![0] : _push(r.$ as indices).obs) as Destructable<T, any, any, any>;
      if (ctrs.length && !ctrs.some(ctr => v.ctr === ctr)) {
        throw new Error('Type Mismatch : ' + v.ctr.name + ' not in ' + JSON.stringify(ctrs.map(x => x.name)));
      }
      return v;
    };
    const ref: ref = <T>(obs: Destructable<T, any, any, any>): GlobalRef<T> => {
      const id = this.map.find(obs)!;
      return { id } as GlobalRef<T>;
    };
    const ctx = {
      deref, xderef, ref, ...this.extra
    };
    const subscriptions: Subscription[] = [];
    const temp: Subscription[] = [];
    try {
      type vcim = { [P in indices]: dcim[P][1]['V'] };
      type vkeys = { [P in indices]: keys[P]['V'] };
      type RefTypeData = { 0: vcim, 1: vkeys, 2: X };
      type Res = TypeFuncs<RefTypeData, indices>[typeof F_Custom_Ref];
      const references: GlobalRefHelper<indices, RefTypeData> = depMap<indices, [
        [never, { i: indices }], [RefTypeData, Res]
      ], [typeof F_I_X, typeof F_Custom_Ref]>(
        models, <i extends indices>({ i }: { i: i }) => {
          const { obs, id, subs, m } = _push(i);
          const isNew = m.isNew !== false;
          if (isNew && subs !== null) throw new Error('Trying to subscribe to an already subscribed entity');
          if (isNew) subscriptions.push(this.map.get(id)![1] = obs.subscribe());
          else temp.push(obs.subscribe());
          const ref = { id } as AppX<'V', dcim[i][1], keys[i], X[i]>;
          return ref as CondRefHelper<RefTypeData, i>;
        });
      temp.forEach(subs => subs.unsubscribe());
      return references;
    } catch (e) {
      console.error(e);
      temp.concat(subscriptions).forEach(subs => subs.unsubscribe());
      return null;
    }
  }

  push<
    dom,
    cim extends Omit<TVCDA_CIM, 'T'>,
    k extends DepConstaint<Exclude<TVCDA, 'T'>, dom, cim>,
    X extends dom>(
      handler: {
        ctr: DestructableCtr<dom, cim, k>,
        compare?: RequestHandlerCompare<dom, cim, k>,
        destroy?: RequestHandlerDestroy<dom, cim, k>
      },
      functional: FunctionalObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>> & { c: AppX<'C', cim, k, X> },
      c: AppX<'C', cim, k, X>,
  ) {
    const id = `${this.next++}`;
    const obs = this._push(handler, functional, id, c)
    const subs = this.map.get(id)![1] = obs.subscribe();
    return { id, obs, subs };
  }

  serialize<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom>(
    obs: Destructable<AppX<'V', cim, k, X>, AppX<'C', cim, k, X>, AppX<'D', cim, k, X>, AppX<'A', cim, k, X>>
  ): Observable<ModelDefinition<dom, cim, k, X>> {
    obs.subject.pipe();
    return 0 as any;
  }
  get(id: string) {
    return this.map.get(id);
  }
  getValue<T>({ id }: GlobalRef<T>) {
    const obs = this.get(id);
    if (obs === undefined) throw new Error('Access to destroyed object');
    return obs as [Destructable<T, any, any, any>, Subscription | null];
  }
}
