import { expect } from 'chai';
import { Store } from '../source/store';
import { JsonCim, JsonTypeKeys, JsonObject, ArrayTypeKeys, ArrayCim, JsonCtr, ArrayCtr } from '../source/handlers';
import { TestScheduler } from 'rxjs/testing';
import { Destructable, RequestHandlers, RH, ModelsDefinition, AppX, ObsWithOrigin, EModelsDefinition } from '../source';
import { Subscription, ObservedValueOf } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { current } from '../utils/rx-utils';


const testScheduler = new TestScheduler((actual, expected) => {
  expect(actual).deep.equal(expected);
});


describe('Store', () => {
  const store = new Store(RequestHandlers, { someData: 1 })
  describe('first entry', () => {
    const init = () => {
      const [x1] = store.unserialize<0, [[JsonObject, JsonCim]], [JsonTypeKeys], [{ x: number }]>([{
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
      store.unserialize<0, [[JsonObject, JsonCim]], [JsonTypeKeys], [{ x: number }]>([{
        type: 'Json', data: { x: 2 }, c: null, i: 0, reuseId: '1', isNew: false
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
      const [x2, arr] = store.unserialize<0 | 1, [[JsonObject, JsonCim], [any[], ArrayCim]], [JsonTypeKeys, ArrayTypeKeys], [{ x: number }, [{ x: number }]]>(ref => [{
        type: 'Json', data: { x: 2 }, c: null, i: 0, isNew: true, reuseId: '1'
      }, {
        type: 'Array', data: [ref(0)], c: null, isNew: true, i: 1,
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
  let jsonObs: Destructable<JsonObject, JsonCim, JsonTypeKeys, json, RH, {}>;
  let arr1Obs: Destructable<any[], ArrayCim, ArrayTypeKeys, [json, json, json], RH, {}>;
  let arr2Obs: Destructable<any[], ArrayCim, ArrayTypeKeys, [[json, json, json], json], RH, {}>;
  let jsonWrp: ObsWithOrigin<AppX<'V', JsonCim, JsonTypeKeys, json>, RH, {}>;
  let arrWrp: ObsWithOrigin<AppX<'V', ArrayCim, ArrayTypeKeys, [[json, json, json], json]>, RH, {}>;
  let originSubs: Subscription;
  describe('push method', () => {
    const handlers = RequestHandlers;
    let subs: Subscription;
    it('should chain insertion', () => {
      jsonObs = new Destructable(handlers, 'Json', null, { args: [] as [], data: { msg: 'hi' } });
      jsonWrp = store.push(jsonObs).wrapped;
      expect(jsonWrp).not.eq(jsonObs);
      expect(jsonWrp.origin).eq(jsonObs);
      const subs0 = jsonWrp.subscribe();
      expect([...(store['map']['byId']).keys()]).deep.eq(['3']);
      arr1Obs = new Destructable(handlers, 'Array', null, { data: null, args: [jsonObs, jsonObs, jsonObs] });
      arr2Obs = new Destructable(handlers, 'Array', null, { data: null, args: [arr1Obs, jsonObs] as [typeof arr1Obs, typeof jsonObs] })
      const arrRes = store.push(arr2Obs);
      arrWrp = arrRes.wrapped;
      expect(arrWrp).not.eq(arr2Obs);
      expect(arrWrp.origin).eq(arr2Obs);
      subs = arrRes.wrapped.subscribe();
      subs0.unsubscribe();
      expect([...(store['map']['byId']).keys()]).deep.eq(['3', '4', '5']);
    });
    it('should chain only destruction of wrappers', async () => {
      originSubs = arr2Obs.subscribe();
      subs.unsubscribe();
      expect([...(store['map']['byId']).keys()]).deep.eq([]);
      expect([jsonObs.destroyed, arr1Obs.destroyed, arr2Obs.destroyed]).deep.eq([false, false, false]);
      expect([jsonWrp.destroyed, arrWrp.destroyed]).deep.eq([true, true]);
    });
  });
  describe('serialize method', () => {
    const serialize = () => store.serialize(arr2Obs);
    let def: ObservedValueOf<ReturnType<typeof serialize>>;
    it('should recursively encode dependencies', async () => {
      def = await serialize().pipe(take(1)).toPromise();
      const jsonRef = { '$': 2 };
      expect(def).deep.eq([{
        i: 0, type: 'Array', c: null, reuseId: '4', data: [{ '$': 1 }, jsonRef],
      }, {
        i: 1, type: 'Array', c: null, reuseId: '5', data: [jsonRef, jsonRef, jsonRef], isNew: false
      }, {
        i: 2, type: 'Json', c: null, reuseId: '3', data: { msg: 'hi' }, isNew: false
      }]);
    });
    const unserialize = () => store.unserialize<0, [[any[], ArrayCim]], [ArrayTypeKeys], [[[json, json, json], json]]>(def)!;
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
      jsonWrp = arrWrp.origin.subject.value.args[1];
      expect([jsonWrp.destroyed, jsonWrp.destroyed]).deep.eq([false, false]);
    });
    it('should chain destruction', () => {
      store.getValue(ref)[1].subscription?.unsubscribe();
      expect([jsonWrp.destroyed, jsonWrp.destroyed]).deep.eq([true, true]);
      //jsonObs = store.getValue()
    });
  });
});
