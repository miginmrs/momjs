"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Origin = exports.compareEntries = void 0;
const rxjs_1 = require("rxjs");
const altern_map_1 = require("altern-map");
const rx_utils_1 = require("../utils/rx-utils");
const operators_1 = require("rxjs/operators");
exports.compareEntries = ({ compareData = (x, y) => x === y, compareObs = (x, y) => x === y } = {}) => (x, y) => x.args.length === y.args.length && x.args.every((v, i) => {
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
class Origin extends rxjs_1.Observable {
    constructor(getHandler, key, c, init, compare = exports.compareEntries(), ...teardownList) {
        super();
        this.getHandler = getHandler;
        this.key = key;
        this.c = c;
        this.origin = this;
        this.parent = this;
        const handler = this.handler = getHandler(key);
        let current = init.data;
        this.subject = new rxjs_1.BehaviorSubject(init);
        this.teardown = new rxjs_1.Subscription();
        teardownList.forEach(this.teardown.add.bind(this.teardown));
        this.source = new rxjs_1.Observable(subjectSubscriber => {
            subjectSubscriber.add(this.teardown);
            subjectSubscriber.add(() => {
                handler.destroy?.(current);
                if (!this.subject.isStopped)
                    this.subject.unsubscribe();
                else
                    this.subject.closed = true;
            });
            this.subject.pipe(operators_1.distinctUntilChanged(compare), altern_map_1.alternMap(({ args, data }) => rx_utils_1.eagerCombineAll(args.map(args => args instanceof Array ? rx_utils_1.eagerCombineAll(args) : args)).pipe(operators_1.map(args => [args, data, c])), { completeWithInner: true, completeWithSource: true }), operators_1.tap({ error: err => this.subject.error(err), complete: () => this.subject.complete() }), operators_1.scan((old, [args, data, c]) => handler.ctr(args, current = data, c, old, this), null)).subscribe(subjectSubscriber);
        });
        this.operator = operators_1.shareReplay({ bufferSize: 1, refCount: true })(this).operator;
    }
    get destroyed() { return this.teardown.closed; }
    add(teardown) {
        return this.teardown.add(teardown);
    }
}
exports.Origin = Origin;
//# sourceMappingURL=origin.js.map