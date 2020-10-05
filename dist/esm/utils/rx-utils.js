import { combineLatest, of, Subscriber, Subscription, concat, NEVER } from 'rxjs';
import { CombineLatestOperator } from 'rxjs/internal/observable/combineLatest';
class CompleteDestination extends Subscriber {
    notifyComplete() { this.destination.complete?.(); }
}
export const EMPTY_ARR = concat(of([]), NEVER);
/** Like combineLatest but emits if the array of observables is empty
 * and completes when and only when one observable completes */
export const eagerCombineAll = function (...args) {
    if (args.length === 0 || args.length === 1 && args[0] instanceof Array && args[0].length === 0)
        return EMPTY_ARR;
    const obs = combineLatest.apply(this, args);
    obs.operator.call = function (sink, source) {
        const subscriber = CombineLatestOperator.prototype.call(sink, source);
        subscriber.notifyComplete = CompleteDestination.prototype.notifyComplete;
    };
    return obs;
};
export const on = ({ complete, error, next, subscribe, teardown }) => (source) => source.lift(function (source) {
    const subscriber = this;
    subscribe?.();
    const subscription = new Subscription();
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
export function current(obs, value) {
    obs.subscribe(v => value = v).unsubscribe();
    return value;
}
//# sourceMappingURL=rx-utils.js.map