import { Json, msg1to2, msg2to1 } from "../source";

export type msg = ['1->2', number, msg1to2, Json] | ['2->1', number, msg2to1, Json];
export type MsgGenerator = Generator<msg, void, msg>;

export const start = <G extends Generator>(fct: () => G): G => {
  const gen = fct();
  gen.next();
  return gen;
}

export const parallel = <K extends keyof any>(selector: (msg: msg) => K, gens: Record<K, MsgGenerator>): MsgGenerator => {
  return start(function* (): MsgGenerator {
    let msg = yield null!;
    while (msg) {
      const key = selector(msg);
      const res = gens[key].next(msg);
      if (res.done) {
        debugger;
        throw { message: 'Unexpected message', msg };
      }
      msg = yield res.value;
    }
    for (const key of Object.keys(gens) as K[]) yield* gens[key];
  });
};
