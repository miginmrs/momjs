import { Subscription, Observable } from 'rxjs';
import { Destructable } from './destructable';
import { byKey } from '../utils/guards';
import { map as dep_map } from 'dependent-type';
import { eagerCombineAll, current } from '../utils/rx-utils';
import { defineProperty } from '../utils/global';
import { map, distinctUntilChanged, shareReplay, finalize, scan, filter, tap } from 'rxjs/operators';
import { alternMap } from 'altern-map';
import { asyncMap } from 'rx-async';
const { depMap } = dep_map;
export const runit = (gen, promiseCtr) => {
    const runThen = (...args) => {
        const v = args.length ? gen.next(args[0]) : gen.next();
        if (v.done)
            return promiseCtr.resolve(v.value);
        return promiseCtr.resolve(v.value).then(runThen);
    };
    return runThen();
};
export function* wait(x) {
    return yield x;
}
export function asAsync(f, promiseCtr, thisArg) {
    return (...args) => runit(f.call(thisArg, ...args), promiseCtr);
}
export class BiMap {
    constructor() {
        this.byId = new Map();
        this.byObs = new Map();
        this.oldId = new WeakMap();
    }
    get(id) { return this.byId.get(id); }
    delete(id) {
        const stored = this.byId.get(id);
        if (stored)
            this.byObs.delete(stored[0].origin);
        return this.byId.delete(id);
    }
    set(id, value) {
        this.byObs.set(value[0].origin, id);
        this.oldId.set(value[0].origin, id);
        this.byId.set(id, value);
    }
    ;
    reuseId(obs, id) {
        this.oldId.set(obs, id);
    }
    ;
    find(obs) {
        return this.byObs.get(obs);
    }
    ;
    usedId(obs) {
        return this.oldId.get(obs);
    }
    ;
    get size() { return this.byId.size; }
    keys() { return this.byId.keys(); }
    entries() { return this.byId.entries(); }
    values() { return this.byId.values(); }
}
const one = BigInt(1);
export class Store {
    constructor(handlers, extra, promiseCtr, name, prefix = '') {
        this.handlers = handlers;
        this.extra = extra;
        this.promiseCtr = promiseCtr;
        this.name = name;
        this.prefix = prefix;
        this.map = new BiMap();
        this.next = one;
        this.ref = (obs) => {
            const id = this.map.find(obs);
            return { id };
        };
        this.checkTypes = (v, ...args) => {
            const err = () => new Error('Type Mismatch : ' + v.origin.key + ' not in ' + JSON.stringify(depMap(args[0], (x) => x instanceof Array ? x[0] : x)));
            if (args.length === 1) {
                if (args[0].length && !args[0].some(([key, c]) => v.origin.handler === byKey(this.handlers, key) && v.origin.c === c))
                    throw err();
            }
            else {
                const handlers = this.handlers;
                if (args[0].length && !args[0].some(key => v.origin.handler === byKey(handlers, key)))
                    throw err();
            }
            return v;
        };
        this.getter = (r) => {
            if (!('id' in r))
                throw new Error('There is no local context');
            return this.map.get(r.id)[0];
        };
        this.xderef = (getter) => (ref, ...handlers) => this.checkTypes(getter(ref), handlers);
        this.deref = (getter) => (ref, ...handlers) => this.checkTypes(getter(ref), handlers, 0);
        this.emptyContext = {
            deref: this.deref(this.getter), xderef: this.xderef(this.getter), ref: this.ref, ...this.extra
        };
        this.functions = [];
        this.callReturnRef = new WeakMap();
    }
    getNext(id) {
        if (id === undefined)
            return `${this.prefix}${this.next++}`;
        return id;
    }
    findRef(obs) {
        const id = this.map.find(obs);
        return typeof id === 'string' ? { id } : id;
    }
    ;
    _unserialize(key, ctx, models, cache, i) {
        const handler = byKey(this.handlers, key);
        if (cache[i] !== undefined)
            return cache[i];
        const model = models[i], { id: usedId } = model;
        if (model.data === undefined)
            throw new Error('Trying to access a destructed object');
        const id = this.getNext(usedId);
        const entry = handler.decode(ctx)(id, model.data);
        if (usedId !== undefined) {
            const stored = this.map.get(usedId);
            if (stored !== undefined) {
                const obs = stored[0].origin;
                if (obs.key !== model.type || obs.c !== model.c) {
                    throw new Error('Trying to update a wrong type');
                }
                obs.subject.next(entry);
                const res = { id: usedId, obs, subs: stored[1].subscription };
                return res;
            }
        }
        const obs = this._insert(key, entry, ctx, id, model.c);
        cache[i] = { obs, id };
        return cache[i];
    }
    _insert(key, entry, ctx, id, c) {
        const handler = byKey(this.handlers, key);
        const compare = handler.compare?.(ctx);
        const obs = new Destructable(this.handlers, key, c, entry, compare, handler.destroy?.(ctx)(entry.data), () => this.map.delete(id));
        this.map.set(id, [obs, {}]);
        return obs;
    }
    unserialize(getModels) {
        const session = [];
        const models = getModels instanceof Function ? getModels((i) => ({ $: i })) : getModels;
        const _push = (i) => {
            const modelsAsObject = models;
            const m = modelsAsObject[i];
            const _models = Object.assign(models, { [i]: m });
            return { ...this._unserialize(m.type, ctx, _models, session, i), m };
        };
        const getter = (r) => ('id' in r ? this.map.get(r.id)[0] : _push(r.$).obs);
        const ref = this.ref;
        const deref = this.deref(getter);
        const xderef = this.xderef(getter);
        const ctx = { deref, ref, xderef, ...this.extra };
        const subscriptions = [];
        const temp = [];
        try {
            const references = depMap(models, ({ i }, index) => {
                i = index;
                const { obs, id, subs, m } = _push(i);
                const isNew = m.new !== false;
                if (isNew && subs !== undefined)
                    throw new Error('Trying to subscribe to an already subscribed entity');
                if (isNew)
                    subscriptions.push(this.map.get(id)[1].subscription = obs.subscribe(() => { }));
                else if (!obs.subject.isStopped)
                    temp.push(obs.subscribe(() => { }));
                const ref = { id };
                return ref;
            });
            temp.forEach(subs => subs.unsubscribe());
            return references;
        }
        catch (e) {
            temp.concat(subscriptions).forEach(subs => subs.unsubscribe());
            throw e;
        }
    }
    append(key, entry, c) {
        const id = this.getNext();
        const obs = this._insert(key, entry, this.emptyContext, id, c);
        const subs = this.map.get(id)[1].subscription = obs.subscribe(() => { });
        return { id, obs, subs };
    }
    push(obs, { ids, unload } = {}) {
        const oldId = this.map.find(obs.origin);
        const id = this.getNext(oldId ?? ids?.get(obs.origin) ?? this.map.usedId(obs.origin));
        let wrapped = obs;
        let subscription;
        if (oldId === undefined) {
            let destroyed = false;
            const temp = [];
            const clear = () => {
                temp.forEach(s => s.unsubscribe());
                temp.length = 0;
            };
            wrapped = defineProperty(Object.assign(eagerCombineAll([obs, obs.origin.subject.pipe(alternMap(({ args, n }) => {
                    const wrap = (obs) => {
                        const res = this.push(obs, { ids });
                        temp.push(res.subscription);
                        return res.wrapped;
                    };
                    const array = n === 2
                        ? args.map(arg => eagerCombineAll(arg.map(wrap)))
                        : args.map(wrap);
                    const ret = eagerCombineAll(array);
                    return ret;
                }, { completeWithInner: true }), tap(clear), distinctUntilChanged((x, y) => x.length === y.length && x.every((v, i) => {
                    const w = y[i];
                    if (v instanceof Array && w instanceof Array) {
                        return v.length === w.length && v.every((u, i) => u === w[i]);
                    }
                    return v === w;
                })))]).pipe(finalize(() => { unload?.({ id }); clear(); this.map.delete(id); destroyed = true; }), map(([v]) => v), shareReplay({ bufferSize: 1, refCount: true })), { origin: obs.origin, parent: obs }), 'destroyed', { get() { return destroyed; } });
            this.map.set(id, [wrapped, {}]);
            subscription = wrapped.subscribe();
        }
        else {
            wrapped = this.map.get(id)[0];
            subscription = wrapped.subscribe();
        }
        return { ref: { id }, wrapped, subscription };
    }
    serialize(obs, opt) {
        const { isNew, push = true } = opt;
        return obs.pipe(scan((previous) => {
            const session = new BiMap;
            const allData = new Map();
            const subs = new Subscription;
            let next = 1;
            const getter = (r) => ('id' in r ? this.map.get(r.id) : session.get(r.$))[0];
            const inMap = (arg) => this.map.find(arg) !== undefined;
            const ref = (iObs) => {
                const entry = iObs.subject.value;
                const value = current(iObs);
                const id = this.map.find(iObs);
                let oldData = undefined, data;
                if (id !== undefined && previous) {
                    const [, old] = previous;
                    oldData = old.get(iObs);
                }
                const old = oldData ? { old: oldData.data } : {};
                const encode = () => iObs.handler.encode(ctx)({ ...entry, c: iObs.c, ...old });
                if (oldData) {
                    data = { data: encode() };
                    if (data.data === undefined && id !== undefined) {
                        allData.set(iObs, oldData);
                        return { id };
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
                        }
                        else {
                            usedId = this.map.usedId(iObs);
                        }
                    }
                    const attr = { type: iObs.key, value, ...data, c: iObs.c, id: usedId };
                    attr.new = $ === 0 && previous === null && (isNew || !inMap(iObs));
                    session.set($, [iObs, attr]);
                }
                return { $ };
            };
            const ctx = {
                deref: this.deref(getter), xderef: this.xderef(getter), ref, ...this.extra
            };
            const ret = [session, allData, ref(obs), subs];
            previous?.[3].unsubscribe();
            return ret;
        }, null), map(function ([session, , ref, subs]) {
            this.add(subs);
            const entries = Array(session.size).fill(0).map((_, i) => session.get(i));
            if (entries.length === 0) {
                if ('$' in ref)
                    throw new Error('Unexpected');
                return null;
            }
            return entries.map(([, definition], i) => {
                const def = { i, ...definition };
                delete def.value;
                return def;
            });
        }), filter((x) => x !== null));
    }
    get(id) {
        return this.map.get(id);
    }
    getValue({ id }) {
        const obs = this.get(id);
        if (obs === undefined)
            throw new Error('Access to destroyed object');
        return obs;
    }
    local(fId, param, arg) {
        const obs = this.functions[fId](param, this.getValue(arg)[0]);
        const { subscription } = this.push(obs);
        const serialized = this.serialize(obs, { isNew: true });
        return new Observable(subscriber => {
            subscriber.add(subscription);
            subscriber.add(serialized.subscribe(subscriber));
        });
    }
    remote() {
        return (fId, arg, param, { handlers: makeOp, serialized }) => new Observable(subscriber => {
            const op = makeOp();
            const { subscription: argSubscription, ref: refArg } = this.push(arg, {
                unload: (ref) => op.call_unsubscribe(ref),
            });
            const callSubscription = new Subscription();
            let serializeObs = serialized.get(arg);
            if (!serializeObs)
                serialized.set(arg, serializeObs = this.serialize(arg, {
                    isNew: true
                }).pipe(asyncMap((def) => {
                    const refsPromise = op.put(def);
                    return refsPromise.then((refs) => ({ ok: true, value: refs[0] }));
                }), tap({
                    error: e => op.error(refArg, e),
                    complete: () => op.complete(refArg),
                }), shareReplay({ refCount: true, bufferSize: 1 })));
            const paramSubs = serializeObs.subscribe();
            const makePromise = (res) => [new this.promiseCtr(r => res = r), res];
            const refTask = makePromise();
            this.callReturnRef.set(subscriber, refTask[0]);
            callSubscription.add(() => {
                if (paramSubs.closed)
                    return;
                paramSubs.unsubscribe();
            });
            if (paramSubs.closed) {
                callSubscription.unsubscribe();
                return;
            }
            callSubscription.add(() => argSubscription.unsubscribe());
            const responseSubs = op.subscribeToResult({
                resp_call: (data) => {
                    const ref = this.unserialize(data)[0];
                    responseSubs.add(this.get(ref.id)?.[1].subscription);
                    refTask[1](ref);
                },
                err_call: (err) => refTask[0].then(ref => {
                    const obs = this.getValue(ref)[0];
                    obs.subject.error(err);
                }),
                comp_call: () => refTask[0].then(ref => {
                    const obs = this.getValue(ref)[0];
                    obs.subject.complete();
                })
            });
            callSubscription.add(() => {
                if (!responseSubs.closed)
                    op.end_call();
            });
            callSubscription.add(responseSubs);
            responseSubs.add(callSubscription);
            op.call(fId, param, refArg);
            refTask[0].then(refReturn => {
                const subs2 = this.getValue(refReturn)[0].subscribe(subscriber);
                callSubscription.add(() => subs2.unsubscribe());
            });
            subscriber.add(callSubscription);
        });
    }
}
//# sourceMappingURL=store.js.map