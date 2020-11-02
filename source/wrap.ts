import type { AppX } from 'dependent-type';
import type { TVCDA_CIM, TVCDADepConstaint } from './types/basic';
import type { EHConstraint, SerialObs } from './types/serial';
import { Observable, ReplaySubject, Subject, Subscription, TeardownLogic } from 'rxjs';
import { defineProperty } from '../utils';
import { multicast, refCount } from 'rxjs/operators';

export const wrap = <dom, cim extends TVCDA_CIM, k extends TVCDADepConstaint<dom, cim>, X extends dom, n extends 1 | 2, EH extends EHConstraint<EH, ECtx>, ECtx, $V extends (v: AppX<'V', cim, k, X>) => void = (v: AppX<'V', cim, k, X>) => void>(
  obs: SerialObs<dom, cim, k, X, n, EH, ECtx, $V>,
  teardown: TeardownLogic,
  subscribe: () => Subscription,
  parent: SerialObs<dom, cim, k, X, n, EH, ECtx, $V> | SerialObs<dom, cim, k, X, n, EH, ECtx, $V>[] = obs,
  subjectFactory: (this: Observable<AppX<'V', cim, k, X>>) => Subject<AppX<'V', cim, k, X>> = () => new ReplaySubject(1)
): SerialObs<dom, cim, k, X, n, EH, ECtx, $V> => {
  let destroyed = false;
  return defineProperty(
    Object.assign(new Observable<Parameters<$V>[0]>(subscriber => {
      if(destroyed) throw new Error('Subscription to a destroyed observable');
      subscriber.add(teardown);
      subscriber.add(subscribe());
      obs.subscribe(subscriber);
      subscriber.add(() => destroyed = true);
    }).pipe(multicast(subjectFactory), refCount()), { origin: obs.origin, parent }),
    'destroyed', { get() { return destroyed } }
  )
};
