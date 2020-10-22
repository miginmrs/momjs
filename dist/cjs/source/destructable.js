"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Destructable = exports.destructableCmp = void 0;
const rxjs_1 = require("rxjs");
const altern_map_1 = require("altern-map");
const rx_utils_1 = require("../utils/rx-utils");
const operators_1 = require("rxjs/operators");
const guards_1 = require("../utils/guards");
require("../utils/rx-utils");
exports.destructableCmp = ({ compareData = (x, y) => x === y, compareObs = (x, y) => x === y } = {}) => (x, y) => x.args.length === y.args.length && x.args.every((v, i) => {
    const vItem = v, yItem = y.args[i];
    if (vItem instanceof Array) {
        if (yItem instanceof Array)
            return vItem.length === yItem.length && vItem.every(x => x === yItem[i]);
        return false;
    }
    if (yItem instanceof Array)
        return false;
    return compareObs(vItem, yItem);
}) && compareData(x.data, y.data);
class Destructable extends rxjs_1.Observable {
    constructor(handlers, key, c, init, compare = exports.destructableCmp(), ...teardownList) {
        super();
        this.handlers = handlers;
        this.key = key;
        this.c = c;
        this.origin = this;
        this.parent = this;
        const handler = this.handler;
        this.subject = new rxjs_1.BehaviorSubject(init);
        const destroy = this.destroy = new rxjs_1.Subscription();
        destroy.add(handler.destroy?.(init.data));
        teardownList.forEach(cb => destroy.add(cb));
        destroy.add(() => {
            if (!this.subject.isStopped)
                this.subject.unsubscribe();
            else
                this.subject.closed = true;
        });
        this.source = new rxjs_1.Observable(subscriber => {
            const subs = this.subject.pipe(operators_1.distinctUntilChanged(compare), altern_map_1.alternMap(({ args, data }) => {
                const array = args.map(args => args instanceof Array ? rx_utils_1.eagerCombineAll(args) : args);
                return rx_utils_1.eagerCombineAll(array).pipe(operators_1.map(args => [args, data, c]));
            }, { completeWithInner: true, completeWithSource: true }), operators_1.tap({ error: err => this.subject.error(err), complete: () => this.subject.complete() }), operators_1.scan((old, [args, data, c]) => handler.ctr(args, data, c, old, this), null)).subscribe(subscriber);
            subs.add(this.destroy);
            return subs;
        });
        this.operator = operators_1.shareReplay({ bufferSize: 1, refCount: true })(this).operator;
    }
    get destroyed() { return this.destroy.closed; }
    get handler() {
        return guards_1.byKey(this.handlers, this.key);
    }
    add(teardown) {
        return this.destroy.add(teardown);
    }
}
exports.Destructable = Destructable;
//# sourceMappingURL=destructable.js.map