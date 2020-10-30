import { Observable, Subject } from 'rxjs';
import { TSerialObs, EHConstraint, TOrigin } from './types/serial'


export class BiMap<EH extends EHConstraint<EH, ECtx>, ECtx, D, k = string> {
  private byId = new Map<k, [TSerialObs<any, EH, ECtx>, D]>();
  private byObs = new Map<TOrigin<unknown, EH, ECtx>, k>();
  private oldId = new WeakMap<TOrigin<unknown, EH, ECtx>, k>();
  private _empty = new Subject<void>();
  readonly empty = new Observable<void>(subscriber => {
    if (!this.byId.size) subscriber.next();
    this._empty.subscribe(subscriber);
  });
  constructor(readonly watch = false) { }
  get(id: k) { return this.byId.get(id); }
  delete(id: k) {
    const stored = this.byId.get(id);
    if (stored) this.byObs.delete(stored[0].origin);
    const res = this.byId.delete(id);
    if (this.watch && !this.byId.size) this._empty.next();
    return res;
  }
  set(id: k, value: [TSerialObs<unknown, EH, ECtx>, D]) {
    if (this.byObs.has(value[0].origin)) throw new Error('Object already in store');
    if (this.byId.has(id)) throw new Error('Id already used');
    this.byObs.set(value[0].origin, id);
    this.oldId.set(value[0].origin, id);
    this.byId.set(id, value);
  };
  reuseId(obs: TSerialObs<unknown, EH, ECtx>, id: k) {
    this.oldId.set(obs.origin, id);
  };
  finddir(obs: TSerialObs<unknown, EH, ECtx>): [k, 'up' | 'down' | 'exact'] | undefined {
    const origin = obs.origin, id = this.byObs.get(origin);
    if (id === undefined) return undefined;
    const entry = this.byId.get(id)!, found = entry[0];
    let upfound = found, upobs = obs;
    if (found === obs) return [id, 'exact'];
    const foundParents = new Set([upfound]), obsParents = new Set([upobs]);
    while (true) {
      const done = !obsParents.add(upobs = upobs.parent) && !foundParents.add(upfound = upfound.parent);
      if (obsParents.has(upfound) || foundParents.has(upobs)) {
        if (upfound === obs) return [id, 'down'];
        if (upobs !== found) entry[0] = upobs;
        return [id, 'up'];
      }
      if (done) throw new Error('Another observable with the same origin is in the store');
      upobs = upobs.parent;
      upfound = upfound.parent;
    }
  }
  find(obs: TSerialObs<unknown, EH, ECtx>, any = false) {
    return any ? this.byObs.get(obs.origin) : this.finddir(obs)?.[0];
  };
  usedId(obs: TSerialObs<unknown, EH, ECtx>) {
    return this.oldId.get(obs.origin);
  };
  get size() { return this.byId.size }
  keys() { return this.byId.keys() }
  entries() { return this.byId.entries() }
  values() { return this.byId.values() }
}
