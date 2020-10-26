import type { KeysOfType, TypeFuncs, AppX, App, Fun } from 'dependent-type';
import type { NonUndefined } from 'utility-types';
import type { GlobalRef, LocalRef, Ref, TVCDADepConstaint, TVCDA_CIM } from './types/basic';
import type {
  deref, xDerefHandlers, derefReturn, DeepSerial, EntryObs,
  derefHandlers, ref, TSerialObs, EHConstraint, xDerefHandler, derefHandler,
} from './types/serial';
import type {
  CallHandler, FdcpConstraint, FkxConstraint, FIDS, Functions,
  RHConstraint, CtxH, xderef, ModelsDefinition, ModelDefinition,
  AnyModelDefinition, EModelsDefinition
} from './types/store';
import type {
  Notif, ObsCache, F_Custom_Ref, GlobalRefHelper, F_I_X, CondRefHelper, SerializationOptions
} from './types/params';

import { Subscription, Observable, Subject } from 'rxjs';
import { map as dep_map } from 'dependent-type';
import { Origin } from './origin';
import { eagerCombineAll, current } from '../utils/rx-utils';
import { defineProperty } from '../utils/global';
import { map, shareReplay, finalize, scan, filter, tap, mapTo } from 'rxjs/operators';
import { alternMap } from 'altern-map';
import { asyncMap, Cancellable } from 'rx-async';
import { BiMap } from './bimap';
import { PromiseCtr } from './async';

const { depMap } = dep_map;

const one = BigInt(1);


/** Options of push */
export type PushOptions<V, RH extends RHConstraint<RH, ECtx>, ECtx> = {
  unload?: (ref: GlobalRef<V>) => void,
  nextId?: (obs: TSerialObs<unknown, RH, ECtx>, parentId?: string) => string | undefined,
  local?: Subscription & { [Store.nodeps]?: boolean },
};

export type LocalOption<RH extends RHConstraint<RH, ECtx>, ECtx> = { in?: boolean, out?: boolean } & PushOptions<unknown, RH, ECtx>;
export type LocalObs<RH extends RHConstraint<RH, ECtx>, ECtx> = [TSerialObs<unknown, RH, ECtx>, { id: string } & LocalOption<RH, ECtx>];


