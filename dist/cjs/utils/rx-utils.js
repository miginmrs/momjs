"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.current = exports.on = exports.eagerCombineAll = exports.EMPTY_ARR = void 0;
const rxjs_1 = require("rxjs");
const combineLatest_1 = require("rxjs/internal/observable/combineLatest");
class CompleteDestination extends rxjs_1.Subscriber {
    notifyComplete() { this.destination.complete?.(); }
}
exports.EMPTY_ARR = rxjs_1.concat(rxjs_1.of([]), rxjs_1.NEVER);
exports.eagerCombineAll = function (...args) {
    if (args.length === 0 || args.length === 1 && args[0] instanceof Array && args[0].length === 0)
        return exports.EMPTY_ARR;
    const obs = rxjs_1.combineLatest.apply(this, args);
    obs.operator.call = function (sink, source) {
        const subscriber = combineLatest_1.CombineLatestOperator.prototype.call(sink, source);
        subscriber.notifyComplete = CompleteDestination.prototype.notifyComplete;
    };
    return obs;
};
exports.on = ({ complete, error, next, subscribe, teardown }) => (source) => source.lift(function (source) {
    const subscriber = this;
    subscribe?.();
    const subscription = new rxjs_1.Subscription();
    subscription.add(source.subscribe(v => {
        next?.(v);
        subscriber.next(v);
    }, e => {
        error?.(e);
        subscriber.error(e);
    }, () => {
        complete?.();
        subscriber.complete();
    }));
    subscription.add(teardown);
    return subscription;
});
function current(obs, value) {
    obs.subscribe(v => value = v).unsubscribe();
    return value;
}
exports.current = current;
//# sourceMappingURL=rx-utils.js.map