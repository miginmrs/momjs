import { Subscription, Observable, ObservedValueOf, TeardownLogic, concat, of, NEVER } from 'rxjs';
import {
  GlobalRef, LocalRef, Ref, deref, CtxH, TVCDA_CIM, TVCDADepConstaint,
  ModelsDefinition, xDerefHandlers, ModelDefinition, derefReturn, EModelsDefinition,
  xderef, derefHandlers, ref, RHConstraint, ObsWithOrigin, EHConstraint, xDerefHandler, derefHandler, AnyModelDefinition, CallHandler,
} from './types'
import { Destructable, EntryObs, TypedDestructable, TwoDestructable } from './destructable';
import { KeysOfType, TypeFuncs, AppX, App, Fun, BadApp } from 'dependent-type';
import { NonUndefined } from 'utility-types';
import { byKey } from '../utils/guards';
import { depMap } from 'dependent-type/dist/cjs/map';
import { combine, current } from '../utils/rx-utils';
import { defineProperty } from '../utils/global';
import { map, distinctUntilChanged, shareReplay, finalize, scan, filter, startWith, tap } from 'rxjs/operators';
import { alternMap } from 'altern-map';
import { asyncMap, Cancellable } from 'rx-async';
import { Json, DeepDestructable } from '.';
import { QuickPromise } from '../utils/quick-promise';

type ObsCache<
  indices extends number,
  dcim extends Record<indices, [any, TVCDA_CIM]>,
  keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
  X extends { [P in indices]: any },
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


const runit = <R, N>(gen: Generator<N | PromiseLike<N>, R, N>) => {
  const h = (...args: [] | [N]): PromiseLike<R> => {
    const v = args.length ? gen.next(args[0]) : gen.next();
    if (v.done) return QuickPromise.resolve(v.value);
    return QuickPromise.resolve(v.value).then(h);
  }; return h();
}

function* wait<T>(x: T | PromiseLike<T>): Generator<T | PromiseLike<T>, T, T> {
  return yield x;
}

// function* d() {
//   const i = yield* wait(new Promise<number>(r => setTimeout(() => r(3), 100)));
// }

// runit((function* () { const u = yield new Promise<number>(r => setTimeout(() => r(3), 100)); console.log(u) })())

function asAsync<T extends any[], R, U = void, N = any>(f: (this: U, ...args: T) => Generator<N | PromiseLike<N>, R, N>, thisArg: U): (...args: T) => PromiseLike<R>;
function asAsync<T extends any[], R, U = void, N = any>(f: (this: U | void, ...args: T) => Generator<N | PromiseLike<N>, R, N>, thisArg?: U): (...args: T) => PromiseLike<R>;
function asAsync<T extends any[], R, U = void, N = any>(f: (this: U, ...args: T) => Generator<N | PromiseLike<N>, R, N>, thisArg: U): (...args: T) => PromiseLike<R> {
  return (...args: T) => runit(f.call(thisArg, ...args as T));
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
  reuseId(obs: TypedDestructable<any, EH, ECtx>, id: k) {
    this.oldId.set(obs, id);
  };
  find(obs: TypedDestructable<any, EH, ECtx>) {
    return this.byObs.get(obs);
  };
  usedId(obs: TypedDestructable<any, EH, ECtx>) {
    return this.oldId.get(obs);
  };
  get size() { return this.byId.size }
  keys() { return this.byId.keys() }
  entries() { return this.byId.entries() }
  values() { return this.byId.values() }
}

export class Store<RH extends RHConstraint<RH, ECtx>, ECtx> {
  private map = new BiMap<RH, ECtx, { subscription?: Subscription, externalId?: PromiseLike<string> }>();
  private next = BigInt(1);

  constructor(readonly handlers: RH, private extra: ECtx, readonly name?: string) { }

  private getNext(id?: string): string {
    if (id === undefined) return `${this.next++}`;
    const intId = BigInt(id);
    if (this.next <= intId) this.next = intId + 1n;
    return id;
  }

  findRef<V>(obs: TypedDestructable<V, RH, ECtx>) {
    const id = this.map.find(obs);
    return typeof id === 'string' ? { id } as GlobalRef<V> : id;
  };

