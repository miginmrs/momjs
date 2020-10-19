import { Subscription, Observable, Subject } from 'rxjs';
import { Destructable } from './destructable';
import { byKey } from '../utils/guards';
import { map as dep_map } from 'dependent-type';
import { eagerCombineAll, current } from '../utils/rx-utils';
import { defineProperty } from '../utils/global';
import { map, shareReplay, finalize, scan, filter, tap, mapTo } from 'rxjs/operators';
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
        if (this.byObs.has(value[0].origin))
            throw new Error('Object already in store');
        if (this.byId.has(id))
            throw new Error('Id already used');
        this.byObs.set(value[0].origin, id);
        this.oldId.set(value[0].origin, id);
        this.byId.set(id, value);
    }
    ;
    reuseId(obs, id) {
        this.oldId.set(obs.origin, id);
    }
    ;
    finddir(obs) {
        const origin = obs.origin, id = this.byObs.get(origin);
        if (id === undefined)
            return undefined;
        const found = this.byId.get(id)[0];
        let upfound = found, upobs = obs;
        if (found === obs)
            return [id, 'exact'];
        const foundParents = new Set([upfound]), obsParents = new Set([upobs]);
        const err = new Error('Another observable with the same origin is in the store');
        while (true) {
            const done = !obsParents.add(upobs = upobs.parent) && !foundParents.add(upfound = upfound.parent);
            if (obsParents.has(upfound)) {
                if (upfound === obs)
                    return [id, 'down'];
                throw err;
            }
            if (foundParents.has(upobs)) {
                if (upobs === found)
                    return [id, 'up'];
                throw err;
            }
            if (done)
                throw err;
            upobs = upobs.parent;
            upfound = upfound.parent;
        }
    }
    find(obs, any = false) {
        return any ? this.byObs.get(obs.origin) : this.finddir(obs)?.[0];
    }
    ;
    usedId(obs) {
        return this.oldId.get(obs.origin);
    }
    ;
    get size() { return this.byId.size; }
    keys() { return this.byId.keys(); }
    entries() { return this.byId.entries(); }
    values() { return this.byId.values(); }
}
const one = BigInt(1);
export class Store {
    constructor(handlers, extra, promiseCtr, functions = null, name, prefix = '', locals = [], base = false) {
        this.handlers = handlers;
        this.extra = extra;
        this.promiseCtr = promiseCtr;
        this.functions = functions;
        this.name = name;
        this.prefix = prefix;
        this.base = base;
        this.next = one;
        this.pushed = new Map();
        this.pushes = new Subject();
        this.changes = new Observable(subscriber => {
            const map = new Map();
            const ctx = this.emptyContext;
            const watch = (obs, id) => {
                const origin = obs.origin, encoder = origin.handler.encode(ctx);
                return origin.subject.pipe(scan((prev, v) => {
                    const c = origin.c;
                    const params = { ...v, ...('old' in prev ? { old: prev.old } : {}), c };
                    return { old: encoder(params), params };
                }, {}), filter(({ old: v }) => v !== undefined)).subscribe(({ old: data, params }) => {
                    subscriber.next(['next', [{
                                c: origin.c, i: 0, data, id, new: !('old' in (params ?? {})), type: origin.key
                            }]]);
                }, err => subscriber.next(['error', { id }, err]), () => subscriber.next(['complete', { id }]));
            };
            for (const [obs, id] of this.pushed)
                map.set(obs, watch(obs, id));
            subscriber.add(this.pushes.subscribe(([obs, id, add]) => {
                if (add)
                    map.set(obs, watch(obs, id));
                else {
                    // console.log('remove', this.map.find(obs));
                    const isStopped = (obs) => {
                        const subject = obs.origin.subject;
                        if (subject.isStopped)
                            return true;
                        return subject.value.args.some(args => args instanceof Array ? args.some(isStopped) : isStopped(args));
                    };
                    if (!isStopped(obs))
                        subscriber.next(['unsubscribe', { id }]);
                    map.get(obs).unsubscribe();
                    map.delete(obs);
                }
                ;
            }));
        });
        this.ref = (obs) => {
            const id = this.map.find(obs);
            return { id };
        };
        this.checkTypes = (v, ...args) => {
            const origin = v.origin;
            const err = () => new Error('Type Mismatch : ' + origin.key + ' not in ' + JSON.stringify(depMap(args[0], (x) => x instanceof Array ? x[0] : x)));
            if (args.length === 1) {
                if (args[0].length && !args[0].some(([key, c]) => origin.handler === byKey(this.handlers, key) && origin.c === c))
                    throw err();
            }
            else {
                const handlers = this.handlers;
                if (args[0].length && !args[0].some(key => origin.handler === byKey(handlers, key)))
                    throw err();
            }
            return v;
        };
        this.getter = (r) => {
            if (!('id' in r))
                throw new Error('There is no local context');
            return this.getValue(r)[0];
        };
        this.xderef = (getter) => (ref, ...handlers) => this.checkTypes(getter(ref), handlers);
        this.deref = (getter) => (ref, ...handlers) => this.checkTypes(getter(ref), handlers, 0);
        this.emptyContext = {
            deref: this.deref(this.getter), xderef: this.xderef(this.getter), ref: this.ref, ...this.extra
        };
        this.callReturnRef = new WeakMap();
        this.functions = functions;
        this.map = new BiMap();
        this.locals = new BiMap();
        for (const [obs, { id, in: isIn, out: isOut }] of locals)
            this.locals.set(id, [obs, { in: isIn, out: isOut }]);
    }
    subscribeToLocals() {
        const subs = new Subscription();
        const local = this.base ? [true] : undefined;
        for (const [, [obs]] of this.locals.entries()) {
            subs.add(this.push(obs, { local }).subscription);
        }
        if (local)
            local[0] = false;
        return subs;
    }
    getNext(id) {
        if (id === undefined)
            return `${this.prefix}${this.next++}`;
        return id;
    }
    watch(callHandler) {
        const op = callHandler.handlers();
        return this.changes.subscribe(event => {
            switch (event[0]) {
                case 'next': return op.put(event[1]);
                case 'error': return op.error(event[1], event[2]);
                case 'complete': return op.complete(event[1]);
                case 'unsubscribe': return op.unsubscribe(event[1]);
            }
        });
    }
    /** inserts a new destructable or updates a stored ObsWithOrigin using serialized data */
    _unserialize(key, ctx, models, cache, i) {
        const handler = byKey(this.handlers, key);
        if (cache[i] !== undefined)
            return cache[i];
        const model = models[i], { id: usedId } = model;
        if (model.data === undefined)
            throw new Error('Trying to access a destructed object');
        const id = this.getNext(usedId);
        const local = this.locals.get(id)?.[1];
        if (local && !local.in) {
            throw new Error('Unexpected serialized observable');
        }
        const entry = handler.decode(ctx)(id, model.data, this.get(id)?.[0] ?? null);
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
    /** inserts a new destructable into the store with a givin id */
    _insert(key, entry, ctx, id, c) {
        const handler = byKey(this.handlers, key);
        const compare = handler.compare?.(ctx);
        const obs = new Destructable(this.handlers, key, c, entry, compare, handler.destroy?.(ctx)(entry.data), () => this.map.delete(id));
        this.map.set(id, [obs, {}]);
        return obs;
    }
    /** inserts or updates multiple entries from serialized data with stored subscription to new ones */
    unserialize(getModels) {
        const session = [];
        const models = getModels instanceof Function ? getModels((i) => ({ $: i })) : getModels;
        const _push = (i) => {
            const modelsAsObject = models;
            const m = modelsAsObject[i];
            const _models = Object.assign(models, { [i]: m });
            return { ...this._unserialize(m.type, ctx, _models, session, i), m };
        };
        const getter = (r) => ('id' in r ? this.getValue(r)[0] : _push(r.$).obs);
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
    /** it does nothing useful, there is no use case for this function and no reason for it to stay here */
    append(key, entry, c) {
        const id = this.getNext();
        const obs = this._insert(key, entry, this.emptyContext, id, c);
        const subs = this.map.get(id)[1].subscription = obs.subscribe(() => { });
        return { id, obs, subs };
    }
    /** adds an ObsWithOrigin to store and subscribe to it without storing subscription  */
    push(obs, { unload, nextId, local: $local } = {}) {
        const old = this.map.finddir(obs);
        const id = this.getNext(old?.[0] ?? this.locals.find(obs, true) ?? this.map.usedId(obs.origin) ?? nextId?.(obs));
        let result = obs;
        let subscription;
        if (old === undefined) {
            let destroyed = false;
            const temp = [];
            const clear = function () {
                temp.forEach(this.add.bind(this));
                temp.length = 0;
            };
            const wrapped = defineProperty(Object.assign(eagerCombineAll([
                obs,
                obs.origin.subject.pipe(alternMap(({ args, n }) => {
                    const wrap = (obs) => {
                        const res = this.push(obs, { local: $local?.[0] ? $local : undefined, nextId: (nextId && ((obs, pId) => nextId(obs, pId ?? id))) });
                        temp.push(res.subscription);
                        return res.wrapped;
                    };
                    const array = n === 2
                        ? args.map(arg => eagerCombineAll(arg.map(wrap)))
                        : args.map(wrap);
                    const ret = eagerCombineAll(array);
                    return ret;
                }, { completeWithInner: true }), tap(clear))
            ]).pipe(finalize(() => {
                unload?.({ id });
                const local = this.locals.get(id)?.[1];
                if (!local || local.out) {
                    this.pushed.delete(obs);
                    this.pushes.next([obs, id, false]);
                }
                clear.call(Subscription.EMPTY);
                this.map.delete(id);
                destroyed = true;
            }), map(([v]) => v), shareReplay({ bufferSize: 1, refCount: true })), { origin: obs.origin, parent: obs }), 'destroyed', { get() { return destroyed; } });
            const islocal = $local ? $local[0] : false;
            if (!islocal)
                result = wrapped;
            this.map.set(id, [result, {}]);
            subscription = wrapped.subscribe();
            const local = this.locals.get(id)?.[1];
            if (!local || local.out) {
                this.pushed.set(obs, id);
                this.pushes.next([obs, id, true]);
            }
        }
        else {
            if (old[1] === 'down')
                result = this.map.get(id)[0];
            subscription = result.subscribe();
        }
        return { ref: { id }, wrapped: result, subscription };
    }
    /**
     * serialize any destructable object regardless wether its in the store
     * @param {Destructable} obs the observable to serialize
     * @param {SerializationOptions} opt options of serialization
     */
    serialize(obs, opt) {
        const { isNew, push = true, ignore = [] } = opt;
        return obs.pipe(scan((previous) => {
            const session = new BiMap;
            const allData = new Map();
            const subs = new Subscription;
            let next = 1;
            const getter = (r) => ('id' in r ? this.map.get(r.id) : session.get(r.$))[0];
            const inMap = (arg) => this.map.find(arg) !== undefined;
            const ref = (iObs) => {
                const origin = iObs.origin, entry = iObs.origin.subject.value;
                const value = current(iObs);
                const id = this.map.find(iObs);
                if (id !== undefined && ignore.indexOf(id) !== -1)
                    return { id };
                let oldData = undefined, data;
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
                    const attr = { type: origin.key, value, ...data, c: origin.c, id: usedId };
                    attr.new = $ === 0 && previous === null && (isNew || !inMap(iObs));
                    const stored = session.get($);
                    if (stored)
                        stored[1] = attr;
                    else
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
    /* #endregion */
    local(fId, param, arg, opt = {}) {
        if (this.functions === null)
            throw new Error('Cannot call local functions from remote store');
        const f = this.functions[fId];
        const obs = f(param, this.getValue(arg)[0]);
        if (opt.graph)
            return new Observable(subscriber => {
                obs.then(obs => {
                    const { subscription } = this.push(obs);
                    const serialized = this.serialize(obs.origin, { isNew: true, ignore: opt.ignore });
                    subscriber.add(serialized.subscribe(subscriber));
                    subscriber.add(subscription);
                });
            });
        return new Observable(subscriber => {
            obs.then(obs => {
                const { subscription, ref } = this.push(obs);
                subscriber.next(ref);
                subscriber.add(subscription);
            });
        });
    }
    /* #endregion */
    remote(fId, arg, param, { handlers: makeOp, serialized }, opt = {}) {
        return new Observable(subscriber => {
            const op = makeOp();
            const { subscription: argSubscription, ref: refArg } = this.push(arg, opt.graph ? {
                unload: (ref) => op.unsubscribe(ref),
            } : {});
            const callSubscription = new Subscription();
            const makePromise = (res) => [new this.promiseCtr(r => res = r), res];
            const refTask = makePromise();
            if (opt.graph) {
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
            }
            callSubscription.add(argSubscription);
            const responseSubs = op.subscribeToResult({
                resp_id: (ref) => {
                    responseSubs.add(this.getValue(ref)[0].pipe(filter((_, index) => index === 0), mapTo(ref)).subscribe(subscriber));
                    refTask[1](ref);
                },
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
            op.call(fId, param, refArg, opt);
            if (opt.graph)
                refTask[0].then(refReturn => {
                    const subs2 = this.getValue(refReturn)[0].subscribe(subscriber);
                    callSubscription.add(() => subs2.unsubscribe());
                });
            subscriber.add(callSubscription);
        });
    }
}
//# sourceMappingURL=store.js.map