import { combineLatest, of, Subscriber, concat, NEVER } from 'rxjs';
import { CombineLatestOperator } from 'rxjs/internal/observable/combineLatest';
class CompleteDestination extends Subscriber {
    notifyComplete() { this.destination.complete?.(); }
}
/** Like combineLatest but emits if the array of observables is empty
 * and completes when and only when one observable completes */
export const eagerCombineAll = function (...args) {
    if (args.length === 0 || args.length === 1 && args[0] instanceof Array && args[0].length === 0)
        return concat(of([]), NEVER);
    const obs = combineLatest.apply(this, args);
    obs.operator.call = function (sink, source) {
        const subscriber = CombineLatestOperator.prototype.call(sink, source);
        subscriber.notifyComplete = CompleteDestination.prototype.notifyComplete;
    };
    return obs;
};
export function current(obs, value) {
    obs.subscribe(v => value = v).unsubscribe();
    return value;
}
//# sourceMappingURL=rx-utils.js.map