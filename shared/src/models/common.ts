export interface HasId {
  id: string;
}

export interface Reference<T extends Record<string, any> = Record<string, any>> extends HasId {
  path: string;
}

export interface DateTime {
  seconds: number;
  nanoseconds: number;
}

export interface Person {
  name: string;
}

export interface Addresses {
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
}
