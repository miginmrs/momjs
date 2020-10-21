import { Subscription, Observable, Subject } from 'rxjs';
import {
  GlobalRef, LocalRef, Ref, deref, CtxH, TVCDA_CIM, TVCDADepConstaint,
  ModelsDefinition, xDerefHandlers, ModelDefinition, derefReturn, EModelsDefinition,
  xderef, derefHandlers, ref, RHConstraint, ObsWithOrigin, EHConstraint, xDerefHandler, derefHandler,
  AnyModelDefinition, CallHandler, Functions, FdcpConstraint, FkxConstraint, FIDS, TypedDestructable
} from './types'
import { Destructable, EntryObs } from './destructable';
import { KeysOfType, TypeFuncs, AppX, App, Fun } from 'dependent-type';
import { NonUndefined } from 'utility-types';
import { byKey } from '../utils/guards';
import { map as dep_map } from 'dependent-type';
import { eagerCombineAll, current } from '../utils/rx-utils';
import { defineProperty } from '../utils/global';
import { map, shareReplay, finalize, scan, filter, tap, mapTo } from 'rxjs/operators';
import { alternMap } from 'altern-map';
import { asyncMap, Cancellable } from 'rx-async';
import { DeepDestructable } from '.';

const { depMap } = dep_map;

type ObsCache<
  indices extends number,
  dcim extends Record<indices, [unknown, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: unknown },
  N extends Record<indices, 1 | 2>,
  EH extends EHConstraint<EH, ECtx>,
  ECtx
  > = {
    [i in indices]?: {
      obs: Destructable<dcim[i][0], dcim[i][1], keys[i], X[i], N[i], EH, ECtx>,
      id: string, subs?: Subscription
    }
  };

export declare const F_Custom_Ref: unique symbol;
export declare const F_I_X: unique symbol;

type ParentOfC = { 0: any, 1: any, 2: any };
type RefHelper<C extends ParentOfC, X extends number> = App<Fun<C[1][X], C[0][X][0]>, C[2][X]> & C[0][X][1];
type CondRefHelper<C, X> = RefHelper<C & ParentOfC, X & number>;
type GlobalRefHelper<indices extends number, C extends ParentOfC> = { [i in indices]: RefHelper<C, i & number> } & GlobalRef<unknown>[]
declare module 'dependent-type' {
  export interface TypeFuncs<C, X> {
    [F_Custom_Ref]: CondRefHelper<C, X>;
    [F_I_X]: { i: X };
  }
}

export type PromiseCtr = {
  new <T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): PromiseLike<T>;
  all<T>(values: readonly (T | PromiseLike<T>)[]): PromiseLike<T[]>,
  resolve<T>(value: T | PromiseLike<T>): PromiseLike<T>;
}


export const runit = <R, N>(gen: Generator<N | PromiseLike<N>, R, N>, promiseCtr: PromiseCtr) => {
  const runThen = (...args: [] | [N]): PromiseLike<R> => {
    const v = args.length ? gen.next(args[0]) : gen.next();
    if (v.done) return promiseCtr.resolve(v.value);
    return promiseCtr.resolve(v.value).then(runThen);
  }; return runThen();
}

export function* wait<T>(x: T | PromiseLike<T>): Generator<T | PromiseLike<T>, T, T> {
  return yield x;
}

