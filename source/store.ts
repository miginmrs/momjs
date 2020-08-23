import { Observable, Subscription, combineLatest } from 'rxjs';
import {
  GlobalRef, LocalRef, Ref, deref, CtxH, TVCDA_CIM, TVCDADepConstaint,
  TVCDA, ModelsDefinition, xDerefHandlers, ContextualRH, ModelDefinition, CDA, CDA_Im, derefReturn,
  xderef, derefHandlers, DestructableCtr, RequestHandlerDestroy, RequestHandlerCompare, ref, RHConstraint, ObsWithOrigin, EHConstraint, CtxEH, xDerefHandler, derefHandler, EModelDefinition, AnyModelsDefinition, EModelsDefinition,
} from './types'
import { Destructable, EntryObs, TypedDestructable } from './destructable';
import { KeysOfType, TypeFuncs, AppX, App, Fun, BadApp } from 'dependent-type';
import { NonUndefined } from 'utility-types';
import { byKey, subKey } from '../utils/guards';
import { depMap } from 'dependent-type/dist/cjs/map';
import { combine, on, current } from '../utils/rx-utils';
import { defineProperty } from '../utils/global';
import { map, distinctUntilChanged, shareReplay, finalize, tap, scan } from 'rxjs/operators';
import { alternMap } from 'altern-map';
import { asyncMap } from 'rx-async';
import { F_C } from './handlers';


type ObsCache<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: any },
  EH extends EHConstraint<EH, ECtx>,
  ECtx
  > = {
    [i in indices]?: {
      obs: Destructable<dcim[i][0], dcim[i][1], keys[i], X[i], EH, ECtx>,
      id: string, subs?: Subscription
    }
  };

export declare const F_Custom_Ref: unique symbol;
export declare const F_I_X: unique symbol;
// Record<indices, [any, TVCDA_CIM]>
type ParentOfC = { 0: any, 1: any, 2: any };
type RefHelper<C extends ParentOfC, X extends number> = App<Fun<C[1][X], C[0][X][0]>, C[2][X]> & C[0][X][1];
type RefTypeError<C, X> = BadApp<Fun<typeof F_Custom_Ref, C>, X>;
type CondRefHelper<C, X> = X extends number ? C extends ParentOfC ? RefHelper<C, X> : RefTypeError<C, X> : RefTypeError<C, X>;
type GlobalRefHelper<indices extends number, C extends ParentOfC> = { [i in indices]: i extends number ? RefHelper<C, i> : RefTypeError<C, i> } & any[]
declare module 'dependent-type' {
  export interface TypeFuncs<C, X> {
    [F_Custom_Ref]: CondRefHelper<C, X>;
    [F_I_X]: { i: X };
  }
}

export class BiMap<EH extends EHConstraint<EH, ECtx>, ECtx, D, k = string> {
  private byId = new Map<k, [ObsWithOrigin<any, EH, ECtx>, D]>();
  private byObs = new Map<TypedDestructable<any, EH, ECtx>, k>();
  private oldId = new WeakMap<TypedDestructable<any, EH, ECtx>, k>();
  get(id: k) { return this.byId.get(id); }
  delete(id: k) {
    const stored = this.byId.get(id);
    if (stored) this.byObs.delete(stored[0].origin);
    return this.byId.delete(id);
  }
  set(id: k, value: [ObsWithOrigin<any, EH, ECtx>, D]) {
    this.byObs.set(value[0].origin, id);
    this.oldId.set(value[0].origin, id);
    this.byId.set(id, value);
  };
  find(obs: TypedDestructable<any, EH, ECtx>) {
    return this.byObs.get(obs);
  };
  reuseId(obs: TypedDestructable<any, EH, ECtx>) {
    return this.oldId.get(obs);
  };
  keys() { return this.byId.keys() }
  entries() { return this.byId.entries() }
  values() { return this.byId.values() }
}

export class Store<RH extends RHConstraint<RH, ECtx>, ECtx> {
  private map = new BiMap<RH, ECtx, { subscription?: Subscription, externalId?: Promise<string> }>();
  private next = BigInt(1);

  constructor(readonly handlers: RH, private extra: ECtx) { }

