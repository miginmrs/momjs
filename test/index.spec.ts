import { expect } from 'chai';
import { Store } from '../source/store';
import { JsonCim, JsonTypeKeys, JsonObject, ArrayTypeKeys, ArrayCim, JsonCtr, ArrayCtr } from '../source/handlers';
import { TestScheduler } from 'rxjs/testing';
import { Destructable, RequestHandlers, RH, ModelsDefinition, AppX, ObsWithOrigin } from '../source';
import { Subscription } from 'rxjs';


const testScheduler = new TestScheduler((actual, expected) => {
  expect(actual).deep.equal(expected);
});


describe('Store', () => {
  const store = new Store(RequestHandlers, {})
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
      store.getValue(x1)[1]!.unsubscribe();
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
      store.getValue(x2)[1]!.unsubscribe();
      const obs = store.getValue(arr)[0];
      expect(obs.destroyed).equals(false);
    });
    it('should chain destruction', () => {
      store.getValue(arr)[1]!.unsubscribe();
      expect(store.get(x2.id)).equals(undefined);
      expect(store.get(arr.id)).equals(undefined);
    });
  });
  describe('push', () => {
    const handlers = RequestHandlers;
    let subs: Subscription;
    type json = { msg: string };
    let json: Destructable<JsonObject, JsonCim, JsonTypeKeys, json, RH, {}>;
    let jsonLink:ObsWithOrigin<AppX<'V', JsonCim, JsonTypeKeys, json>, RH, {}>;
    let arr1: Destructable<any[], ArrayCim, ArrayTypeKeys, [json, json, json], RH, {}>;
    let arr2: Destructable<any[], ArrayCim, ArrayTypeKeys, [[json, json, json], json], RH, {}>;
    let arrLink: ObsWithOrigin<AppX<'V', ArrayCim, ArrayTypeKeys, [[json, json, json], json]>, RH, {}>;
    it('should chain insertion', () => {
      json = new Destructable(handlers, 'Json', null, { args: [] as [], data: { msg: 'hi' } });
      jsonLink = store.push(json).link;
      expect(jsonLink).not.eq(json);
      expect(jsonLink.origin).eq(json);
      const subs0 = jsonLink.subscribe();
      expect([...(store['map']['byId']).keys()]).deep.eq(['3']);
      arr1 = new Destructable( handlers, 'Array', null, { data: null, args: [json, json, json] });
      arr2 = new Destructable(handlers, 'Array', null, { data: null, args: [arr1, json] as [typeof arr1, typeof json] })
      const arrRes = store.push(arr2);
      arrLink = arrRes.link;
      expect(arrLink).not.eq(arr2);
      expect(arrLink.origin).eq(arr2);
      subs = arrRes.link.subscribe();
      subs0.unsubscribe();
      expect([...(store['map']['byId']).keys()]).deep.eq(['3', '4', '5']);
    });
    it('should chain destruction', () => {
      const originSubs = arr2.subscribe();
      subs.unsubscribe();
      expect([...(store['map']['byId']).keys()]).deep.eq([]);
      expect([json.destroyed, arr1.destroyed, arr2.destroyed]).deep.eq([false, false, false]);
      expect([jsonLink.destroyed, arrLink.destroyed]).deep.eq([true, true]);
    });
  });
});
