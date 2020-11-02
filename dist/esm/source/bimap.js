import { Observable, Subject } from 'rxjs';
import { wrap } from './wrap';
export class BiMap {
    constructor(watch = false) {
        this.watch = watch;
        this.byId = new Map();
        this.byObs = new Map();
        this.oldId = new WeakMap();
        this._empty = new Subject();
        this.empty = new Observable(subscriber => {
            if (!this.byId.size)
                subscriber.next();
            this._empty.subscribe(subscriber);
        });
    }
    get(id) { return this.byId.get(id); }
    delete(id) {
        const stored = this.byId.get(id);
        if (stored)
            this.byObs.delete(stored[0].origin);
        const res = this.byId.delete(id);
        if (this.watch && !this.byId.size)
            this._empty.next();
        return res;
    }
    set(id, value) {
        if (this.byObs.has(value[0].origin))
            throw new Error('Object already in store');
        if (this.byId.has(id))
            throw new Error('Id already used');
        this.byObs.set(value[0].origin, id);
        this.oldId.set(value[0].origin, id);
        this.byId.set(id, value);
    }
    ;
    reuseId(obs, id) {
        this.oldId.set(obs.origin, id);
    }
    ;
    finddir(obs) {
        const origin = obs.origin, id = this.byObs.get(origin);
        if (id === undefined)
            return undefined;
        const entry = this.byId.get(id), found = entry[0];
        if (found === obs)
            return [id, 'exact'];
        const foundParents = new Set([found]), obsParents = new Set([obs]);
        let upfound = [found], upobs = [obs];
        while (true) {
            upfound = upfound.flatMap(o => o.parent);
            upobs = upobs.flatMap(o => o.parent);
            const done = upobs.every(o => obsParents.has(o) || void obsParents.add(o)) && upfound.every(o => foundParents.has(o) || void foundParents.add(o));
            if (upfound.some(o => obsParents.has(o)) || upobs.some(o => foundParents.has(o))) {
                if (upobs.indexOf(found) !== -1)
                    return [id, 'up'];
                if (upfound.indexOf(obs) === -1)
                    entry[0] = wrap(found, () => entry[0] = found, obs.subscribe.bind(obs), [found, obs]);
                return [id, 'down'];
            }
            if (done)
                throw new Error('Another observable with the same origin is in the store');
        }
    }
    find(obs, any = false) {
        return any ? this.byObs.get(obs.origin) : this.finddir(obs)?.[0];
    }
    ;
    usedId(obs) {
        return this.oldId.get(obs.origin);
    }
    ;
    get size() { return this.byId.size; }
    keys() { return this.byId.keys(); }
    entries() { return this.byId.entries(); }
    values() { return this.byId.values(); }
}
//# sourceMappingURL=bimap.js.map