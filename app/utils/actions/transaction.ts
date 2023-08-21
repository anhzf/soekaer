import { Transaction } from '@anhzf-soekaer/shared/models';
import { addDoc, doc, getDoc } from 'firebase/firestore';

interface TransactionActionsGet {
  (id: string): Promise<Transaction | undefined>;
}

interface TransactionActionsCreate {
  (transaction: Transaction): Promise<Transaction>;
}

const get: TransactionActionsGet = async (id) => {
  const ref = doc(refs().transactions, id);
  const snapshot = await getDoc(ref);
  return snapshot.data();
}

const create: TransactionActionsCreate = async (transaction) => {
  const ref = await addDoc(refs().transactions, transaction);
  return new Transaction(transaction.data, { id: ref.id });
}

export const transactionActions = {
  get,
  create,
};
