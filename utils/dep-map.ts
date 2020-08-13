import { keytype, AppX, DepConstaint } from "./dependent-type";

type Pair = 0 | 1;
export const depMap = <dom extends number, cim extends Record<Pair, [any, any]>, k extends DepConstaint<Pair, dom, cim>>(arr: cim[0][1][], p: <X extends dom>(a: AppX<0, cim, k, X>, i: number) => AppX<1, cim, k, X>) => {
  const r: cim[1][1][] = [];
  arr.forEach((v, i) => r[i] = p(v, i));
  return r as cim[1][1][] & { [X in dom]: AppX<1, cim, k, X> };
};
