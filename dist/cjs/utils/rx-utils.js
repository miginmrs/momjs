"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.current = exports.eagerCombineAll = void 0;
const rxjs_1 = require("rxjs");
const combineLatest_1 = require("rxjs/internal/observable/combineLatest");
class CompleteDestination extends rxjs_1.Subscriber {
    notifyComplete() { this.destination.complete?.(); }
}
/** Like combineLatest but emits if the array of observables is empty
 * and completes when and only when one observable completes */
exports.eagerCombineAll = function (...args) {
    if (args.length === 0 || args.length === 1 && args[0] instanceof Array && args[0].length === 0)
        return rxjs_1.concat(rxjs_1.of([]), rxjs_1.NEVER);
    const obs = rxjs_1.combineLatest.apply(this, args);
    obs.operator.call = function (sink, source) {
        const subscriber = combineLatest_1.CombineLatestOperator.prototype.call(sink, source);
        subscriber.notifyComplete = CompleteDestination.prototype.notifyComplete;
    };
    return obs;
};
function current(obs, value) {
    obs.subscribe(v => value = v).unsubscribe();
    return value;
}
exports.current = current;
//# sourceMappingURL=rx-utils.js.map