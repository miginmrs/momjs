import { Observable, ReplaySubject } from 'rxjs';
import { defineProperty } from '../utils';
import { multicast, refCount } from 'rxjs/operators';
export const wrap = (obs, teardown, subscribe, parent = obs, subjectFactory = () => new ReplaySubject(1)) => {
    let destroyed = false;
    return defineProperty(Object.assign(new Observable(subscriber => {
        if (destroyed)
            throw new Error('Subscription to a destroyed observable');
        subscriber.add(teardown);
        subscriber.add(subscribe());
        obs.subscribe(subscriber);
        subscriber.add(() => destroyed = true);
    }).pipe(multicast(subjectFactory), refCount()), { origin: obs.origin, parent }), 'destroyed', { get() { return destroyed; } });
};
//# sourceMappingURL=wrap.js.map