import { expect } from 'chai';
import { Store } from '../source/store';
import { JsonCim, JsonTypeKeys, ArrayTypeKeys, ArrayCim, JsonHandler, F_Ref, F_Destructable, F_ID, F_C } from '../source/handlers';
import { TestScheduler } from 'rxjs/testing';
import {
  Destructable, AppX, ObsWithOrigin, CtxH, Ref, EHConstraint, DeepDestructable, TypedDestructable,
  DestructableCtr, wrapJson, ArrayHandler, wrapArray, JsonDestructable, ArrayDestructable, JsonObject
} from '../source';
import { Subscription, ObservedValueOf, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { current } from '../utils/rx-utils';
import { map as dep_map } from 'dependent-type';
import _ from 'lodash';

const { depMap } = dep_map;

type ToRef1<X> = Ref<any>[] & { [P in keyof X]: Ref<X[P]> }
type ToRef2<X> = ToRef1<X[Exclude<keyof X, keyof any[]>]>[] & { [P in Exclude<keyof X, keyof any[]>]: ToRef1<X[P]> };
declare const F_Destructable2: unique symbol;
declare const F_ArrArgs2: unique symbol;
declare const F_Ref2: unique symbol;
declare module 'dependent-type' {
  export interface TypeFuncs<C, X> {
    [F_Destructable2]: DeepDestructable<C[0 & keyof C][keyof C[0 & keyof C]] & any[], 1, C[1 & keyof C], C[2 & keyof C]>,
    [F_ArrArgs2]: ToRef2<X>,
    [F_Ref2]: ToRef1<C[X & keyof C]>,
  }
}
type ArrayTypeKeys2 = {
  T: typeof F_ArrArgs2;
  V: typeof F_ID;
  C: typeof F_C;
  D: typeof F_C;
  A: typeof F_ID;
}
type ArrayCim2 = { T: [never, Ref<any>[][]], V: [never, any[]], C: [null, null], D: [null, null], A: [never, any[][]] };
const ArrayCtr2: DestructableCtr<any[][], ArrayCim2, ArrayTypeKeys2> = <X extends any[]>(x: X, _d: null, _c: null, old: any[] | null) => {
  if (old) { old.splice(0); x = Object.assign(old, x); }
  return x;
}
const ArrayHandler2 = <EH extends EHConstraint<EH, ECtx>, ECtx>(): CtxH<any[][], ArrayCim2, ArrayTypeKeys2, 2, EH, ECtx> => ({
  decode: ({ deref }) => (_id, data) => ({ args: data.map(refs => refs.map(ref => deref(ref))) as any, data: null, n: 2 }),
  encode: ({ ref }) => <C extends any[][]>({ args }: { args: DeepDestructable<C, 2, EH, ECtx> }): ToRef2<C> => {
    type PC = { [P in Exclude<keyof C, keyof any[]>]: C[P] };
    type cim = [
      [[PC, EH, ECtx], DeepDestructable<PC[keyof PC] & any[], 1, EH, ECtx>],
      [PC, ToRef1<PC[keyof PC]>]
    ];
    type k = [typeof F_Destructable2, typeof F_Ref2];
    return depMap<keyof PC, cim, k>(args, <X extends keyof PC>(arg: DeepDestructable<PC[], 1, EH, ECtx>): AppX<1, cim, k, X> => {
      const item: ToRef1<PC[X]> = depMap<
        keyof PC[X], [
          [[PC[X], EH, ECtx], TypedDestructable<PC[X][keyof PC[X]], EH, ECtx>],
          [PC[X], Ref<PC[X][keyof PC[X]]>]
        ], [typeof F_Destructable, typeof F_Ref]>(arg, ref);
      return item;
    });
  },
  ctr: ArrayCtr2,
});


namespace RequestHandlers {
  export const Array: CtxH<any[], ArrayCim, ArrayTypeKeys, 1, RH, {}> = ArrayHandler<RH, {}>();
  export const Json: CtxH<JsonObject, JsonCim, JsonTypeKeys, 1, RH, {}> = JsonHandler<RH, {}>();
  export const Array2: CtxH<any[][], ArrayCim2, ArrayTypeKeys2, 2, RH, {}> = ArrayHandler2<RH, {}>();
}
type RH = typeof RequestHandlers;


const testScheduler = new TestScheduler((actual, expected) => {
  expect(actual).deep.equal(expected);
});


describe('Store', () => {
  const store = new Store(RequestHandlers, { someData: 1 }, Promise)
  describe('first entry', () => {
    const init = () => {
      const [x1] = store.unserialize<0, [[JsonObject, JsonCim]], [JsonTypeKeys], [{ x: number }], [1]>([{
        type: 'Json', data: { x: 1 }, c: null, i: 0 as const
      }])!;
      const obs = store.getValue(x1)[0];
      return [x1, obs] as const;
    };
    let x1: ReturnType<typeof init>[0];
    let obs: ReturnType<typeof init>[1];
    before(() => {
      [x1, obs] = init();
    });
    it('should start by id = 1', () => {
      expect(x1.id).equal('1');
    });
    it('should store value', () => {
      var n: number = 0;
      obs.subscribe(({ x }) => n = x).unsubscribe()
      expect(n).equal(1);
    });
    it('should push new values', () => {
      var n: number[] = [];
      const subs = obs.subscribe(({ x }) => n.push(x));
      store.unserialize<0, [[JsonObject, JsonCim]], [JsonTypeKeys], [{ x: number }], [1]>([{
        type: 'Json', data: { x: 2 }, c: null, i: 0, id: '1', new: false
      }]);
      subs.unsubscribe();
      expect(n).deep.equal([1, 2]);
    });
    it('should not be directly destroyed', () => {
      expect(obs.destroyed).equals(false);
    });
    it('should be removed after unsubscription', () => {
      const notRemovedYet = store.getValue(x1)[1];
      expect(notRemovedYet).not.eq(undefined);
      store.getValue(x1)[1].subscription!.unsubscribe();
      expect(store.get(x1.id)).equals(undefined);
    });
    it('should be destroyed after unsubscription', () => {
      expect(obs.destroyed).equals(true);
    });
    it('should throw error when subscribed after destruction', () => {
      testScheduler.run(helpers => {
        const { expectObservable } = helpers;
        expectObservable(obs).toBe('#', null, { message: 'object unsubscribed', name: 'ObjectUnsubscribedError' });
      });
    });
  });
  describe('second entry', () => {
    const init = () => {
      const [x2, arr] = store.unserialize<0 | 1, [[JsonObject, JsonCim], [any[], ArrayCim]], [JsonTypeKeys, ArrayTypeKeys], [{ x: number }, [{ x: number }]], [1, 1]>(ref => [{
        type: 'Json', data: { x: 2 }, c: null, i: 0, new: true, id: '1'
      }, {
        type: 'Array', data: [ref(0)], c: null, new: true, i: 1,
      }])!
      return [x2, arr] as const;
    };
    let x2: ReturnType<typeof init>[0];
    let arr: ReturnType<typeof init>[1];
    before(() => {
      [x2, arr] = init();
    });
    it('should prevent first entry from destruction', () => {
      store.getValue(x2)[1].subscription!.unsubscribe();
      const obs = store.getValue(arr)[0];
      expect(obs.destroyed).equals(false);
    });
    it('should chain destruction', () => {
      store.getValue(arr)[1].subscription!.unsubscribe();
      expect(store.get(x2.id)).equals(undefined);
      expect(store.get(arr.id)).equals(undefined);
    });
  });
  type json = { msg: string };
  let jsonObs: JsonDestructable<json, RH, {}>;
  let arr1Obs: ArrayDestructable<[json, json, json], RH, {}>;
  let arr2Obs: ArrayDestructable<[[json, json, json], json], RH, {}>;
  let jsonWrp: ObsWithOrigin<json, RH, {}>;
  let arrWrp: ObsWithOrigin<[[json, json, json], json], RH, {}>;
  let originSubs: Subscription;
  describe('push method', () => {
    const handlers = RequestHandlers;
    let subs: Subscription;
    it('should chain insertion', async () => {
      jsonObs = wrapJson({ msg: 'hi' }, handlers);
      const jsonRes = await store.push(jsonObs);
      jsonWrp = jsonRes.wrapped;
      const subs0 = jsonRes.subscription;
      expect(jsonWrp).not.eq(jsonObs);
      expect(jsonWrp.origin).eq(jsonObs);
      expect([...(store['map']['byId']).keys()]).deep.eq(['3']);
      arr1Obs = wrapArray([jsonObs, jsonObs, jsonObs], handlers);
      arr2Obs = wrapArray([arr1Obs, jsonObs], handlers)
      const arrRes = await store.push(arr2Obs);
      arrWrp = arrRes.wrapped;
      subs = arrRes.subscription;
      expect(arrWrp).not.eq(arr2Obs);
      expect(arrWrp.origin).eq(arr2Obs);
      subs0.unsubscribe();
      expect([...(store['map']['byId']).keys()]).deep.eq(['3', '4', '5']);
    });
    it('should chain only destruction of wrappers', async () => {
      originSubs = arr2Obs.subscribe(() => { });
      subs.unsubscribe();
      expect([...(store['map']['byId']).keys()]).deep.eq([]);
      expect([jsonObs.destroyed, arr1Obs.destroyed, arr2Obs.destroyed]).deep.eq([false, false, false]);
      expect([jsonWrp.destroyed, arrWrp.destroyed]).deep.eq([true, true]);
    });
  });
  describe('serialize method', () => {
    const serialize = () => store.serialize(arr2Obs, { isNew: true });
    let def: ObservedValueOf<ReturnType<typeof serialize>>;
    it('should recursively encode dependencies', async () => {
      def = await serialize().pipe(take(1)).toPromise();
      expect(def).not.eq(null);
      const jsonRef = { '$': 2 };
      expect(def).deep.eq([{
        i: 0, type: 'Array', c: null, id: '4', data: [{ '$': 1 }, jsonRef], new: true
      }, {
        i: 1, type: 'Array', c: null, id: '5', data: [jsonRef, jsonRef, jsonRef], new: false
      }, {
        i: 2, type: 'Json', c: null, id: '3', data: { msg: 'hi' }, new: false
      }]);
    });
    const unserialize = () => store.unserialize<0, [[any[], ArrayCim]], [ArrayTypeKeys], [[[json, json, json], json]], [1]>(def!)!;
    let ref: ReturnType<typeof unserialize>[0];
    it('should provide correct inputs for unserialize', async () => {
      [ref] = unserialize();
      expect(current(store.getValue(ref)[0])).deep.eq([
        [{ msg: 'hi' }, { msg: 'hi' }, { msg: 'hi' }],
        { msg: 'hi' }
      ]);
    });
    it('should not depend on original observables', async () => {
      originSubs.unsubscribe();
      expect([jsonObs.destroyed, arr1Obs.destroyed, arr2Obs.destroyed]).deep.eq([true, true, true]);
      [arrWrp] = store.getValue(ref);
      jsonWrp = arrWrp.origin.subject.value.args[1] as ObsWithOrigin<json, RH, {}>;
      expect([jsonWrp.destroyed, jsonWrp.destroyed]).deep.eq([false, false]);
    });
    it('should chain destruction', () => {
      store.getValue(ref)[1].subscription?.unsubscribe();
      expect([jsonWrp.destroyed, jsonWrp.destroyed]).deep.eq([true, true]);
      //jsonObs = store.getValue()
    });
  });
  describe('Double dimension destructable', () => {
    it('should go to the correct depth', async () => {
      const handlers = RequestHandlers;
      jsonObs = new Destructable(handlers, 'Json', null, { args: [] as [], data: { msg: 'hi' }, n: 1 });
      const { ref: rf, subscription } = await store.push(jsonObs);
      const [ref] = store.unserialize<0, [[any[], ArrayCim2]], [ArrayTypeKeys2], [[[json]]], [2]>([{
        c: null, i: 0, type: 'Array2', data: [[rf]]
      }])!;
      subscription.unsubscribe();
      const obs: Observable<[[json]]> = store.getValue(ref)[0];
      expect(current(obs)).deep.eq([[{ msg: 'hi' }]]);
    })
  })
});
