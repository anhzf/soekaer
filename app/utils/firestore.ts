import { documentPaths } from '@anhzf-soekaer/shared';
import { Customer, IAppSettings, ICustomer, ITransaction, IUser, Transaction, User } from '@anhzf-soekaer/shared/models';
import { CollectionReference, DocumentReference, QueryDocumentSnapshot, doc } from 'firebase/firestore';

export const refs = (db = useFirestore()) => ({
  users: doc(db, documentPaths.users).parent.withConverter({
    fromFirestore: (snapshot: QueryDocumentSnapshot<IUser>) => new User(snapshot.data(), { id: snapshot.id }),
    toFirestore: (user) => user.data!,
  }) as CollectionReference<User>,

  customers: doc(db, documentPaths.customers).parent.withConverter({
    fromFirestore: (snapshot: QueryDocumentSnapshot<ICustomer>) => new Customer(snapshot.data(), { id: snapshot.id }),
    toFirestore: (user) => user.data!,
  }) as CollectionReference<Customer>,

  transactions: doc(db, documentPaths.transactions).parent.withConverter({
    fromFirestore: (snapshot: QueryDocumentSnapshot<ITransaction>) => new Transaction(snapshot.data(), { id: snapshot.id }),
    toFirestore: (user) => user.data!,
  }) as CollectionReference<Transaction>,

  appSettings: doc(db, documentPaths.appSettings) as DocumentReference<IAppSettings>,
});
