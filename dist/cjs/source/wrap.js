"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrap = void 0;
const rxjs_1 = require("rxjs");
const utils_1 = require("../utils");
const operators_1 = require("rxjs/operators");
exports.wrap = (obs, teardown, subscribe, parent = obs, subjectFactory = () => new rxjs_1.ReplaySubject(1)) => {
    let destroyed = false;
    return utils_1.defineProperty(Object.assign(new rxjs_1.Observable(subscriber => {
        if (destroyed)
            throw new Error('Subscription to a destroyed observable');
        subscriber.add(teardown);
        subscriber.add(subscribe());
        obs.subscribe(subscriber);
        subscriber.add(() => destroyed = true);
    }).pipe(operators_1.multicast(subjectFactory), operators_1.refCount()), { origin: obs.origin, parent }), 'destroyed', { get() { return destroyed; } });
};
//# sourceMappingURL=wrap.js.map