export function asAsync<T extends unknown[], R, U = void, N = unknown>(f: (this: U, ...args: T) => Generator<N | PromiseLike<N>, R, N>, promiseCtr: PromiseCtr, thisArg: U): (...args: T) => PromiseLike<R>;
export function asAsync<T extends unknown[], R, U = void, N = unknown>(f: (this: U | void, ...args: T) => Generator<N | PromiseLike<N>, R, N>, promiseCtr: PromiseCtr, thisArg?: U): (...args: T) => PromiseLike<R>;
export function asAsync<T extends unknown[], R, U = void, N = unknown>(f: (this: U, ...args: T) => Generator<N | PromiseLike<N>, R, N>, promiseCtr: PromiseCtr, thisArg: U): (...args: T) => PromiseLike<R> {
  return (...args: T) => runit(f.call(thisArg, ...args as T), promiseCtr);
}
export class BiMap<EH extends EHConstraint<EH, ECtx>, ECtx, D, k = string> {
  private byId = new Map<k, [ObsWithOrigin<any, EH, ECtx>, D]>();
  private byObs = new Map<TypedDestructable<unknown, EH, ECtx>, k>();
  private oldId = new WeakMap<TypedDestructable<unknown, EH, ECtx>, k>();
  constructor() { }
  get(id: k) { return this.byId.get(id); }
  delete(id: k) {
    const stored = this.byId.get(id);
    if (stored) this.byObs.delete(stored[0].origin);
    return this.byId.delete(id);
  }
  set(id: k, value: [ObsWithOrigin<unknown, EH, ECtx>, D]) {
    if (this.byObs.has(value[0].origin)) throw new Error('Object already in store');
    if (this.byId.has(id)) throw new Error('Id already used');
    this.byObs.set(value[0].origin, id);
    this.oldId.set(value[0].origin, id);
    this.byId.set(id, value);
  };
  reuseId(obs: ObsWithOrigin<unknown, EH, ECtx>, id: k) {
    this.oldId.set(obs.origin, id);
  };
  finddir(obs: ObsWithOrigin<unknown, EH, ECtx>): [k, 'up' | 'down' | 'exact'] | undefined {
    const origin = obs.origin, id = this.byObs.get(origin);
    if (id === undefined) return undefined;
    const found = this.byId.get(id)![0];
    let upfound = found, upobs = obs;
    if (found === obs) return [id, 'exact'];
    const foundParents = new Set([upfound]), obsParents = new Set([upobs]);
    const err = new Error('Another observable with the same origin is in the store');
    while (true) {
      const done = !obsParents.add(upobs = upobs.parent) && !foundParents.add(upfound = upfound.parent);
      if (obsParents.has(upfound)) {
        if (upfound === obs) return [id, 'down'];
        throw err;
      }
      if (foundParents.has(upobs)) {
        if (upobs === found) return [id, 'up'];
        throw err;
      }
      if (done) throw err;
      upobs = upobs.parent;
      upfound = upfound.parent;
    }
  }
  find(obs: ObsWithOrigin<unknown, EH, ECtx>, any = false) {
    return any ? this.byObs.get(obs.origin) : this.finddir(obs)?.[0];
  };
  usedId(obs: ObsWithOrigin<unknown, EH, ECtx>) {
    return this.oldId.get(obs.origin);
  };
  get size() { return this.byId.size }
  keys() { return this.byId.keys() }
  entries() { return this.byId.entries() }
  values() { return this.byId.values() }
}

type Notif<RH extends RHConstraint<RH, ECtx>, ECtx> = [
  'next', EModelsDefinition<0, [[unknown, TVCDA_CIM]], [TVCDADepConstaint<unknown, TVCDA_CIM>], [unknown], [1 | 2], RH, ECtx>
] | ['error', GlobalRef<unknown>, unknown] | ['complete', GlobalRef<unknown>] | ['unsubscribe', GlobalRef<unknown>];

const one = BigInt(1);

/** Options of serialization */
type SerializationOptions = {
  /** @property {boolean} isNew whether the first entry of the first emission should be indicated new or not */
  isNew: boolean,
  /**
   * @property {boolean} push whether the observable should be pushed into the store or not
   * @default true
   */
  push?: boolean,
  /**
   * @property {string[]} ignore ids of destructables that should be ignored from serialization 
   */
  ignore?: string[],
}

export type LocalObs<RH extends RHConstraint<RH, ECtx>, ECtx> = [ObsWithOrigin<unknown, RH, ECtx>, { id: string, in?: boolean, out?: boolean }];