  private _unserialize<
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: any },
    i extends indices,
    >(
      key: KeysOfType<RH, CtxH<dcim[i][0], dcim[i][1], keys[i], RH, ECtx>> & string,
      ctx: ECtx & { ref: ref<RH, ECtx>, deref: deref<RH, ECtx>, xderef: xderef<RH, ECtx> },
      models: ModelsDefinition<indices, dcim, keys, X, RH, ECtx> & { [_ in i]: ModelDefinition<dcim[i][0], dcim[i][1], keys[i], X[i], RH, ECtx> },
      cache: ObsCache<indices, dcim, keys, X, RH, ECtx>,
      i: i
    ): NonUndefined<ObsCache<indices, dcim, keys, X, RH, ECtx>[i]> {
    const handler = byKey<RH, CtxH<dcim[i][0], dcim[i][1], keys[i], RH, ECtx>>(this.handlers, key);
    if (cache[i] !== undefined) return cache[i] as NonUndefined<typeof cache[i]>;
    const model: ModelDefinition<dcim[i][0], dcim[i][1], keys[i], X[i], RH, ECtx> = models[i], { reuseId } = model;
    if (model.data === undefined) throw new Error('Trying to access a destructed object');
    const id = reuseId ?? `${this.next++}`;
    const entry = handler.decode(ctx)(id, model.data);
    if (reuseId !== undefined) {
      const stored = this.map.get(reuseId);
      if (stored !== undefined) {
        stored[0].origin.subject.next(entry);
        const obs: Destructable<any, any, any, any, RH, ECtx> = stored[0].origin;
        const res: ObsCache<indices, dcim, keys, X, RH, ECtx>[i] = { id: reuseId, obs, subs: stored[1].subscription };
        return res as NonUndefined<typeof res>;
      }
    }
    const obs = this._insert<indices, dcim, keys, X, i>(key, entry, ctx, id, model.c);
    cache[i] = { obs, id };
    return cache[i] as NonUndefined<typeof cache[i]>
  }
  private _insert<
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: any },
    i extends indices,
    >(
      key: KeysOfType<RH, CtxH<dcim[i][0], dcim[i][1], keys[i], RH, ECtx>> & string,
      entry: EntryObs<AppX<"D", dcim[i][1], keys[i], X[i]>, AppX<"A", dcim[i][1], keys[i], X[i]>, RH, ECtx>,
      ctx: ECtx & { ref: ref<RH, ECtx>, deref: deref<RH, ECtx>, xderef: xderef<RH, ECtx> },
      id: string,
      c: AppX<'C', dcim[i][1], keys[i], X[i]>,
  ) {
    const k = subKey<CtxEH<dcim[i][0], dcim[i][1], keys[i], RH, ECtx>, CtxH<dcim[i][0], dcim[i][1], keys[i], RH, ECtx>, RH, string>(key);
    const handler = byKey<RH, CtxH<dcim[i][0], dcim[i][1], keys[i], RH, ECtx>>(this.handlers, key);
    const compare = handler.compare?.(ctx);
    const obs = new Destructable<dcim[i][0], dcim[i][1], keys[i], X[i], RH, ECtx>(
      this.handlers, k, c, entry, compare, handler.destroy?.(entry.data), () => this.map.delete(id));
    this.map.set(id, [obs, {}]);
    return obs;
  }
  ref: ref<RH, ECtx> = <V>(obs: TypedDestructable<V, RH, ECtx>): GlobalRef<V> => {
    const id = this.map.find(obs)!;
    return { id } as GlobalRef<V>;
  };
  checkTypes = <
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: dcim[P][0] }
  >(v: ObsWithOrigin<{ [P in indices]: dcim[P][1]["V"][1]; }[indices], RH, ECtx>,
    ...args: [xDerefHandlers<indices, dcim, keys, X, RH, ECtx>] | [derefHandlers<indices, dcim, keys, X, RH, ECtx>, 0]) => {
    const err = () => new Error('Type Mismatch : ' + v.origin.key + ' not in ' + JSON.stringify(
      depMap(args[0], (x: xDerefHandler<indices, dcim, keys, X, RH, ECtx, indices> | derefHandler<indices, dcim, keys, X, RH, ECtx, indices>) => x instanceof Array ? x[0] : x)));
    if (args.length === 1) {
      if (args[0].length && !args[0].some(([key, c]) => v.origin.handler === byKey(this.handlers, key) && v.origin.c === c)) throw err();
    } else {
      if (args[0].length && !args[0].some(key => v.origin.handler === byKey(this.handlers, key))) throw err();
    }
    return v as derefReturn<indices, dcim, keys, X, RH, ECtx>;
  };
  getter = <T extends object, V extends T = T>(r: Ref<T>) => {
    if (!('id' in r)) throw new Error('There is no local context');
    return this.map.get(r.id)![0] as ObsWithOrigin<V, RH, ECtx>;
  }
  xderef = (getter: <T extends object, V extends T = T>(r: Ref<T>) => ObsWithOrigin<V, RH, ECtx>): xderef<RH, ECtx> => <
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: dcim[P][0] }
  >(
    ref: Ref<{ [P in indices]: dcim[P][1]['V'][1] }[indices]>,
    ...handlers: xDerefHandlers<indices, dcim, keys, X, RH, ECtx>
  ): derefReturn<indices, dcim, keys, X, RH, ECtx> => this.checkTypes(getter(ref), handlers);
  deref = (getter: <T extends object>(r: Ref<T>) => ObsWithOrigin<T, RH, ECtx>): deref<RH, ECtx> => <
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: dcim[P][0] }
  >(
    ref: Ref<{ [P in indices]: dcim[P][1]['V'][1] }[indices]>,
    ...handlers: derefHandlers<indices, dcim, keys, X, RH, ECtx>
  ) => this.checkTypes(getter(ref), handlers, 0);
  emptyContext = {
    deref: this.deref(this.getter), xderef: this.xderef(this.getter), ref: this.ref, ...this.extra
  };
  decode(
    getModels: AnyModelsDefinition<RH, ECtx> | ((ref: (i: number) => LocalRef<any>) => AnyModelsDefinition<RH, ECtx>)
  ): null | GlobalRef<any>[] {
    return this.unserialize<number, [any, TVCDA_CIM][], Record<TVCDA, typeof F_C>[], any>(getModels as any)
  }
  unserialize<
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: any }
  >(
    getModels: ModelsDefinition<indices, dcim, keys, X, RH, ECtx> | ((ref: <i extends indices>(i: i) => LocalRef<AppX<'V', dcim[i][1], keys[i], X[i]>>) => ModelsDefinition<indices, dcim, keys, X, RH, ECtx>)
  ): null | { [i in indices]: GlobalRef<AppX<'V', dcim[i][1], keys[i], X[i]>> } & GlobalRef<any>[] {
    const session = [] as ObsCache<indices, dcim, keys, X, RH, ECtx>;
    const models = getModels instanceof Function ? getModels(<i extends number>(i: i) => ({ $: i } as { $: i, _: any })) : getModels;
    const _push = <i extends indices>(i: i) => {
      const modelsAsObject: { [i in indices]: ModelDefinition<dcim[i][0], dcim[i][1], keys[i], X[i], RH, ECtx> & { i: i } } = models;
      const m: ModelDefinition<dcim[i][0], dcim[i][1], keys[i], X[i], RH, ECtx> & { i: i } = modelsAsObject[i];
      const modelsNotChanged = Object.assign(models, { [i]: m });
      return { ...this._unserialize<indices, dcim, keys, X, i>(m.type, ctx, modelsNotChanged, session, i), m };
    }
    const getter = <T extends object, V extends T = T>(r: Ref<T>) => ('id' in r ? this.map.get(r.id)![0] : _push(r.$ as indices).obs) as TypedDestructable<V, RH, ECtx>;
    const ref: ref<RH, ECtx> = this.ref;
    const deref: deref<RH, ECtx> = this.deref(getter);
    const xderef: xderef<RH, ECtx> = this.xderef(getter);
    const ctx = { deref, ref, xderef, ...this.extra };
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
        models, <i extends indices>({ i }: { i: i }, index: number) => {
          i = index as i;
          const { obs, id, subs, m } = _push(i);
          const isNew = m.isNew !== false;
          if (isNew && subs !== undefined) throw new Error('Trying to subscribe to an already subscribed entity');
          if (isNew) subscriptions.push(this.map.get(id)![1].subscription = obs.subscribe());
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

  append<
    dom, cim extends TVCDA_CIM,
    k extends TVCDADepConstaint<dom, cim>,
    X extends dom>(
      key: KeysOfType<RH, CtxH<dom, cim, k, RH, ECtx>> & string,
      entry: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, RH, ECtx>,
      c: AppX<'C', cim, k, X>,
  ) {
    const id = `${this.next++}`;
    const obs = this._insert<0, [[dom, cim]], [k], [X], 0>(key, entry, this.emptyContext, id, c)
    const subs = this.map.get(id)![1].subscription = obs.subscribe();
    return { id, obs, subs };
  }
  push<V>(obs: ObsWithOrigin<V, RH, ECtx>) {
    const oldId = this.map.find(obs.origin)
    const id = oldId ?? this.map.reuseId(obs.origin) ?? `${this.next++}`;
    let wrapped = obs;
    if (oldId === undefined) {
      let destroyed = false;
      wrapped = defineProperty(
        Object.assign(combine(obs, obs.origin.subject.pipe(
          alternMap(({ args }) => combine(args.map(arg => this.push(arg).wrapped))),
          distinctUntilChanged((x, y) => x.length === y.length && x.every((v, i) => v === y[i])),
        )).pipe(
          finalize(() => { this.map.delete(id); destroyed = true; }),
          map(([v]) => v),
          shareReplay({ bufferSize: 1, refCount: true }),
        ), { origin: obs.origin, parent: obs }),
        'destroyed', { get() { return destroyed } }
      );
      this.map.set(id, [wrapped, {}]);
    } else {
      wrapped = this.map.get(id)![0];
    }
    return { ref: { id } as GlobalRef<V>, wrapped };
  }
  private waiting = new WeakMap<TypedDestructable<any, RH, ECtx>, Promise<void>>();
  serialize = <dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom>(
    obs: Destructable<dom, cim, k, X, RH, ECtx>,
  ) => {
    type Session = BiMap<RH, ECtx, {
      type: keyof RH & string, c: any, value: any, data: any, isNew?: boolean, reuseId?: string
    } | null, number>;
    type V = AppX<'V', cim, k, X>;
    return obs.pipe(scan<V, Promise<[Session, Ref<V>]> | null>(async oldPromise => {
      const session: Session = new BiMap;
      let next = 0;
      const getter = <T extends object, V extends T = T>(r: Ref<T>) => ('id' in r ? this.map.get(r.id) : session.get(r.$))![0] as TypedDestructable<V, RH, ECtx>;
      const ref: ref<RH, ECtx> = async <V>(obs: TypedDestructable<V, RH, ECtx>): Promise<Ref<V>> => {
        await this.waiting.get(obs);
        const id = this.map.find(obs);
        const value = current<V>(obs);
        if (id !== undefined && oldPromise) {
          const [old] = await oldPromise;
          const old$ = old.find(obs);
          const oldValue = old$ === undefined ? old$ : old.get(old$)?.[1];
          if (oldValue && oldValue.value === value) return { id } as GlobalRef<V>;
        }
        const i = session.find(obs);
        const $ = i ?? next++;
        if (i === undefined) {
          session.set($, [obs.origin, null]);
          const data = await obs.handler.encode(ctx)({ ...obs.origin.subject.value, c: obs.origin.c });
          const reuseId = this.map.reuseId(obs);
          session.set($, [obs.origin, { type: obs.key, value, data, c: obs.c, reuseId }]);
        }
        return { $ } as LocalRef<V>;
      };
      const ctx = {
        deref: this.deref(getter), xderef: this.xderef(getter), ref, ...this.extra
      };
      return [session, await ref(obs)];
    }, null), asyncMap<Promise<[Session, Ref<V>]> | null, [Session, Ref<V>]>(async result => {
      if (!result) return {};
      return { ok: true, value: await result }
    }), map<[Session, Ref<V>], EModelsDefinition<0, [[dom, cim]], [k], [X], RH, ECtx>>(([session, ref]) => {
      const entries = [...session.entries()];
      if (entries.length === 0) {
        if ('$' in ref) throw new Error('Unexpected');
        const model: EModelsDefinition<0, [[dom, cim]], [k], [X], RH, ECtx> = [{ i: 0, type: obs.key, c: obs.c, reuseId: ref.id, }];
        return model;
      }
      return entries.map(([i, [, definition]]) => {
        const def = { i, ...definition! }
        if(i !== 0) def.isNew = false;
        delete def.value;
        return def;
      }) as AnyModelsDefinition<RH, ECtx, 0> as EModelsDefinition<0, [[dom, cim]], [k], [X], RH, ECtx>
    }));
  }
  get(id: string) {
    return this.map.get(id);
  }
  getValue<V>({ id }: GlobalRef<V>) {
    const obs = this.get(id);
    if (obs === undefined) throw new Error('Access to destroyed object');
    return obs as (typeof obs) & { 0: ObsWithOrigin<V, RH, ECtx> };
  }
}
