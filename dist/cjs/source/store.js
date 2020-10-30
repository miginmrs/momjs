"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
const rxjs_1 = require("rxjs");
const dependent_type_1 = require("dependent-type");
const origin_1 = require("./origin");
const rx_utils_1 = require("../utils/rx-utils");
const global_1 = require("../utils/global");
const operators_1 = require("rxjs/operators");
const altern_map_1 = require("altern-map");
const rx_async_1 = require("rx-async");
const bimap_1 = require("./bimap");
const constants_1 = require("./constants");
const { depMap } = dependent_type_1.map;
const one = BigInt(1);
class Store {
    constructor({ getHandler, callHandler, extra, functions, promiseCtr = Promise, name, prefix = '', locals = [], base = false, observe, notifier }) {
        this.storeSubs = new rxjs_1.Subscription;
        this.linkSubs = new rxjs_1.Subscription;
        this.next = one;
        this.pushed = new Map();
        this._pushes = new rxjs_1.Subject();
        this.pushes = this._pushes.asObservable();
        this.changes = new rxjs_1.Observable(subscriber => {
            const map = new Map();
            for (const [obs, id] of this.pushed)
                map.set(obs, this.linkTo(obs, id, subscriber));
            subscriber.add(this.pushes.subscribe(([obs, id, add]) => {
                if (add)
                    map.set(obs, this.linkTo(obs, id, subscriber));
                else {
                    // console.log('remove', this.map.find(obs));
                    const isStopped = (obs) => {
                        const set = new Set([obs]);
                        while (!set.has(obs = obs.parent))
                            set.add(obs);
                        if (!set.has(obs.origin))
                            return false;
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
        this.addToObjects = (obs) => {
            return (v) => v !== null && typeof v === 'object' && this.objects.set(v, obs);
        };
        this.ref = (obs) => {
            const id = this.map.find(obs);
            return { id };
        };
        this.checkTypes = (v, ...args) => {
            const origin = v.origin, getHandler = this.getHandler;
            const err = () => new Error('Type Mismatch : ' + origin.key + ' not in ' + JSON.stringify(depMap(args[0], (x) => x instanceof Array ? x[0] : x)));
            if (args.length === 1) {
                if (args[0].length && !args[0].some(([key, c]) => origin.handler === getHandler(key) && origin.c === c))
                    throw err();
            }
            else {
                if (args[0].length && !args[0].some(key => origin.handler === getHandler(key)))
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
        this.callReturnRef = new WeakMap();
        this.getHandler = getHandler;
        this.callHandler = callHandler;
        this.functions = functions;
        const map = this.map = new bimap_1.BiMap(true);
        this.empty = map.empty;
        this.extra = extra;
        this.name = name;
        this.base = base;
        this.observe = observe;
        this.prefix = prefix;
        this.notifier = notifier ?? (() => map.empty.pipe(operators_1.take(1)));
        this.promiseCtr = promiseCtr;
        this.locals = new bimap_1.BiMap();
        this._emptyctx = { deref: this.deref(this.getter), xderef: this.xderef(this.getter), ref: this.ref, ...this.extra };
        for (const [obs, { id, ...opt }] of locals)
            this.locals.set(id, [obs, opt]);
        this.objects = new WeakMap;
    }
    setup({ local, listener }) {
        this.linkSubs.add(this.watch(this.callHandler));
        this.storeSubs.add(this.subscribeToLocals(local));
        this.linkSubs.add(listener(this));
    }
    add(subs) { return this.storeSubs.add(subs); }
    shutdown(callback) {
        this.storeSubs.unsubscribe();
        const subs = this.linkSubs;
        subs.add(this.notifier().subscribe(() => callback(subs.unsubscribe.bind(subs))));
    }
    remoteShutdown(notifier) {
        this.storeSubs.unsubscribe();
        const subs = this.linkSubs;
        this.callHandler.watch().shutdown(operators_1.switchMapTo(this.notifier()), notifier(subs.unsubscribe.bind(subs)));
    }
    linkTo(obs, id, subscriber) {
        const origin = obs.origin, encoder = origin.handler.encode(this._emptyctx);
        return origin.subject.pipe(operators_1.scan((prev, v) => {
            const c = origin.c;
            const params = { ...v, ...('old' in prev ? { old: prev.old } : {}), c };
            return { old: encoder(params), params };
        }, {}), operators_1.filter(({ old: v }) => v !== undefined)).subscribe(({ old: data, params }) => {
            subscriber.next(['next', [{
                        c: origin.c, i: 0, data, id, new: !('old' in (params ?? {})), type: origin.key
                    }]]);
        }, err => subscriber.next(['error', { id }, err]), () => subscriber.next(['complete', { id }]));
    }
    subscribeToLocals($local) {
        const subs = new rxjs_1.Subscription();
        const local = $local ?? (this.base ? subs : undefined);
        for (const [, [obs, { local: $local }]] of this.locals.entries()) {
            subs.add(this.push(obs, { local: $local ?? local }).subscription);
        }
        return subs;
    }
    getNext(id) {
        if (id === undefined)
            return `${this.prefix}${this.next++}`;
        return id;
    }
    watch(callHandler) {
        const op = callHandler.watch();
        return this.changes.subscribe(event => {
            switch (event[0]) {
                case 'next': return op.put(event[1]);
                case 'error': return op.error(event[1], event[2]);
                case 'complete': return op.complete(event[1]);
                case 'unsubscribe': return op.unsubscribe(event[1]);
            }
        });
    }
    /** inserts a new serial observable or updates a stored ObsWithOrigin using serialized data */
    _unserialize(key, ctx, models, cache, i) {
        const handler = this.getHandler(key);
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
    /** inserts a new serial observable into the store with a givin id */
    _insert(key, entry, ctx, id, c) {
        const getHandler = this.getHandler, handler = getHandler(key);
        const compare = handler.compare?.(ctx), observe = this.observe;
        const obs = new origin_1.Origin(getHandler, key, c, entry, {
            compare, observer: observe && !handler[constants_1.transient] ? obs => ({ next: observe(obs) }) : undefined
        }, () => this.map.delete(id));
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
                if (isNew) {
                    const attr = this.map.get(id)[1];
                    subscriptions.push(attr.subscription = obs.subscribe(() => { }));
                    attr.subscription.add(() => attr.subscription = undefined);
                }
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
    /** adds an TSerialObs to store and subscribe to it without storing subscription  */
    push(obs, { unload, nextId, local: $local } = {}) {
        const old = this.map.finddir(obs);
        const id = this.getNext(old?.[0] ?? this.locals.find(obs, true) ?? this.map.usedId(obs.origin) ?? nextId?.(obs));
        let wrapped = obs;
        let subscription;
        if (old === undefined) {
            let destroyed = false;
            const temp = [];
            const clear = function () {
                temp.forEach(this.add.bind(this));
                temp.length = 0;
            };
            const asubj = obs.origin.subject.pipe(altern_map_1.alternMap(({ args, n }) => {
                const wrap = (obs) => {
                    const res = this.push(obs, { local: $local, nextId: (nextId && ((obs, pId) => nextId(obs, pId ?? id))) });
                    temp.push(res.subscription);
                    return res.wrapped;
                };
                const array = n === 2
                    ? args.map(arg => rx_utils_1.eagerCombineAll(arg.map(wrap)))
                    : args.map(wrap);
                const ret = rx_utils_1.eagerCombineAll(array);
                return ret;
            }, { completeWithInner: true }), operators_1.tap(clear));
            const teardown = () => {
                unload?.({ id });
                this.map.delete(id);
                destroyed = true;
                const local = this.locals.get(id)?.[1];
                if ((!local || local.out) && this.pushed.delete(obs)) {
                    this._pushes.next([obs, id, false]);
                }
                clear.call(rxjs_1.Subscription.EMPTY);
            };
            if ($local?.closed !== false) {
                wrapped = global_1.defineProperty(Object.assign(rx_utils_1.eagerCombineAll([obs, asubj]).pipe(operators_1.finalize(teardown), operators_1.map(([v]) => v), operators_1.shareReplay({ bufferSize: 1, refCount: true })), { origin: obs.origin, parent: obs }), 'destroyed', { get() { return destroyed; } });
            }
            else {
                if (!$local[constants_1.nodeps])
                    $local.add(asubj.subscribe(() => { }));
                $local.add(teardown);
            }
            this.map.set(id, [wrapped, {}]);
            const observe = this.observe;
            subscription = wrapped.subscribe(observe && !obs.origin.handler[constants_1.transient] ? observe(wrapped) : rxjs_1.noop);
            const local = this.locals.get(id)?.[1];
            if (!subscription.closed && (!local || local.out)) {
                this.pushed.set(obs, id);
                this._pushes.next([obs, id, true]);
            }
        }
        else {
            if (old[1] === 'down')
                wrapped = this.map.get(id)[0];
            subscription = wrapped.subscribe(() => { });
        }
        return { ref: { id }, wrapped, subscription };
    }
    /**
     * serialize any serial observable regardless wether its in the store
     * @param {Origin} obs the observable to serialize
     * @param {SerializationOptions} opt options of serialization
     */
    serialize(obs, opt) {
        const { isNew, push = true, ignore = [] } = opt;
        const that = this;
        return obs.pipe(operators_1.scan(function (previous) {
            const session = new bimap_1.BiMap;
            const allData = new Map();
            const subs = new rxjs_1.Subscription;
            let next = 1;
            const getter = (r) => ('id' in r ? that.map.get(r.id) : session.get(r.$))[0];
            const inMap = (arg) => that.map.find(arg) !== undefined;
            const ref = (iObs) => {
                const origin = iObs.origin, entry = iObs.origin.subject.value;
                const value = origin_1.Origin.current(iObs, this);
                const id = that.map.find(iObs);
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
                            const { subscription, ref } = that.push(iObs);
                            subs.add(subscription);
                            usedId = ref.id;
                        }
                        else {
                            usedId = that.map.usedId(iObs);
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
                deref: that.deref(getter), xderef: that.xderef(getter), ref, ...that.extra
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
    call(fId, param, arg, opt = {}) {
        const f = this.functions[fId];
        const subs = new rxjs_1.Subscription();
        const obs = f(param, this.getValue(arg)[0], subs);
        if (opt.graph)
            return new rxjs_1.Observable(subscriber => {
                obs.then(obs => {
                    const { subscription } = this.push(obs);
                    subscription.add(subs);
                    const serialized = this.serialize(obs.origin, { isNew: true, ignore: opt.ignore });
                    subscriber.add(serialized.subscribe(subscriber));
                    subscriber.add(subscription);
                });
            });
        return new rxjs_1.Observable(subscriber => {
            obs.then(obs => {
                const { subscription, ref } = this.push(obs);
                subscription.add(subs);
                subscriber.next(ref);
                subscriber.add(subscription);
            });
        });
    }
    /* #endregion */
    remote(fId, arg, param, opt = {}) {
        return new rxjs_1.Observable(subscriber => {
            const { watch, call, serialized } = this.callHandler;
            const wop = watch(), cop = call();
            const { subscription: argSubscription, ref: refArg } = this.push(arg, opt.graph ? {
                unload: (ref) => wop.unsubscribe(ref),
            } : {});
            const callSubscription = new rxjs_1.Subscription();
            const makePromise = (res) => [new this.promiseCtr(r => res = r), res];
            const refTask = makePromise();
            if (opt.graph) {
                let serializeObs = serialized.get(arg);
                if (!serializeObs)
                    serialized.set(arg, serializeObs = this.serialize(arg, {
                        isNew: true
                    }).pipe(rx_async_1.asyncMap((def) => {
                        const refsPromise = wop.put(def);
                        return refsPromise.then((refs) => ({ ok: true, value: refs[0] }));
                    }), operators_1.tap({
                        error: e => wop.error(refArg, e),
                        complete: () => wop.complete(refArg),
                    }), operators_1.shareReplay({ refCount: true, bufferSize: 1 })));
                const paramSubs = serializeObs.subscribe(() => { });
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
            const responseSubs = cop.subscribeToResult({
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
                    cop.end_call();
            });
            callSubscription.add(responseSubs);
            responseSubs.add(callSubscription);
            cop.call(fId, param, refArg, opt);
            if (opt.graph)
                refTask[0].then(refReturn => {
                    const subs2 = this.getValue(refReturn)[0].subscribe(subscriber);
                    callSubscription.add(subs2);
                });
            subscriber.add(callSubscription);
        });
    }
}
exports.Store = Store;
//# sourceMappingURL=store.js.map