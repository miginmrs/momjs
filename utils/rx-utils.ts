import { combineLatest, of } from "rxjs";

export const combine: typeof combineLatest = function(this: any, ...args: any[]) {
  if(args.length === 0 || args.length === 1 && args[0] instanceof Array && args[0].length === 0) return of([]);
  return combineLatest.apply(this, args);
} as any;