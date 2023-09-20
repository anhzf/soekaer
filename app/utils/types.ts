export type Mutable<T> = T extends Readonly<infer U> ? U : T;