export class Store<RH extends RHConstraint<RH, ECtx>, ECtx,
  lfIds extends FIDS,
  lfdcp extends FdcpConstraint<lfIds>,
  lfkx extends FkxConstraint<lfIds, lfdcp>,
  rfIds extends FIDS,
  rfdcp extends FdcpConstraint<rfIds>,
  rfkx extends FkxConstraint<rfIds, rfdcp>,
  > {
  protected map: BiMap<RH, ECtx, { subscription?: Subscription, externalId?: PromiseLike<string> }>;
  readonly locals: BiMap<RH, ECtx, LocalOption<RH, ECtx>>;
  readonly empty: Observable<void>;
  constructor(
    readonly getHandler: <R>(k: KeysOfType<RHConstraint<RH, ECtx>, R>) => R, private extra: ECtx, private promiseCtr: PromiseCtr,
    private functions: Functions<RH, ECtx, lfIds, lfdcp, lfkx> | null = null,
    readonly name?: string, readonly prefix = '',
    locals: LocalObs<RH, ECtx>[] = [],
    readonly base = false,
  ) {
    this.functions = functions;
    const map = this.map = new BiMap(true);
    this.empty = map.empty;
    this.locals = new BiMap();
    for (const [obs, { id, ...opt }] of locals) this.locals.set(id, [obs, opt]);
  }

  private next = one;
  private pushed = new Map<TSerialObs<unknown, RH, ECtx>, string>();
  private pushes = new Subject<[TSerialObs<unknown, RH, ECtx>, string, boolean]>();
  readonly changes = new Observable<Notif<RH, ECtx>>(subscriber => {
    const map = new Map<TSerialObs<unknown, RH, ECtx>, Subscription>();
    const ctx = this.emptyContext;
    const watch = <dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2>(obs: TSerialObs<AppX<'V', cim, k, X>, RH, ECtx> & { origin: Origin<dom, cim, k, X, n, RH, ECtx> }, id: string): Subscription => {
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
        const isStopped = (obs: TSerialObs<unknown, RH, ECtx>): boolean => {
          const set = new Set([obs]);
          while (!set.has(obs = obs.parent)) set.add(obs);
          if (!set.has(obs.origin)) return false;
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

  subscribeToLocals($local?: Subscription | undefined) {
    const subs = new Subscription();
    const local: Subscription | undefined = $local ?? (this.base ? subs : undefined);
    for (const [, [obs, { local: $local }]] of this.locals.entries()) {
      subs.add(this.push(obs, { local: $local ?? local }).subscription);
    }
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

  /** inserts a new serial observable or updates a stored ObsWithOrigin using serialized data */
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
    const handler = this.getHandler<CtxH<dcim[i][0], dcim[i][1], keys[i], N[i], RH, ECtx>>(key);
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
        const obs = stored[0].origin as Origin<dcim[i][0], dcim[i][1], keys[i], X[i], N[i], RH, ECtx>;
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
  /** inserts a new serial observable into the store with a givin id */
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
    const getHandler = this.getHandler, handler = getHandler<CtxH<dcim[i][0], dcim[i][1], keys[i], N[i], RH, ECtx>>(key);
    const compare = handler.compare?.(ctx);
    const obs = new Origin<dcim[i][0], dcim[i][1], keys[i], X[i], N[i], RH, ECtx>(getHandler, key, c, entry, compare, () => this.map.delete(id));
    this.map.set(id, [obs, {}]);
    return obs;
  }
  ref: ref<RH, ECtx> = <V>(obs: TSerialObs<V, RH, ECtx>): GlobalRef<V> => {
    const id = this.map.find(obs)!;
    return { id } as GlobalRef<V>;
  };
  checkTypes = <
    indices extends number,
    dcim extends Record<indices, [unknown, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: dcim[P][0] },
    N extends Record<indices, 1 | 2>,
    >(v: TSerialObs<{ [P in indices]: dcim[P][1]['V'][1]; }[indices], RH, ECtx>,
      ...args: [xDerefHandlers<indices, dcim, keys, X, N, RH, ECtx>] | [derefHandlers<indices, dcim, keys, N, RH, ECtx>, 0]) => {
    const origin = v.origin, getHandler = this.getHandler;
    const err = () => new Error('Type Mismatch : ' + origin.key + ' not in ' + JSON.stringify(
      depMap(args[0], (x: xDerefHandler<indices, dcim, keys, X, N, RH, ECtx, indices> | derefHandler<indices, dcim, keys, N, RH, ECtx, indices>) => x instanceof Array ? x[0] : x)));
    if (args.length === 1) {
      if (args[0].length && !args[0].some(([key, c]) => origin.handler === getHandler(key) && origin.c === c)) throw err();
    } else {
      if (args[0].length && !args[0].some(key => origin.handler === getHandler(key))) throw err();
    }
    return v as derefReturn<indices, dcim, keys, X, N, RH, ECtx>;
  };
  getter = <T extends object, V extends T = T>(r: Ref<T>) => {
    if (!('id' in r)) throw new Error('There is no local context');
    return this.getValue(r)[0] as TSerialObs<V, RH, ECtx>;
  }
  xderef = (getter: <T extends object, V extends T = T>(r: Ref<T>) => TSerialObs<V, RH, ECtx>): xderef<RH, ECtx> => <
    indices extends number,
    dcim extends Record<indices, [unknown, TVCDA_CIM]>,
    keys extends { [P in indices]: TVCDADepConstaint<dcim[P][0], dcim[P][1]> },
    X extends { [P in indices]: dcim[P][0] },
    N extends Record<indices, 1 | 2>,
    >(
      ref: Ref<{ [P in indices]: dcim[P][1]['V'][1] }[indices]>,
      ...handlers: xDerefHandlers<indices, dcim, keys, X, N, RH, ECtx>
    ): derefReturn<indices, dcim, keys, X, N, RH, ECtx> => this.checkTypes(getter(ref), handlers);
  deref = (getter: <T extends object>(r: Ref<T>) => TSerialObs<T, RH, ECtx>): deref<RH, ECtx> => <
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
    const getter = <T extends object, V extends T = T>(r: Ref<T>) => ('id' in r ? this.getValue(r)[0] : _push(r.$ as indices).obs) as TSerialObs<V, RH, ECtx>;
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
          if (isNew) {
            const attr = this.map.get(id)![1];
            subscriptions.push(attr.subscription = obs.subscribe(() => { }));
            attr.subscription.add(() => attr.subscription = undefined);
          }
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

  static readonly nodeps: unique symbol = Symbol();

  /** adds an ObsWithOrigin to store and subscribe to it without storing subscription  */
  push<V>(obs: TSerialObs<V, RH, ECtx>,
    { unload, nextId, local: $local }: PushOptions<V, RH, ECtx> = {}
  ): { wrapped: TSerialObs<V, RH, ECtx>, ref: GlobalRef<V>, subscription: Subscription } {
    const old = this.map.finddir(obs);
    const id = this.getNext(old?.[0] ?? this.locals.find(obs, true) ?? this.map.usedId(obs.origin) ?? nextId?.(obs));
    let wrapped = obs;
    let subscription: Subscription;

    if (old === undefined) {
      let destroyed = false;
      const temp: Subscription[] = [];
      const clear = function (this: Subscription) {
        temp.forEach(this.add.bind(this));
        temp.length = 0;
      }
      const asubj = obs.origin.subject.pipe(
        alternMap(({ args, n }) => {
          const wrap = (obs: TSerialObs<unknown, RH, ECtx>) => {
            const res = this.push(obs, { local: $local, nextId: (nextId && ((obs, pId) => nextId(obs, pId ?? id))) });
            temp.push(res.subscription);
            return res.wrapped;
          };
          const array: (TSerialObs<unknown, RH, ECtx> | Observable<unknown[]>)[] = n === 2
            ? (args as DeepSerial<unknown[], 2, RH, ECtx>).map(arg => eagerCombineAll(arg.map(wrap)))
            : (args as DeepSerial<unknown[], 1, RH, ECtx>).map(wrap);
          const ret: Observable<unknown[]> = eagerCombineAll(array);
          return ret;
        }, { completeWithInner: true }),
        tap(clear),
      );
      const teardown = () => {
        unload?.({ id } as GlobalRef<V>);
        this.map.delete(id);
        destroyed = true;
        const local = this.locals.get(id)?.[1];
        if ((!local || local.out) && this.pushed.delete(obs)) {
          this.pushes.next([obs, id, false]);
        }
        clear.call(Subscription.EMPTY);
      };
      if ($local?.closed !== false) {
        wrapped = defineProperty(
          Object.assign(eagerCombineAll([obs, asubj]).pipe(
            finalize(teardown),
            map(([v]) => v), shareReplay({ bufferSize: 1, refCount: true }),
          ), { origin: obs.origin, parent: obs }),
          'destroyed', { get() { return destroyed } }
        );
        this.map.set(id, [wrapped, {}]);
        subscription = wrapped.subscribe(() => { });
      } else {
        if (!$local[Store.nodeps]) $local.add(asubj.subscribe(() => { }));
        $local.add(teardown);
        this.map.set(id, [wrapped, {}]);
        subscription = wrapped.subscribe(() => { });
      }
      const local = this.locals.get(id)?.[1];
      if (!local || local.out) {
        this.pushed.set(obs, id);
        this.pushes.next([obs, id, true]);
      }
    } else {
      if (old[1] === 'down') wrapped = this.map.get(id)![0];
      subscription = wrapped.subscribe(() => { });
    }
    return { ref: { id } as GlobalRef<V>, wrapped, subscription };
  }

  /**
   * serialize any serial observable regardless wether its in the store
   * @param {Origin} obs the observable to serialize
   * @param {SerializationOptions} opt options of serialization
   */
  serialize<dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2>(
    obs: TSerialObs<AppX<'V', cim, k, X>, RH, ECtx> & { origin: Origin<dom, cim, k, X, n, RH, ECtx> },
    opt: SerializationOptions
  ) {
    const { isNew, push = true, ignore = [] } = opt;
    type Attr = {
      type: keyof RH & string, value: unknown, data: unknown, new?: boolean,
      resolve?: (x: GlobalRef<unknown>) => void, id?: string, c: unknown,
    };
    type Session = BiMap<RH, ECtx, Attr | null, number>;
    type V = AppX<'V', cim, k, X>;
    type SMRS = [Session, Map<TSerialObs<unknown, RH, ECtx>, { data: unknown }>, Ref<V>, Subscription];
    return obs.pipe(scan<V, SMRS, null>((previous) => {
      const session: Session = new BiMap;
      const allData: SMRS[1] = new Map();
      const subs = new Subscription;
      let next = 1;
      const getter = <T extends object, V extends T = T>(r: Ref<T>) => ('id' in r ? this.map.get(r.id) : session.get(r.$))![0] as TSerialObs<V, RH, ECtx>;
      const inMap = (arg: TSerialObs<unknown, RH, ECtx>) => this.map.find(arg) !== undefined;
      const ref: ref<RH, ECtx> = <V>(iObs: TSerialObs<V, RH, ECtx>): Ref<V> => {
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
    return obs as [TSerialObs<V, RH, ECtx>, (typeof obs)[1]];
  }

  /* #region  local method signatures */
  call<fId extends lfIds>(
    fId: fId, param: lfdcp[fId][2],
    arg: GlobalRef<AppX<'V', lfdcp[fId][0][1], lfkx[fId][0], lfkx[fId][1]>>,
    opt?: { ignore?: string[], graph: true },
  ): Observable<EModelsDefinition<0, [[lfdcp[fId][1][0], lfdcp[fId][1][1]]], [lfkx[fId][2]], [lfkx[fId][3]], [lfdcp[fId][1][2]], RH, ECtx>>;
  call<fId extends lfIds>(
    fId: fId, param: lfdcp[fId][2],
    arg: GlobalRef<AppX<'V', lfdcp[fId][0][1], lfkx[fId][0], lfkx[fId][1]>>,
    opt: { ignore?: string[], graph?: false },
  ): Observable<GlobalRef<AppX<'V', lfdcp[fId][1][1], lfkx[fId][2], lfkx[fId][3]>>>;
  /* #endregion */

  call<fId extends lfIds>(
    fId: fId, param: lfdcp[fId][2],
    arg: GlobalRef<AppX<'V', lfdcp[fId][0][1], lfkx[fId][0], lfkx[fId][1]>>,
    opt: { ignore?: string[], graph?: boolean } = {},
  ) {
    if (this.functions === null) throw new Error('Cannot call local functions from remote store');
    const f = this.functions[fId];
    const subs = new Subscription();
    const obs = f(param, this.getValue(arg)[0], subs);
    if (opt.graph) return new Observable<EModelsDefinition<0, [[lfdcp[fId][1][0], lfdcp[fId][1][1]]], [lfkx[fId][2]], [lfkx[fId][3]], [lfdcp[fId][1][2]], RH, ECtx>>(subscriber => {
      obs.then(obs => {
        const { subscription } = this.push(obs);
        subscription.add(subs);
        const serialized = this.serialize(obs.origin, { isNew: true, ignore: opt.ignore });
        subscriber.add(serialized.subscribe(subscriber));
        subscriber.add(subscription);
      })
    });
    return new Observable<GlobalRef<AppX<'V', lfdcp[fId][1][1], lfkx[fId][2], lfkx[fId][3]>>>(subscriber => {
      obs.then(obs => {
        const { subscription, ref } = this.push(obs);
        subscription.add(subs);
        subscriber.next(ref);
        subscriber.add(subscription);
      })
    });
  }

  callReturnRef = new WeakMap<Subscription, PromiseLike<GlobalRef<unknown>>>();

  /* #region remote */
  remote<fId extends rfIds>(
    fId: fId,
    arg: TSerialObs<AppX<'V', rfdcp[fId][0][1], rfkx[fId][0], rfkx[fId][1]>, RH, ECtx> & {
      origin: Origin<rfdcp[fId][0][0], rfdcp[fId][0][1], rfkx[fId][0], rfkx[fId][1], rfdcp[fId][0][2], RH, ECtx>
    },
    param: rfdcp[fId][2],
    { handlers: makeOp, serialized }: CallHandler<RH, ECtx, rfIds, rfdcp, rfkx>,
    opt: { ignore?: string[], graph: true },
  ): Observable<AppX<'V', rfdcp[fId][1][1], rfkx[fId][2], rfkx[fId][3]>>;
  remote<fId extends rfIds>(
    fId: fId,
    arg: TSerialObs<AppX<'V', rfdcp[fId][0][1], rfkx[fId][0], rfkx[fId][1]>, RH, ECtx> & {
      origin: Origin<rfdcp[fId][0][0], rfdcp[fId][0][1], rfkx[fId][0], rfkx[fId][1], rfdcp[fId][0][2], RH, ECtx>
    },
    param: rfdcp[fId][2],
    { handlers: makeOp, serialized }: CallHandler<RH, ECtx, rfIds, rfdcp, rfkx>,
    opt?: { ignore?: string[], graph?: false },
  ): Observable<GlobalRef<AppX<'V', rfdcp[fId][1][1], rfkx[fId][2], rfkx[fId][3]>>>;
  /* #endregion */

  remote<fId extends rfIds>(
    fId: fId,
    arg: TSerialObs<AppX<'V', rfdcp[fId][0][1], rfkx[fId][0], rfkx[fId][1]>, RH, ECtx> & {
      origin: Origin<rfdcp[fId][0][0], rfdcp[fId][0][1], rfkx[fId][0], rfkx[fId][1], rfdcp[fId][0][2], RH, ECtx>
    },
    param: rfdcp[fId][2],
    { handlers: makeOp, serialized }: CallHandler<RH, ECtx, rfIds, rfdcp, rfkx>,
    opt: { ignore?: string[], graph?: boolean } = {},
  ) {
    type V = AppX<'V', rfdcp[fId][0][1], rfkx[fId][0], rfkx[fId][1]>;
    type V2 = AppX<'V', rfdcp[fId][1][1], rfkx[fId][2], rfkx[fId][3]>;
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
        const paramSubs = serializeObs.subscribe(() => { });
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
        callSubscription.add(subs2);
      })
      subscriber.add(callSubscription);
    });
  }
}
