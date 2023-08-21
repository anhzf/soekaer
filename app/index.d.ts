import { DocumentReference, Timestamp } from 'firebase/firestore';

declare module '#app' {
  interface PageMeta {
    skipAuth?: true;
  }
}

declare module '@anhzf-soekaer/shared/models' {
  export interface Reference extends DocumentReference {
    //
  }

  export interface DateTime extends Timestamp {
    //
  }
}

// It is always important to ensure you import/export something when augmenting a type
export { }
