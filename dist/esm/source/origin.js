import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { alternMap } from 'altern-map';
import { eagerCombineAll } from '../utils/rx-utils';
import { map, shareReplay, distinctUntilChanged, scan, tap } from 'rxjs/operators';
export const compareEntries = ({ compareData = (x, y) => x === y, compareObs = (x, y) => x === y } = {}) => (x, y) => x.args.length === y.args.length && x.args.every((v, i) => {
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
export class Origin extends Observable {
    constructor(getHandler, key, c, init, compare = compareEntries(), ...teardownList) {
        super();
        this.getHandler = getHandler;
        this.key = key;
        this.c = c;
        this.origin = this;
        this.parent = this;
        const handler = this.handler = getHandler(key);
        let current = init.data;
        this.subject = new BehaviorSubject(init);
        this.teardown = new Subscription();
        teardownList.forEach(this.teardown.add.bind(this.teardown));
        this.source = new Observable(subjectSubscriber => {
            subjectSubscriber.add(this.teardown);
            subjectSubscriber.add(() => {
                handler.destroy?.(current);
                if (!this.subject.isStopped)
                    this.subject.unsubscribe();
                else
                    this.subject.closed = true;
            });
            this.subject.pipe(distinctUntilChanged(compare), alternMap(({ args, data }) => eagerCombineAll(args.map(args => args instanceof Array ? eagerCombineAll(args) : args)).pipe(map(args => [args, data, c])), { completeWithInner: true, completeWithSource: true }), tap({ error: err => this.subject.error(err), complete: () => this.subject.complete() }), scan((old, [args, data, c]) => handler.ctr(args, current = data, c, old, this), null)).subscribe(subjectSubscriber);
        });
        this.operator = shareReplay({ bufferSize: 1, refCount: true })(this).operator;
    }
    get destroyed() { return this.teardown.closed; }
    add(teardown) {
        return this.teardown.add(teardown);
    }
}
//# sourceMappingURL=origin.js.map