import { expect } from 'chai';
import { Store } from '../source/store';
import { JsonCim, JsonTypeKeys, ArrayTypeKeys, ArrayCim, JsonHandler, F_Ref, F_Destructable, F_ID, F_C } from '../source/handlers';
import { TestScheduler } from 'rxjs/testing';
import {
  Destructable, AppX, ObsWithOrigin, CtxH, Ref, EHConstraint, DeepDestructable, TypedDestructable,
  DestructableCtr, wrapJson, ArrayHandler, wrapArray, JsonDestructable, ArrayDestructable, JsonObject, ArrKeys, EntryObs, TwoDestructable
} from '../source';
import { Subscription, ObservedValueOf, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { current } from '../utils/rx-utils';
import { App, DepConstaint, Fun, map as dep_map, TypeFuncs } from 'dependent-type';
import _ from 'lodash';
import { keys } from '../utils/guards';

const { depMap } = dep_map;

type ToRef1<C> = Ref<C[keyof C & number]>[] & { [P in Exclude<keyof C, keyof any[]>]: Ref<C[P] & C[keyof C & number]> }
type ToRef2<C> = Ref<C[keyof C & number][keyof C[keyof C & number] & number]>[][] & {
  [P in Exclude<keyof C, keyof any[]>]: ToRef1<C[P]>; };
declare const F_Destructable2: unique symbol;
declare const F_ArrArgs2: unique symbol;
declare const F_Ref2: unique symbol;
declare module 'dependent-type' {
  export interface TypeFuncs<C, X> {
    [F_Destructable2]: DeepDestructable<C[0 & keyof C][X & Exclude<keyof C[0 & keyof C], ArrKeys>] & C[0 & keyof C][keyof C[0 & keyof C] & number] & unknown[], 1, C[1 & keyof C], C[2 & keyof C]>,
    [F_ArrArgs2]: ToRef2<X>,
    [F_Ref2]: Ref<C[keyof C & number][keyof C[keyof C & number] & number]>[] & ToRef1<C[X & keyof C]>,
  }
}
type ArrayTypeKeys2 = {
  T: typeof F_ArrArgs2;
  V: typeof F_ID;
  C: typeof F_C;
  D: typeof F_C;
  A: typeof F_ID;
}
type ArrayCim2 = { T: [never, Ref<any>[][]], V: [never, unknown[]], C: [null, null], D: [null, null], A: [never, unknown[][]] };

const ArrayHandler2 = <EH extends EHConstraint<EH, ECtx>, ECtx>(): CtxH<unknown[][], ArrayCim2, ArrayTypeKeys2, 2, EH, ECtx> => ({
  //decosde: ({ deref }) => (_id, data) => ({ args: data.map(refs => refs.map(ref => deref(ref))) as any, data: null, n: 2 }),
  decode: ({ deref }) => <C extends unknown[][]>(_id: string, data: AppX<'T', ArrayCim2, ArrayTypeKeys2, C>) => {
    type dom = Exclude<keyof C, keyof any[]>;
    type cim = [
      [C, unknown],
      [[C, EH, ECtx], DeepDestructable<C[number] & unknown[], 1, EH, ECtx>],
    ];
    type k = [typeof F_Ref2, typeof F_Destructable2];
    const mapper = <X extends dom>(refs: AppX<0, cim, k, X>, i: number): TwoDestructable<C[X & Exclude<keyof C, ArrKeys>] & C[number] & unknown[], EH, ECtx> => {
      type CX = C[X & Exclude<keyof C, ArrKeys>] & C[number] & unknown[];
      type dom2 = Exclude<keyof CX, keyof any[]>;
      type cim2 = [[CX, unknown], [[CX, EH, ECtx], ObsWithOrigin<CX[number], EH, ECtx>]];
      type k2 = [F_Ref, F_Destructable];
      type out = ObsWithOrigin<CX[number], EH, ECtx>[] & {
        [k in dom2]: ObsWithOrigin<CX[k] & CX[number], EH, ECtx>;
      };
      return depMap<dom2, cim2, k2>(refs, ref => deref(ref)) as out;
    };
    const args: DeepDestructable<C[number] & unknown[], 1, EH, ECtx>[] & {
      [k in dom]: DeepDestructable<C[k] & unknown[], 1, EH, ECtx>;
    } = depMap<dom, cim, k>(data, mapper);
    return { args, data: null, n: 2 };
  },
  encode: ({ ref }) => <C extends unknown[][]>({ args }: { args: DeepDestructable<AppX<'A', ArrayCim2, ArrayTypeKeys2, C>, 2, EH, ECtx> }): ToRef2<C> => {
    type dom = Exclude<keyof C, keyof any[]>;
    type cim = [
      [[C, EH, ECtx], unknown],
      [C, Ref<C[number][number]>[]]
    ];
    type k = [typeof F_Destructable2, typeof F_Ref2];
    const mapper = <X extends dom>(arg: AppX<0, cim, k, X>
    ): AppX<1, cim, k, X> => {
      type dom2 = Exclude<keyof C[X], keyof any[]>;
      const item: { [P in dom2]: Ref<C[X][P & Exclude<keyof C[X], keyof any[]>] & C[X][number & keyof C[X]]> } & Ref<C[X][keyof C[X] & number]>[] = depMap<
        dom2, [
          [[C[X], EH, ECtx], unknown],
          [C[X], Ref<C[X][keyof C[X] & number]>]
        ], [typeof F_Destructable, typeof F_Ref]>(arg, ref);
      return item;
    }
    return depMap<dom, cim, k>(args, mapper);
  },
  ctr: <X extends unknown[]>(x: X, _d: null, _c: null, old: any[] | null) => {
    if (old) { old.splice(0); x = Object.assign(old, x); }
    return x;
  },
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
  const store = new Store<RH, {}, never, {}, {}>(keys<RH>(RequestHandlers), { someData: 1 }, Promise)
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
    const getHandler = keys(RequestHandlers);
    const newArray = wrapArray<RH, {}>(getHandler);
    const newJson = wrapJson<RH, {}>(getHandler);

    let subs: Subscription;
    it('should chain insertion', async () => {
      jsonObs = newJson({ msg: 'hi' });
      const jsonRes = store.push(jsonObs);
      jsonWrp = jsonRes.wrapped;
      const subs0 = jsonRes.subscription;
      expect(jsonWrp).not.eq(jsonObs);
      expect(jsonWrp.origin).eq(jsonObs);
      expect([...(store['map']['byId']).keys()]).deep.eq(['3']);
      arr1Obs = newArray([jsonObs, jsonObs, jsonObs]);
      arr2Obs = newArray([arr1Obs, jsonObs]);
      const arrRes = store.push(arr2Obs);
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
      const getHandler = keys(RequestHandlers);
      jsonObs = new Destructable(getHandler, 'Json', null, { args: [] as [], data: { msg: 'hi' }, n: 1 });
      const { ref: rf, subscription } = await store.push(jsonObs);
      debugger;
      const [ref] = store.unserialize<0, [[any[], ArrayCim2]], [ArrayTypeKeys2], [[[json]]], [2]>([{
        c: null, i: 0, type: 'Array2', data: [[rf]]
      }])!;
      subscription.unsubscribe();
      const obs: Observable<[[json]]> = store.getValue(ref)[0];
      expect(current(obs)).deep.eq([[{ msg: 'hi' }]]);
    })
  })
});