export class Store<RH extends RHConstraint<RH, ECtx>, ECtx,
  fIds extends FIDS,
  fdcp extends FdcpConstraint<fIds>,
  fkx extends FkxConstraint<fIds, fdcp>,
  > {
  private map: BiMap<RH, ECtx, { subscription?: Subscription, externalId?: PromiseLike<string> }>;
  readonly locals: BiMap<RH, ECtx, { in?: boolean, out?: boolean }>;
  constructor(
    readonly handlers: RH, private extra: ECtx, private promiseCtr: PromiseCtr,
    private functions: Functions<RH, ECtx, fIds, fdcp, fkx> | null = null,
    readonly name?: string, readonly prefix = '',
    locals: LocalObs<RH, ECtx>[] = [],
    readonly base = false,
  ) {
    this.functions = functions;
    this.map = new BiMap();
    this.locals = new BiMap();
    for (const [obs, { id, in: isIn, out: isOut }] of locals) this.locals.set(id, [obs, { in: isIn, out: isOut }]);
  }

  private next = one;
  private pushed = new Map<ObsWithOrigin<unknown, RH, ECtx>, string>();
  private pushes = new Subject<[ObsWithOrigin<unknown, RH, ECtx>, string, boolean]>();
  readonly changes = new Observable<Notif<RH, ECtx>>(subscriber => {
    const map = new Map<ObsWithOrigin<unknown, RH, ECtx>, Subscription>();
    const ctx = this.emptyContext;
    const watch = <dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2>(obs: ObsWithOrigin<AppX<'V', cim, k, X>, RH, ECtx> & { origin: Destructable<dom, cim, k, X, n, RH, ECtx> }, id: string): Subscription => {
      const origin = obs.origin, encoder = origin.handler.encode(ctx);
      return origin.subject.pipe(scan((prev: { old?: AppX<'T', cim, k, X> }, v) => {
        const c: AppX<"C", cim, k, X> = origin.c;
        const params = { ...v, ...('old' in prev ? { old: prev.old } : {}), c };
        return { old: encoder(params), params }
      }, {}), filter(({ old: v }) => v !== undefined)).subscribe(
        ({ old: data, params }) => {
          subscriber.next(['next', [{
            c: origin.c, i: 0, data, id, new: !('old' in (params ?? {})), type: origin.key
          }]]);
        },
        err => subscriber.next(['error', { id } as GlobalRef<unknown>, err]),
        () => subscriber.next(['complete', { id } as GlobalRef<unknown>]));
    }
    for (const [obs, id] of this.pushed) map.set(obs, watch(obs, id));
    subscriber.add(this.pushes.subscribe(([obs, id, add]) => {
      if (add) map.set(obs, watch(obs, id));
      else {
        // console.log('remove', this.map.find(obs));
        const isStopped = (obs: ObsWithOrigin<unknown, RH, ECtx>): boolean => {
          const subject = obs.origin.subject;
          if (subject.isStopped) return true;
          return subject.value.args.some(args => args instanceof Array ? args.some(isStopped) : isStopped(args))
        };
        if (!isStopped(obs)) subscriber.next(['unsubscribe', { id } as GlobalRef<unknown>])
        map.get(obs)!.unsubscribe();
        map.delete(obs);
      };
    }))
  });

  subscribeToLocals() {
    const subs = new Subscription();
    const local: [boolean] | undefined = this.base ? [true] : undefined;
    for (const [, [obs]] of this.locals.entries()) {
      subs.add(this.push(obs, { local }).subscription);
    }
    if (local) local[0] = false;
    return subs;
  }

  private getNext(id?: string): string {
    if (id === undefined) return `${this.prefix}${this.next++}`;
    return id;
  }

  watch(callHandler: CallHandler<RH, ECtx, 0, FdcpConstraint<0>, FkxConstraint<0, FdcpConstraint<0>>>) {
    const op = callHandler.handlers<0>();
    return this.changes.subscribe(event => {
      switch (event[0]) {
        case 'next': return op.put(event[1]);
        case 'error': return op.error(event[1], event[2]);
        case 'complete': return op.complete(event[1]);
        case 'unsubscribe': return op.unsubscribe(event[1]);
      }
    })
  }

  /** inserts a new destructable or updates a stored ObsWithOrigin using serialized data */
  private _unserialize<
    indices extends number,
    dcim extends Record<indices, [unknown, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: unknown },
    N extends Record<indices, 1 | 2>,
    i extends indices,
    >(
      key: KeysOfType<RHConstraint<RH, ECtx>, CtxH<dcim[i][0], dcim[i][1], keys[i], N[i], RH, ECtx>> & string,
      ctx: ECtx & { ref: ref<RH, ECtx>, deref: deref<RH, ECtx>, xderef: xderef<RH, ECtx> },
      models: ModelsDefinition<indices, dcim, keys, X, N, RH, ECtx> & { [_ in i]: ModelDefinition<dcim[i][0], dcim[i][1], keys[i], X[i], N[i], RH, ECtx> },
      cache: ObsCache<indices, dcim, keys, X, N, RH, ECtx>,
      i: i,
  ): NonUndefined<ObsCache<indices, dcim, keys, X, N, RH, ECtx>[i]> {
    const handler = byKey<RHConstraint<RH, ECtx>, CtxH<dcim[i][0], dcim[i][1], keys[i], N[i], RH, ECtx>>(this.handlers, key);
    if (cache[i] !== undefined) return cache[i] as NonUndefined<typeof cache[i]>;
    const model: ModelDefinition<dcim[i][0], dcim[i][1], keys[i], X[i], N[i], RH, ECtx> = models[i], { id: usedId } = model;
    if (model.data === undefined) throw new Error('Trying to access a destructed object');
    const id = this.getNext(usedId);
    const local = this.locals.get(id)?.[1];
    if (local && !local.in) {
      throw new Error('Unexpected serialized observable');
    }
    const entry = handler.decode(ctx)(id, model.data, this.get(id)?.[0] ?? null);
    if (usedId !== undefined) {
      const stored = this.map.get(usedId);
      if (stored !== undefined) {
        const obs = stored[0].origin as Destructable<dcim[i][0], dcim[i][1], keys[i], X[i], N[i], RH, ECtx>;
        if (obs.key !== model.type || obs.c !== model.c) {
          throw new Error('Trying to update a wrong type');
        }
        obs.subject.next(entry);
        const res: ObsCache<indices, dcim, keys, X, N, RH, ECtx>[i] = { id: usedId, obs, subs: stored[1].subscription };
        return res as NonUndefined<typeof res>;
      }
    }
    const obs = this._insert<indices, dcim, keys, X, N, i>(key, entry, ctx, id, model.c);
    cache[i] = { obs, id };
    return cache[i] as NonUndefined<typeof cache[i]>
  }
  /** inserts a new destructable into the store with a givin id */
  private _insert<
    indices extends number,
    dcim extends Record<indices, [unknown, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: unknown },
    N extends Record<indices, 1 | 2>,
    i extends indices,
    >(
      key: KeysOfType<RHConstraint<RH, ECtx>, CtxH<dcim[i][0], dcim[i][1], keys[i], N[i], RH, ECtx>> & string,
      entry: EntryObs<AppX<'D', dcim[i][1], keys[i], X[i]>, AppX<'A', dcim[i][1], keys[i], X[i]>, N[i], RH, ECtx>,
      ctx: ECtx & { ref: ref<RH, ECtx>, deref: deref<RH, ECtx>, xderef: xderef<RH, ECtx> },
      id: string,
      c: AppX<'C', dcim[i][1], keys[i], X[i]>,
  ) {
    const handler = byKey<RHConstraint<RH, ECtx>, CtxH<dcim[i][0], dcim[i][1], keys[i], N[i], RH, ECtx>>(this.handlers, key);
    const compare = handler.compare?.(ctx);
    const obs = new Destructable<dcim[i][0], dcim[i][1], keys[i], X[i], N[i], RH, ECtx>(
      this.handlers, key, c, entry, compare, handler.destroy?.(ctx)(entry.data), () => this.map.delete(id));
    this.map.set(id, [obs, {}]);
    return obs;
  }
  ref: ref<RH, ECtx> = <V>(obs: ObsWithOrigin<V, RH, ECtx>): GlobalRef<V> => {
    const id = this.map.find(obs)!;
    return { id } as GlobalRef<V>;
  };
  checkTypes = <
    indices extends number,
    dcim extends Record<indices, [unknown, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: dcim[P][0] },
    N extends Record<indices, 1 | 2>,
    >(v: ObsWithOrigin<{ [P in indices]: dcim[P][1]['V'][1]; }[indices], RH, ECtx>,
      ...args: [xDerefHandlers<indices, dcim, keys, X, N, RH, ECtx>] | [derefHandlers<indices, dcim, keys, N, RH, ECtx>, 0]) => {
    const origin = v.origin;
    const err = () => new Error('Type Mismatch : ' + origin.key + ' not in ' + JSON.stringify(
      depMap(args[0], (x: xDerefHandler<indices, dcim, keys, X, N, RH, ECtx, indices> | derefHandler<indices, dcim, keys, N, RH, ECtx, indices>) => x instanceof Array ? x[0] : x)));
    if (args.length === 1) {
      if (args[0].length && !args[0].some(([key, c]) => origin.handler === byKey(this.handlers, key) && origin.c === c)) throw err();
    } else {
      const handlers: EHConstraint<RH, ECtx> = this.handlers;
      if (args[0].length && !args[0].some(key => origin.handler === byKey(handlers, key))) throw err();
    }
    return v as derefReturn<indices, dcim, keys, X, N, RH, ECtx>;
  };
  getter = <T extends object, V extends T = T>(r: Ref<T>) => {
    if (!('id' in r)) throw new Error('There is no local context');
    return this.getValue(r)[0] as ObsWithOrigin<V, RH, ECtx>;
  }
  xderef = (getter: <T extends object, V extends T = T>(r: Ref<T>) => ObsWithOrigin<V, RH, ECtx>): xderef<RH, ECtx> => <
    indices extends number,
    dcim extends Record<indices, [unknown, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: dcim[P][0] },
    N extends Record<indices, 1 | 2>,
    >(
      ref: Ref<{ [P in indices]: dcim[P][1]['V'][1] }[indices]>,
      ...handlers: xDerefHandlers<indices, dcim, keys, X, N, RH, ECtx>
    ): derefReturn<indices, dcim, keys, X, N, RH, ECtx> => this.checkTypes(getter(ref), handlers);
  deref = (getter: <T extends object>(r: Ref<T>) => ObsWithOrigin<T, RH, ECtx>): deref<RH, ECtx> => <
    indices extends number,
    dcim extends Record<indices, [unknown, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: dcim[P][0] },
    N extends Record<indices, 1 | 2>,
    >(
      ref: Ref<{ [P in indices]: dcim[P][1]['V'][1] }[indices]>,
      ...handlers: derefHandlers<indices, dcim, keys, N, RH, ECtx>
    ) => this.checkTypes<indices, dcim, keys, X, N>(getter(ref), handlers, 0);
  emptyContext = {
    deref: this.deref(this.getter), xderef: this.xderef(this.getter), ref: this.ref, ...this.extra
  };
  /** inserts or updates multiple entries from serialized data with stored subscription to new ones */
  unserialize<
    indices extends number,
    dcim extends Record<indices, [unknown, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: unknown },
    N extends Record<indices, 1 | 2>,
    >(
      getModels: ModelsDefinition<indices, dcim, keys, X, N, RH, ECtx> | ((
        ref: <i extends indices>(i: i) => LocalRef<AppX<'V', dcim[i][1], keys[i], X[i]>>
      ) => ModelsDefinition<indices, dcim, keys, X, N, RH, ECtx>),
  ): { [i in indices]: GlobalRef<AppX<'V', dcim[i][1], keys[i], X[i]>> } & GlobalRef<unknown>[] {
    const session = [] as ObsCache<indices, dcim, keys, X, N, RH, ECtx>;
    const models = getModels instanceof Function ? getModels(<i extends number>(i: i) => ({ $: i } as { $: i, _: any })) : getModels;
    const _push = <i extends indices>(i: i) => {
      const modelsAsObject: { [i in indices]: ModelDefinition<dcim[i][0], dcim[i][1], keys[i], X[i], N[i], RH, ECtx> & { i: i } } = models;
      const m: ModelDefinition<dcim[i][0], dcim[i][1], keys[i], X[i], N[i], RH, ECtx> & { i: i } = modelsAsObject[i];
      const _models = Object.assign(models, { [i]: m });
      return { ...this._unserialize<indices, dcim, keys, X, N, i>(m.type, ctx, _models, session, i), m };
    }
    const getter = <T extends object, V extends T = T>(r: Ref<T>) => ('id' in r ? this.getValue(r)[0] : _push(r.$ as indices).obs) as ObsWithOrigin<V, RH, ECtx>;
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
          const isNew = m.new !== false;
          if (isNew && subs !== undefined) throw new Error('Trying to subscribe to an already subscribed entity');
          if (isNew) subscriptions.push(this.map.get(id)![1].subscription = obs.subscribe(() => { }));
          else if (!obs.subject.isStopped) temp.push(obs.subscribe(() => { }));
          const ref = { id } as AppX<'V', dcim[i][1], keys[i], X[i]>;
          return ref as CondRefHelper<RefTypeData, i>;
        });
      temp.forEach(subs => subs.unsubscribe());
      return references;
    } catch (e) {
      temp.concat(subscriptions).forEach(subs => subs.unsubscribe());
      throw e;
    }
  }

  /** it does nothing useful, there is no use case for this function and no reason for it to stay here */
  append<
    dom, cim extends TVCDA_CIM,
    k extends TVCDADepConstaint<dom, cim>,
    X extends dom,
    n extends 1 | 2,
    >(
      key: KeysOfType<RH, CtxH<dom, cim, k, n, RH, ECtx>> & string,
      entry: EntryObs<AppX<'D', cim, k, X>, AppX<'A', cim, k, X>, n, RH, ECtx>,
      c: AppX<'C', cim, k, X>,
  ) {
    const id = this.getNext();
    const obs = this._insert<0, [[dom, cim]], [k], [X], [n], 0>(key, entry, this.emptyContext, id, c)
    const subs = this.map.get(id)![1].subscription = obs.subscribe(() => { });
    return { id, obs, subs };
  }

  /** adds an ObsWithOrigin to store and subscribe to it without storing subscription  */
  push<V>(obs: ObsWithOrigin<V, RH, ECtx>,
    { unload, nextId, local: $local }: {
      unload?: (ref: GlobalRef<V>) => void,
      nextId?: (obs: ObsWithOrigin<unknown, RH, ECtx>, parentId?: string) => string | undefined,
      local?: [boolean],
    } = {}
  ): { wrapped: ObsWithOrigin<V, RH, ECtx>, ref: GlobalRef<V>, subscription: Subscription } {
    const old = this.map.finddir(obs);
    const id = this.getNext(old?.[0] ?? this.locals.find(obs, true) ?? this.map.usedId(obs.origin) ?? nextId?.(obs));
    let result = obs;
    let subscription: Subscription;

    if (old === undefined) {
      let destroyed = false;
      const temp: Subscription[] = [];
      const clear = function (this: Subscription) {
        temp.forEach(this.add.bind(this));
        temp.length = 0;
      }
      const wrapped = defineProperty(
        Object.assign(eagerCombineAll([
          obs,
          obs.origin.subject.pipe(
            alternMap(({ args, n }) => {
              const wrap = (obs: ObsWithOrigin<unknown, RH, ECtx>) => {
                const res = this.push(obs, { local: $local?.[0] ? $local : undefined, nextId: (nextId && ((obs, pId) => nextId(obs, pId ?? id))) });
                temp.push(res.subscription);
                return res.wrapped;
              };
              const array: (ObsWithOrigin<unknown, RH, ECtx> | Observable<unknown[]>)[] = n === 2
                ? (args as DeepDestructable<unknown[], 2, RH, ECtx>).map(arg => eagerCombineAll(arg.map(wrap)))
                : (args as DeepDestructable<unknown[], 1, RH, ECtx>).map(wrap);
              const ret: Observable<unknown[]> = eagerCombineAll(array);
              return ret;
            }, { completeWithInner: true }),
            tap(clear),
          )
        ]).pipe(
          finalize(() => {
            unload?.({ id } as GlobalRef<V>);
            const local = this.locals.get(id)?.[1];
            if (!local || local.out) {
              this.pushed.delete(obs);
              this.pushes.next([obs, id, false]);
            }
            clear.call(Subscription.EMPTY);
            this.map.delete(id);
            destroyed = true;
          }),
          map(([v]) => v), shareReplay({ bufferSize: 1, refCount: true }),
        ), { origin: obs.origin, parent: obs }),
        'destroyed', { get() { return destroyed } }
      );
      const islocal = $local ? $local[0] : false;
      if (!islocal) result = wrapped;
      this.map.set(id, [result, {}]);
      subscription = wrapped.subscribe();
      const local = this.locals.get(id)?.[1];
      if (!local || local.out) {
        this.pushed.set(obs, id);
        this.pushes.next([obs, id, true]);
      }
    } else {
      if(old[1] === 'down') result = this.map.get(id)![0];
      subscription = result.subscribe();
    }
    return { ref: { id } as GlobalRef<V>, wrapped: result, subscription };
  }

  /**
   * serialize any destructable object regardless wether its in the store
   * @param {Destructable} obs the observable to serialize
   * @param {SerializationOptions} opt options of serialization
   */
  serialize<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2>(
    obs: ObsWithOrigin<AppX<'V', cim, k, X>, RH, ECtx> & { origin: Destructable<dom, cim, k, X, n, RH, ECtx> },
    opt: SerializationOptions
  ) {
    const { isNew, push = true, ignore = [] } = opt;
    type Attr = {
      type: keyof RH & string, value: unknown, data: unknown, new?: boolean,
      resolve?: (x: GlobalRef<unknown>) => void, id?: string, c: unknown,
    };
    type Session = BiMap<RH, ECtx, Attr | null, number>;
    type V = AppX<'V', cim, k, X>;
    type SMRS = [Session, Map<ObsWithOrigin<unknown, RH, ECtx>, { data: unknown }>, Ref<V>, Subscription];
    return obs.pipe(scan<V, SMRS, null>((previous) => {
      const session: Session = new BiMap;
      const allData: SMRS[1] = new Map();
      const subs = new Subscription;
      let next = 1;
      const getter = <T extends object, V extends T = T>(r: Ref<T>) => ('id' in r ? this.map.get(r.id) : session.get(r.$))![0] as ObsWithOrigin<V, RH, ECtx>;
      const inMap = (arg: ObsWithOrigin<unknown, RH, ECtx>) => this.map.find(arg) !== undefined;
      const ref: ref<RH, ECtx> = <V>(iObs: ObsWithOrigin<V, RH, ECtx>): Ref<V> => {
        const origin = iObs.origin, entry = iObs.origin.subject.value;
        const value = current(iObs);
        const id = this.map.find(iObs);
        if (id !== undefined && ignore.indexOf(id) !== -1) return { id } as GlobalRef<V>;
        let oldData: { data: unknown } | undefined = undefined, data: { data: unknown } | undefined;
        if (id !== undefined && previous) {
          const [, old] = previous;
          oldData = old.get(iObs);
        }
        const old = oldData ? { old: oldData.data } : {};
        const encode = () => origin.handler.encode(ctx)({ ...entry, c: origin.c, ...old });
        if (oldData) { //if (isHere)
          data = { data: encode() };
          if (data.data === undefined && id !== undefined) {
            allData.set(iObs, oldData);
            return { id } as GlobalRef<V>;
          }
        }
        const i = session.find(iObs);
        const $ = i ?? (iObs === obs ? 0 : next++);
        if (i === undefined) {
          if (!data) {
            session.set($, [iObs, null]);
            data = { data: encode() };
          }
          allData.set(iObs, data);
          let usedId = id;
          if (usedId === undefined) {
            if (push) {
              const { subscription, ref } = this.push(iObs);
              subs.add(subscription);
              usedId = ref.id;
            } else {
              usedId = this.map.usedId(iObs);
            }
          }
          const attr: Attr = { type: origin.key, value, ...data, c: origin.c, id: usedId };
          attr.new = $ === 0 && previous === null && (isNew || !inMap(iObs));
          const stored = session.get($);
          if (stored) stored[1] = attr;
          else session.set($, [iObs, attr]);
        }
        return { $ } as LocalRef<V>;
      };
      const ctx = {
        deref: this.deref(getter), xderef: this.xderef(getter), ref, ...this.extra
      };
      const ret: SMRS = [session, allData, ref(obs), subs];
      previous?.[3].unsubscribe();
      return ret;
    }, null), map(function (this: Subscription, [session, , ref, subs]) {
      this.add(subs);
      const entries = Array(session.size).fill(0).map((_, i) => session.get(i)!);
      if (entries.length === 0) {
        if ('$' in ref) throw new Error('Unexpected');
        return null;
      }
      return entries.map(([, definition], i) => {
        const def = { i, ...definition! }
        delete def.value;
        return def;
      }) as AnyModelDefinition<RH, ECtx, 0>[] as EModelsDefinition<0, [[dom, cim]], [k], [X], [n], RH, ECtx>
    }), filter((x): x is NonNullable<typeof x> => x !== null));
  }
  get(id: string) {
    return this.map.get(id);
  }
  getValue<V>({ id }: GlobalRef<V>) {
    const obs = this.get(id);
    if (obs === undefined) throw new Error('Access to destroyed object');
    return obs as [ObsWithOrigin<V, RH, ECtx>, (typeof obs)[1]];
  }

  /* #region  local method signatures */
  local<fId extends fIds>(
    fId: fId, param: fdcp[fId][2],
    arg: GlobalRef<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>>,
    opt?: { ignore?: string[], graph: true },
  ): Observable<EModelsDefinition<0, [[fdcp[fId][1][0], fdcp[fId][1][1]]], [fkx[fId][2]], [fkx[fId][3]], [fdcp[fId][1][2]], RH, ECtx>>;
  local<fId extends fIds>(
    fId: fId, param: fdcp[fId][2],
    arg: GlobalRef<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>>,
    opt: { ignore?: string[], graph?: false },
  ): Observable<GlobalRef<AppX<'V', fdcp[fId][1][1], fkx[fId][2], fkx[fId][3]>>>;
  /* #endregion */

  local<fId extends fIds>(
    fId: fId, param: fdcp[fId][2],
    arg: GlobalRef<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>>,
    opt: { ignore?: string[], graph?: boolean } = {},
  ) {
    if (this.functions === null) throw new Error('Cannot call local functions from remote store');
    const f = this.functions[fId];
    const obs = f(param, this.getValue(arg)[0]);
    if (opt.graph) return new Observable<EModelsDefinition<0, [[fdcp[fId][1][0], fdcp[fId][1][1]]], [fkx[fId][2]], [fkx[fId][3]], [fdcp[fId][1][2]], RH, ECtx>>(subscriber => {
      obs.then(obs => {
        const { subscription } = this.push(obs);
        const serialized = this.serialize(obs.origin, { isNew: true, ignore: opt.ignore });
        subscriber.add(serialized.subscribe(subscriber));
        subscriber.add(subscription);
      })
    });
    return new Observable<GlobalRef<AppX<'V', fdcp[fId][1][1], fkx[fId][2], fkx[fId][3]>>>(subscriber => {
      obs.then(obs => {
        const { subscription, ref } = this.push(obs);
        subscriber.next(ref);
        subscriber.add(subscription);
      })
    });
  }

  callReturnRef = new WeakMap<Subscription, PromiseLike<GlobalRef<unknown>>>();

  /* #region remote */
  remote<fId extends fIds>(
    fId: fId,
    arg: ObsWithOrigin<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>, RH, ECtx> & {
      origin: Destructable<fdcp[fId][0][0], fdcp[fId][0][1], fkx[fId][0], fkx[fId][1], fdcp[fId][0][2], RH, ECtx>
    },
    param: fdcp[fId][2],
    { handlers: makeOp, serialized }: CallHandler<RH, ECtx, fIds, fdcp, fkx>,
    opt: { ignore?: string[], graph: true },
  ): Observable<AppX<'V', fdcp[fId][1][1], fkx[fId][2], fkx[fId][3]>>;
  remote<fId extends fIds>(
    fId: fId,
    arg: ObsWithOrigin<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>, RH, ECtx> & {
      origin: Destructable<fdcp[fId][0][0], fdcp[fId][0][1], fkx[fId][0], fkx[fId][1], fdcp[fId][0][2], RH, ECtx>
    },
    param: fdcp[fId][2],
    { handlers: makeOp, serialized }: CallHandler<RH, ECtx, fIds, fdcp, fkx>,
    opt?: { ignore?: string[], graph?: false },
  ): Observable<GlobalRef<AppX<'V', fdcp[fId][1][1], fkx[fId][2], fkx[fId][3]>>>;
  /* #endregion */

  remote<fId extends fIds>(
    fId: fId,
    arg: ObsWithOrigin<AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>, RH, ECtx> & {
      origin: Destructable<fdcp[fId][0][0], fdcp[fId][0][1], fkx[fId][0], fkx[fId][1], fdcp[fId][0][2], RH, ECtx>
    },
    param: fdcp[fId][2],
    { handlers: makeOp, serialized }: CallHandler<RH, ECtx, fIds, fdcp, fkx>,
    opt: { ignore?: string[], graph?: boolean } = {},
  ) {
    type V = AppX<'V', fdcp[fId][0][1], fkx[fId][0], fkx[fId][1]>;
    type V2 = AppX<'V', fdcp[fId][1][1], fkx[fId][2], fkx[fId][3]>;
    return new Observable<V2 | GlobalRef<V2>>(subscriber => {
      const op = makeOp<fId>();
      const { subscription: argSubscription, ref: refArg } = this.push(arg, opt.graph ? {
        unload: (ref) => op.unsubscribe(ref),
      } : {});
      const callSubscription = new Subscription();
      const makePromise = <T>(res?: (x: T) => void) => [new this.promiseCtr<T>(r => res = r), res!] as const;
      const refTask = makePromise<GlobalRef<V2>>();
      if (opt.graph) {
        let serializeObs = serialized.get(arg);
        if (!serializeObs) serialized.set(arg, serializeObs = this.serialize(arg, {
          isNew: true
        }).pipe(asyncMap((def) => {
          const refsPromise = op.put(def);
          return refsPromise.then((refs): Cancellable<GlobalRef<V>> => ({ ok: true, value: refs[0] }));
        }), tap({
          error: e => op.error(refArg, e),
          complete: () => op.complete(refArg),
        }), shareReplay({ refCount: true, bufferSize: 1 })));
        const paramSubs = serializeObs.subscribe();
        this.callReturnRef.set(subscriber, refTask[0]);
        callSubscription.add(() => {
          if (paramSubs.closed) return;
          paramSubs.unsubscribe();
        });
        if (paramSubs.closed) {
          callSubscription.unsubscribe();
          return;
        }
      }
      callSubscription.add(argSubscription);
      const responseSubs = op.subscribeToResult({
        resp_id: (ref) => {
          responseSubs.add(this.getValue(ref)[0].pipe(
            filter((_, index) => index === 0),
            mapTo(ref),
          ).subscribe(subscriber));
          refTask[1](ref);
        },
        resp_call: (data) => {
          const ref = this.unserialize(data)[0];
          responseSubs.add(this.get(ref.id)?.[1].subscription);
          refTask[1](ref);
        },
        err_call: (err) => refTask[0].then(ref => {
          const obs = this.getValue(ref)[0];
          (obs as typeof obs.origin).subject.error(err);
        }),
        comp_call: () => refTask[0].then(ref => {
          const obs = this.getValue(ref)[0];
          (obs as typeof obs.origin).subject.complete();
        })
      });
      callSubscription.add(() => {
        if (!responseSubs.closed) op.end_call()
      });
      callSubscription.add(responseSubs);
      responseSubs.add(callSubscription);
      op.call(fId, param, refArg, opt);
      if (opt.graph) refTask[0].then(refReturn => {
        const subs2 = this.getValue(refReturn)[0].subscribe(subscriber);
        callSubscription.add(() => subs2.unsubscribe());
      })
      subscriber.add(callSubscription);
    });
  }
}
