import { now } from './_adapter';
import { DateTime, Reference } from './common';
import { Customer, ICustomer } from './customer';
import { Model } from './model';
import { IUser, User } from './user';

export const TransactionStatuses = [
  'pending',
  'wip',
  'done',
  'paid',
  'delivered',
  'canceled',
] as const;

export const PAYMENT_METHODS = [
  'cash',
  'bank_transfer',
  'qris',
] as const;

export interface TransactionItem {
  name: string;
  price: number;
  qty: number;
  note?: string;
  type?: string;
  imageIn?: string;
  imageOut?: string;
}

export type PaymentMethod = typeof PAYMENT_METHODS[number];

export type TransactionStatus = typeof TransactionStatuses[number];

export interface ITransaction {
  customer: {
    ref?: Reference<Customer>;
    snapshot: Pick<ICustomer, 'name' | 'whatsAppNumber'> & Partial<ICustomer>;
  };
  status: TransactionStatus;
  items: TransactionItem[];
  discount?: {
    labels: string[];
    amountValue?: number;
    /**
     * 0 - 1
     */
    percentageValue?: number;
  };
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  receiver?: {
    ref: Reference<User>;
    snapshot: Pick<IUser, 'name'> & Partial<IUser>;
  };
  note?: string;
  createdAt: DateTime;
  createdBy: {
    ref: Reference<User>;
    snapshot: Pick<IUser, 'name'> & Partial<IUser>;
  };
  updatedAt: DateTime;
}

export class Transaction extends Model<ITransaction> {
  static create(data: Pick<ITransaction, 'customer' | 'items' | 'createdBy'>) {
    return new Transaction({
      ...data,
      status: 'pending',
      createdAt: now(),
      updatedAt: now(),
    });
  }
}
