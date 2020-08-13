export type KeysOfTypeObj<O, T> = {
  [K in keyof O]: [O[K]] extends [T] ? K : never
};
export type RequiredKeysNot<O, T> = {
  [K in keyof O]: O[K] extends T ? never : undefined extends O[K] ? never : K
};
export type OptionalKeysNot<O, T> = {
  [K in keyof O]: O[K] extends T ? never : undefined extends O[K] ? K : never
};
export type KeysNot<O, T> =
  {
    [K in Exclude<RequiredKeysNot<O, T>[keyof O], undefined>]: O[K]
  } & {
    [K in Exclude<OptionalKeysNot<O, T>[keyof O], undefined>]?: O[K]
  };

export type KeysOfType<O, T> = KeysOfTypeObj<O,T>[keyof O]