  private _unserialize<
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: any },
    N extends Record<indices, 1 | 2>,
    i extends indices,
    >(
      key: KeysOfType<RHConstraint<RH, ECtx>, CtxH<dcim[i][0], dcim[i][1], keys[i], N[i], RH, ECtx>> & string,
      ctx: ECtx & { ref: ref<RH, ECtx>, deref: deref<RH, ECtx>, xderef: xderef<RH, ECtx> },
      models: ModelsDefinition<indices, dcim, keys, X, N, RH, ECtx> & { [_ in i]: ModelDefinition<dcim[i][0], dcim[i][1], keys[i], X[i], N[i], RH, ECtx> },
      cache: ObsCache<indices, dcim, keys, X, N, RH, ECtx>,
      i: i
    ): NonUndefined<ObsCache<indices, dcim, keys, X, N, RH, ECtx>[i]> {
    const handler = byKey<RHConstraint<RH, ECtx>, CtxH<dcim[i][0], dcim[i][1], keys[i], N[i], RH, ECtx>>(this.handlers, key);
    if (cache[i] !== undefined) return cache[i] as NonUndefined<typeof cache[i]>;
    const model: ModelDefinition<dcim[i][0], dcim[i][1], keys[i], X[i], N[i], RH, ECtx> = models[i], { id: usedId } = model;
    if (model.data === undefined) throw new Error('Trying to access a destructed object');
    const id = this.getNext(usedId);
    const entry = handler.decode(ctx)(id, model.data);
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
  private _insert<
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: any },
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
  ref: ref<RH, ECtx> = <V>(obs: TypedDestructable<V, RH, ECtx>): GlobalRef<V> => {
    const id = this.map.find(obs)!;
    return { id } as GlobalRef<V>;
  };
  checkTypes = <
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: dcim[P][0] },
    N extends Record<indices, 1 | 2>,
    >(v: ObsWithOrigin<{ [P in indices]: dcim[P][1]['V'][1]; }[indices], RH, ECtx>,
      ...args: [xDerefHandlers<indices, dcim, keys, X, N, RH, ECtx>] | [derefHandlers<indices, dcim, keys, N, RH, ECtx>, 0]) => {
    const err = () => new Error('Type Mismatch : ' + v.origin.key + ' not in ' + JSON.stringify(
      depMap(args[0], (x: xDerefHandler<indices, dcim, keys, X, N, RH, ECtx, indices> | derefHandler<indices, dcim, keys, N, RH, ECtx, indices>) => x instanceof Array ? x[0] : x)));
    if (args.length === 1) {
      if (args[0].length && !args[0].some(([key, c]) => v.origin.handler === byKey(this.handlers, key) && v.origin.c === c)) throw err();
    } else {
      const handlers: EHConstraint<RH, ECtx> = this.handlers;
      if (args[0].length && !args[0].some(key => v.origin.handler === byKey(handlers, key))) throw err();
    }
    return v as derefReturn<indices, dcim, keys, X, N, RH, ECtx>;
  };
  getter = <T extends object, V extends T = T>(r: Ref<T>) => {
    if (!('id' in r)) throw new Error('There is no local context');
    return this.map.get(r.id)![0] as ObsWithOrigin<V, RH, ECtx>;
  }
  xderef = (getter: <T extends object, V extends T = T>(r: Ref<T>) => ObsWithOrigin<V, RH, ECtx>): xderef<RH, ECtx> => <
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: dcim[P][0] },
    N extends Record<indices, 1 | 2>,
    >(
      ref: Ref<{ [P in indices]: dcim[P][1]['V'][1] }[indices]>,
      ...handlers: xDerefHandlers<indices, dcim, keys, X, N, RH, ECtx>
    ): derefReturn<indices, dcim, keys, X, N, RH, ECtx> => this.checkTypes(getter(ref), handlers);
  deref = (getter: <T extends object>(r: Ref<T>) => ObsWithOrigin<T, RH, ECtx>): deref<RH, ECtx> => <
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
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
  unserialize<
    indices extends number,
    dcim extends Record<indices, [any, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: any },
    N extends Record<indices, 1 | 2>,
    >(
      getModels: ModelsDefinition<indices, dcim, keys, X, N, RH, ECtx> | ((
        ref: <i extends indices>(i: i) => LocalRef<AppX<'V', dcim[i][1], keys[i], X[i]>>
      ) => ModelsDefinition<indices, dcim, keys, X, N, RH, ECtx>)
    ): { [i in indices]: GlobalRef<AppX<'V', dcim[i][1], keys[i], X[i]>> } & GlobalRef<any>[] {
    const session = [] as ObsCache<indices, dcim, keys, X, N, RH, ECtx>;
    const models = getModels instanceof Function ? getModels(<i extends number>(i: i) => ({ $: i } as { $: i, _: any })) : getModels;
    const _push = <i extends indices>(i: i) => {
      const modelsAsObject: { [i in indices]: ModelDefinition<dcim[i][0], dcim[i][1], keys[i], X[i], N[i], RH, ECtx> & { i: i } } = models;
      const m: ModelDefinition<dcim[i][0], dcim[i][1], keys[i], X[i], N[i], RH, ECtx> & { i: i } = modelsAsObject[i];
      const _models = Object.assign(models, { [i]: m });
      return { ...this._unserialize<indices, dcim, keys, X, N, i>(m.type, ctx, _models, session, i), m };
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
  push<V>(obs: ObsWithOrigin<V, RH, ECtx>, ids?: WeakMap<TypedDestructable<any, RH, ECtx>, string>, unload?: () => void) {
    const oldId = this.map.find(obs.origin)
    const id = this.getNext(oldId ?? ids?.get(obs.origin) ?? this.map.usedId(obs.origin));
    let wrapped = obs;
    if (oldId === undefined) {
      let destroyed = false;
      wrapped = defineProperty(
        Object.assign(combine(obs, obs.origin.subject.pipe(
          alternMap(({ args, n }) => {
            const array: (ObsWithOrigin<any, RH, ECtx> | Observable<any[]>)[] = n === 2
              ? (args as DeepDestructable<any, 2, RH, ECtx>).filter(a => a.length !== 0).map(arg => combine(arg.map(x => this.push(x, ids).wrapped)))
              : (args as DeepDestructable<any, 1, RH, ECtx>).map(arg => this.push(arg, ids).wrapped);
            return array.length ? combine(array) : concat(of([]), NEVER);
          }, { completeWithInner: true, completeWithSource: true }),
          distinctUntilChanged<(ObsWithOrigin<any, RH, ECtx> | ObsWithOrigin<any, RH, ECtx>[])[]>(
            (x, y) => x.length === y.length && x.every((v, i) => {
              const w = y[i];
              if (v instanceof Array && w instanceof Array) {
                return v.length === w.length && v.every((u, i) => u === w[i]);
              }
              return v === w
            })),
        )).pipe(
          finalize(() => { unload?.(); this.map.delete(id); destroyed = true; }),
          map(([v]) => v), shareReplay({ bufferSize: 1, refCount: true }),
        ), { origin: obs.origin, parent: obs }),
        'destroyed', { get() { return destroyed } }
      );
      this.map.set(id, [wrapped, {}]);
    } else {
      wrapped = this.map.get(id)![0];
    }
    return { ref: { id } as GlobalRef<V>, wrapped };
  }
  private waiting = new WeakMap<TypedDestructable<any, RH, ECtx>, PromiseLike<GlobalRef<any>>>();
  getResolver = <V>(obs: TypedDestructable<V, RH, ECtx>) => {
    let resolve!: (ref: GlobalRef<V>) => void;
    const promise = new QuickPromise<GlobalRef<V>>(res => resolve = res);
    this.waiting.set(obs, promise);
    promise.then(ref => { this.waiting.delete(obs) });
    return resolve;
  }
  serialize = <dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2>(
    obs: Destructable<dom, cim, k, X, n, RH, ECtx>,
    getResolver?: <V>(obs: TypedDestructable<V, RH, ECtx>) => (ref: GlobalRef<V>) => void,
    isNew: boolean = true,
  ) => {
    type Attr = {
      type: keyof RH & string, c: any, value: any, data: any, new?: boolean, id?: string,
      resolve?: (x: GlobalRef<any>) => void
    };
    type Session = BiMap<RH, ECtx, Attr | null, number>;
    type V = AppX<'V', cim, k, X>;
    type SMR = [Session, Map<TypedDestructable<any, RH, ECtx>, { data: any }>, Ref<V>];
    return obs.pipe(scan<V, PromiseLike<SMR> | null>(asAsync<[PromiseLike<SMR> | null], SMR, this>(function* (oldPromise): Generator<any, SMR, any> {
      const session: Session = new BiMap;
      const allData: SMR[1] = new Map();
      let next = 1;
      const getter = <T extends object, V extends T = T>(r: Ref<T>) => ('id' in r ? this.map.get(r.id) : session.get(r.$))![0] as TypedDestructable<V, RH, ECtx>;
      const snapshot = new Map<TypedDestructable<any, RH, ECtx>, { data: any, entry: EntryObs<any, any, any, RH, ECtx> }>();
      const inMap = (arg: TypedDestructable<any, RH, ECtx>) => this.map.find(arg) !== undefined;
      const addToSnapshot = (obs: TypedDestructable<any, RH, ECtx>) => {
        if (snapshot.has(obs)) return;
        const entry = obs.subject.value;
        snapshot.set(obs, { data: current(obs), entry });
        entry.args.forEach(args => {
          if (args instanceof Array) args.forEach(addToSnapshot);
          else addToSnapshot(args);
        });
      }
      addToSnapshot(obs);
      const ref: ref<RH, ECtx> = <V>(iObs: TypedDestructable<V, RH, ECtx>): PromiseLike<Ref<V>> => asAsync(function* () {
        let { data: value, entry } = snapshot.get(iObs)!;
        yield this.waiting.get(iObs);
        const id = this.map.find(iObs);
        //const isHere = true; //entry.args.every(arg => arg instanceof Array ? arg.every(inMap) : inMap(arg));
        const resolve = id === undefined ? getResolver?.(iObs) : undefined;
        let oldData: { data: any } | undefined = undefined, data: { data: any } | undefined;
        if (id !== undefined && oldPromise) {
          const [, old] = yield* wait(oldPromise);
          oldData = old.get(iObs);
        }
        const old = oldData ? { old: oldData.data } : {};
        const encode = () => iObs.handler.encode(ctx)({ ...entry, c: iObs.c, ...old });
        if (oldData) { //if (isHere)
          data = { data: yield* wait(encode()) };
          if (data.data === undefined) {
            allData.set(iObs, oldData);
            return { id } as GlobalRef<V>;
          }
        }
        const i = session.find(iObs);
        const $ = i ?? (iObs === obs ? 0 : next++);
        if (i === undefined) {
          if (!data) {
            session.set($, [iObs, null]);
            data = { data: yield* wait(encode()) };
          }
          allData.set(iObs, data);
          const usedId = this.map.usedId(iObs);
          const attr: Attr = { type: iObs.key, value, ...data, c: iObs.c, id: usedId };
          if (resolve) attr.resolve = resolve;
          attr.new = $ === 0 && oldPromise === null && (isNew || !inMap(iObs));
          session.set($, [iObs, attr]);
        }
        return { $ } as LocalRef<V>;
      }, this)();
      const ctx = {
        deref: this.deref(getter), xderef: this.xderef(getter), ref, ...this.extra
      };
      const ret: SMR = [session, allData, yield* wait(QuickPromise.resolve(ref(obs)))];
      return ret;
    }, this), null), asyncMap<PromiseLike<SMR> | null, SMR>(result => {
      return runit((function* () {
        const ret: Cancellable<SMR> = result ? { ok: true, value: yield* wait(result) } : {};
        return ret;
      })());
    }, { mode: 'merge', wait: true }), map(([session, , ref]) => {
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
  functions: ((param: Json, arg: ObsWithOrigin<any, RH, ECtx>) => TypedDestructable<any, RH, ECtx>)[] = [];
  call(fId: number, param: Json, arg: GlobalRef<any>) {
    const obs = this.functions[fId](param, this.getValue(arg)[0]);
    const wrapped = this.push(obs).wrapped;
    const serialized = this.serialize(obs);
    return new Observable<ObservedValueOf<typeof serialized>>(subscriber => {
      subscriber.add(wrapped.subscribe(() => { }));
      subscriber.add(serialized.subscribe(subscriber));
    });
  }
  remote<dom2, cim2 extends TVCDA_CIM, k2 extends TVCDADepConstaint<dom2, cim2>, X2 extends dom2, n2 extends 1 | 2>() {
    return <dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2, P extends Json>(
      fId: number, arg: Destructable<dom, cim, k, X, n, RH, ECtx>, param: P,
      { handlers: makeOp, serialized }: CallHandler<dom, cim, k, X, n, P, dom2, cim2, k2, X2, n2, RH, ECtx>
    ) => new Observable<AppX<'V', cim2, k2, X2>>(subscriber => void (asAsync(function* () {
      type V = AppX<'V', cim, k, X>;
      const makePromise = <T>(res?: (x: T) => void) => [new QuickPromise<T>(r => res = r), res!] as const;
      const [promise, resolve] = makePromise<GlobalRef<V>>();
      //const ids = new WeakMap<TypedDestructable<any, RH, ECtx>, string>();
      const callSubscription = new Subscription();
      yield* wait(this.waiting.get(arg));
      const op = makeOp();
      let refObs = serialized.get(arg);
      if (!refObs) serialized.set(arg, refObs = this.serialize(arg, obs => {
        const resolver = this.getResolver(obs);
        const withInsertion: typeof resolver = ref => {
          this.map.reuseId(obs, ref.id);
          resolver(ref);
        };
        return withInsertion;
      }, false).pipe(asyncMap(asAsync(function* (def) {
        const refsPromise = op.next();
        op.put(def);
        const refs = yield* wait(refsPromise);
        refs.forEach((ref, i) => def[i]?.resolve?.(ref));
        const ret: Cancellable<GlobalRef<V>> = { ok: true, value: refs[0] };
        return ret;
      })), tap(
        undefined,
        e => promise.then(refArg => op.error(refArg, e)),
        () => promise.then(refArg => op.call_complete(refArg)),
      ), shareReplay({ refCount: true, bufferSize: 1 })));
      const paramSubs = refObs.subscribe(ref => resolve(ref));
      promise.then(refArg => {
        callSubscription.add(() => {
          if (paramSubs.closed) return;
          paramSubs.unsubscribe();
        });
        if (paramSubs.closed) {
          callSubscription.unsubscribe();
          return;
        }
        const { wrapped } = this.push(arg, undefined, () => {
          debugger;
          op.call_unsubscribe(refArg)
        });
        const subs = wrapped.subscribe(() => { });
        callSubscription.add(() => subs.unsubscribe());
        const refTask = makePromise<GlobalRef<AppX<'V', cim2, k2, X>>>();
        const responseSubs = op.subscribeToResult({
          resp_call: (data) => {
            let closed = callSubscription.closed;
            Object.defineProperty(callSubscription, 'closed', {
              enumerable: true, get: () => closed, set: v => {
                if (v) debugger;
                closed = v
              }
            });
            const ref = this.unserialize(data)[0];
            responseSubs.add(this.get(ref.id)?.[1].subscription);
            refTask[1](ref);
          },
          err_call: (err) => {
            refTask[0].then(ref => {
              const obs = this.getValue(ref)[0];
              (obs as typeof obs.origin).subject.error(err);
            })
          },
          comp_call: () => {
            refTask[0].then(ref => {
              const obs = this.getValue(ref)[0];
              (obs as typeof obs.origin).subject.complete();
            })
          }
        });
        callSubscription.add(() => {
          if (!responseSubs.closed) op.end_call()
        });
        callSubscription.add(responseSubs);
        responseSubs.add(callSubscription);
        op.call(fId, param, refArg);
        return refTask[0];
      }).then(ref => {
        if (!ref) return;
        const subs = this.getValue(ref)[0].subscribe(subscriber);
        callSubscription.add(() => subs.unsubscribe());
      });
      subscriber.add(callSubscription);
    }, this))());
  }
}
