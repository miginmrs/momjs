"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = exports.BiMap = exports.asAsync = exports.wait = exports.runit = void 0;
const rxjs_1 = require("rxjs");
const destructable_1 = require("./destructable");
const guards_1 = require("../utils/guards");
const dependent_type_1 = require("dependent-type");
const rx_utils_1 = require("../utils/rx-utils");
const global_1 = require("../utils/global");
const operators_1 = require("rxjs/operators");
const altern_map_1 = require("altern-map");
const rx_async_1 = require("rx-async");
const { depMap } = dependent_type_1.map;
exports.runit = (gen, promiseCtr) => {
    const runThen = (...args) => {
        const v = args.length ? gen.next(args[0]) : gen.next();
        if (v.done)
            return promiseCtr.resolve(v.value);
        return promiseCtr.resolve(v.value).then(runThen);
    };
    return runThen();
};
function* wait(x) {
    return yield x;
}
exports.wait = wait;
function asAsync(f, promiseCtr, thisArg) {
    return (...args) => exports.runit(f.call(thisArg, ...args), promiseCtr);
}
exports.asAsync = asAsync;
class BiMap {
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
exports.BiMap = BiMap;
const one = BigInt(1);
class Store {
    constructor(handlers, extra, promiseCtr, functions = null, name, prefix = '', locals = new Map()) {
        this.handlers = handlers;
        this.extra = extra;
        this.promiseCtr = promiseCtr;
        this.functions = functions;
        this.name = name;
        this.prefix = prefix;
        this.locals = locals;
        this.map = new BiMap();
        this.next = one;
        this.pushed = new Set();
        this.pushes = new rxjs_1.Subject();
        this.changes = new rxjs_1.Observable(subscriber => {
            const map = new Map();
            const ctx = this.emptyContext;
            const watch = (obs) => {
                const encoder = obs.handler.encode(ctx);
                return obs.subject.pipe(operators_1.scan((prev, v) => {
                    const params = { ...v, ...('old' in prev ? { old: prev.old } : {}), c: obs.c };
                    return { old: encoder(params), params };
                }, {}), operators_1.filter(({ old: v }, i) => v !== undefined)).subscribe(({ old: data, params }) => {
                    subscriber.next(['next', [{
                                c: obs.c, i: 0, data, id: this.map.find(obs), new: !('old' in (params ?? {})), type: obs.key
                            }]]);
                }, err => subscriber.next(['error', { id: this.map.find(obs) }, err]), () => subscriber.next(['complete', { id: this.map.find(obs) }]));
            };
            for (const obs of this.pushed)
                map.set(obs, watch(obs));
            subscriber.add(this.pushes.subscribe(([obs, add]) => {
                if (add)
                    map.set(obs, watch(obs));
                else {
                    // console.log('remove', this.map.find(obs));
                    const isStopped = (obs) => obs.subject.isStopped || obs.subject.value.args.some(args => args instanceof Array ? args.some(isStopped) : isStopped(args));
                    if (!isStopped(obs))
                        subscriber.next(['unsubscribe', { id: this.map.find(obs) }]);
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
            const err = () => new Error('Type Mismatch : ' + v.key + ' not in ' + JSON.stringify(depMap(args[0], (x) => x instanceof Array ? x[0] : x)));
            if (args.length === 1) {
                if (args[0].length && !args[0].some(([key, c]) => v.handler === guards_1.byKey(this.handlers, key) && v.c === c))
                    throw err();
            }
            else {
                const handlers = this.handlers;
                if (args[0].length && !args[0].some(key => v.handler === guards_1.byKey(handlers, key)))
                    throw err();
            }
            return v;
        };
        this.getter = (r) => {
            if (!('id' in r))
                throw new Error('There is no local context');
            return this.map.get(r.id)[0];
        };
        this.xderef = (getter) => (ref, ...handlers) => this.checkTypes(getter(ref).origin, handlers);
        this.deref = (getter) => (ref, ...handlers) => this.checkTypes(getter(ref).origin, handlers, 0);
        this.emptyContext = {
            deref: this.deref(this.getter), xderef: this.xderef(this.getter), ref: this.ref, ...this.extra
        };
        this.callReturnRef = new WeakMap();
        this.functions = functions;
    }
    subscribeToLocals() {
        const subs = new rxjs_1.Subscription();
        this.locals.forEach((_, obs) => subs.add(this.push(obs).subscription));
        return subs;
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
        const handler = guards_1.byKey(this.handlers, key);
        if (cache[i] !== undefined)
            return cache[i];
        const model = models[i], { id: usedId } = model;
        if (model.data === undefined)
            throw new Error('Trying to access a destructed object');
        const id = this.getNext(usedId);
        const local = this.locals.get(this.map.get(id)?.[0].origin);
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
        const handler = guards_1.byKey(this.handlers, key);
        const compare = handler.compare?.(ctx);
        const obs = new destructable_1.Destructable(this.handlers, key, c, entry, compare, handler.destroy?.(ctx)(entry.data), () => this.map.delete(id));
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
    /** it does nothing useful, there is no use case for this function and no reason for it to stay here */
    append(key, entry, c) {
        const id = this.getNext();
        const obs = this._insert(key, entry, this.emptyContext, id, c);
        const subs = this.map.get(id)[1].subscription = obs.subscribe(() => { });
        return { id, obs, subs };
    }
    /** adds an ObsWithOrigin to store and subscribe to it without storing subscription  */
    push(obs, { unload, nextId } = {}) {
        const oldId = this.map.find(obs.origin);
        const id = this.getNext(oldId ?? this.locals?.get(obs.origin)?.id ?? this.map.usedId(obs.origin) ?? nextId?.(obs));
        let wrapped = obs;
        let subscription;
        if (oldId === undefined) {
            let destroyed = false;
            const temp = [];
            const clear = () => {
                temp.forEach(s => s.unsubscribe());
                temp.length = 0;
            };
            wrapped = global_1.defineProperty(Object.assign(rx_utils_1.eagerCombineAll([
                obs,
                obs.origin.subject.pipe(altern_map_1.alternMap(({ args, n }) => {
                    const wrap = (obs) => {
                        const res = this.push(obs, { nextId: (nextId && ((obs, pId) => nextId(obs, pId ?? id))) });
                        temp.push(res.subscription);
                        return res.wrapped;
                    };
                    const array = n === 2
                        ? args.map(arg => rx_utils_1.eagerCombineAll(arg.map(wrap)))
                        : args.map(wrap);
                    const ret = rx_utils_1.eagerCombineAll(array);
                    return ret;
                }, { completeWithInner: true }), operators_1.tap(clear))
            ]).pipe(operators_1.finalize(() => {
                unload?.({ id });
                const local = this.locals.get(obs.origin);
                if (!local || local.out) {
                    this.pushed.delete(obs.origin);
                    this.pushes.next([obs.origin, false]);
                }
                clear();
                this.map.delete(id);
                destroyed = true;
            }), operators_1.map(([v]) => v), operators_1.shareReplay({ bufferSize: 1, refCount: true })), { origin: obs.origin, parent: obs }), 'destroyed', { get() { return destroyed; } });
            this.map.set(id, [wrapped, {}]);
            subscription = wrapped.subscribe();
            const local = this.locals.get(obs.origin);
            if (!local || local.out) {
                this.pushed.add(obs.origin);
                this.pushes.next([obs.origin, true]);
            }
        }
        else {
            wrapped = this.map.get(id)[0];
            subscription = wrapped.subscribe();
        }
        return { ref: { id }, wrapped, subscription };
    }
    /**
     * serialize any destructable object regardless wether its in the store
     * @param {Destructable} obs the observable to serialize
     * @param {SerializationOptions} opt options of serialization
     */
    serialize(obs, opt) {
        const { isNew, push = true, ignore = [] } = opt;
        return obs.pipe(operators_1.scan((previous) => {
            const session = new BiMap;
            const allData = new Map();
            const subs = new rxjs_1.Subscription;
            let next = 1;
            const getter = (r) => ('id' in r ? this.map.get(r.id) : session.get(r.$))[0];
            const inMap = (arg) => this.map.find(arg) !== undefined;
            const ref = (iObs) => {
                const entry = iObs.subject.value;
                const value = rx_utils_1.current(iObs);
                const id = this.map.find(iObs);
                if (id !== undefined && ignore.indexOf(id) !== -1)
                    return { id };
                let oldData = undefined, data;
                if (id !== undefined && previous) {
                    const [, old] = previous;
                    oldData = old.get(iObs);
                }
                const old = oldData ? { old: oldData.data } : {};
                const encode = () => iObs.handler.encode(ctx)({ ...entry, c: iObs.c, ...old });
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
        }, null), operators_1.map(function ([session, , ref, subs]) {
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
        }), operators_1.filter((x) => x !== null));
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
            return new rxjs_1.Observable(subscriber => {
                obs.then(obs => {
                    const { subscription } = this.push(obs);
                    const serialized = this.serialize(obs.origin, { isNew: true, ignore: opt.ignore });
                    subscriber.add(serialized.subscribe(subscriber));
                    subscriber.add(subscription);
                });
            });
        return new rxjs_1.Observable(subscriber => {
            obs.then(obs => {
                const { subscription, ref } = this.push(obs);
                subscriber.next(ref);
                subscriber.add(subscription);
            });
        });
    }
    /* #endregion */
    remote(fId, arg, param, { handlers: makeOp, serialized }, opt = {}) {
        return new rxjs_1.Observable(subscriber => {
            const op = makeOp();
            const { subscription: argSubscription, ref: refArg } = this.push(arg, opt.graph ? {
                unload: (ref) => op.unsubscribe(ref),
            } : {});
            const callSubscription = new rxjs_1.Subscription();
            const makePromise = (res) => [new this.promiseCtr(r => res = r), res];
            const refTask = makePromise();
            if (opt.graph) {
                let serializeObs = serialized.get(arg.origin);
                if (!serializeObs)
                    serialized.set(arg.origin, serializeObs = this.serialize(arg.origin, {
                        isNew: true
                    }).pipe(rx_async_1.asyncMap((def) => {
                        const refsPromise = op.put(def);
                        return refsPromise.then((refs) => ({ ok: true, value: refs[0] }));
                    }), operators_1.tap({
                        error: e => op.error(refArg, e),
                        complete: () => op.complete(refArg),
                    }), operators_1.shareReplay({ refCount: true, bufferSize: 1 })));
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
                    responseSubs.add(this.getValue(ref)[0].pipe(operators_1.filter((_, index) => index === 0), operators_1.mapTo(ref)).subscribe(subscriber));
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
exports.Store = Store;
//# sourceMappingURL=store.js.map