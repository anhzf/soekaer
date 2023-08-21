import { Customer } from '@anhzf-soekaer/shared/models';
import { addDoc, doc, getDoc } from 'firebase/firestore';

interface CustomerActionsGet {
  (id: string): Promise<Customer | undefined>;
}

interface CustomerActionsCreate {
  (customer: Customer): Promise<Customer>;
}

const get: CustomerActionsGet = async (id) => {
  const ref = doc(refs().customers, id);
  const snapshot = await getDoc(ref);
  return snapshot.data();
}

const create: CustomerActionsCreate = async (customer) => {
  const ref = await addDoc(refs().customers, customer);
  return new Customer(customer.data, { id: ref.id });
}

export const customerActions = {
  get,
  create,
};
