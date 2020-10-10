import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { alternMap } from 'altern-map';
import { eagerCombineAll } from '../utils/rx-utils';
import { map, shareReplay, distinctUntilChanged, scan, tap } from 'rxjs/operators';
import { byKey } from '../utils/guards';
import '../utils/rx-utils';
export const destructableCmp = ({ compareData = (x, y) => x === y, compareObs = (x, y) => x === y } = {}) => (x, y) => x.args.length === y.args.length && x.args.every((v, i) => {
    const vItem = v, yItem = y.args[i];
    if (vItem instanceof Array) {
        if (yItem instanceof Array)
            return vItem.length === yItem.length && vItem.every((x, i) => x === yItem[i]);
        return false;
    }
    if (yItem instanceof Array)
        return false;
    return compareObs(vItem, yItem);
}) && compareData(x.data, y.data);
export class Destructable extends Observable {
    constructor(handlers, key, c, init, compare = destructableCmp(), ...teardownList) {
        super();
        this.handlers = handlers;
        this.key = key;
        this.c = c;
        this.origin = this;
        this.parent = this;
        const handler = this.handler;
        this.subject = new BehaviorSubject(init);
        this.destroy = new Subscription(() => {
            if (!this.subject.isStopped)
                this.subject.unsubscribe();
            else
                this.subject.closed = true;
        });
        teardownList.forEach(cb => this.destroy.add(cb));
        this.source = new Observable(subscriber => {
            const subs = this.subject.pipe(distinctUntilChanged(compare), alternMap(({ args, data }) => {
                const array = args.map(args => args instanceof Array ? eagerCombineAll(args) : args);
                return eagerCombineAll(array).pipe(map(args => {
                    if (args[0] instanceof Array && args[0] === args[1])
                        debugger;
                    return [args, data, c];
                }));
            }, { completeWithInner: true, completeWithSource: true }), tap({ error: err => this.subject.error(err), complete: () => this.subject.complete() }), scan((old, [args, data, c]) => handler.ctr(args, data, c, old, this), null)).subscribe(subscriber);
            subs.add(this.destroy);
            return subs;
        });
        this.operator = shareReplay({ bufferSize: 1, refCount: true })(this).operator;
    }
    get destroyed() { return this.destroy.closed; }
    get handler() {
        return byKey(this.handlers, this.key);
    }
}
//# sourceMappingURL=destructable.js.map