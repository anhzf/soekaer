import { PickRequired } from '../utils/type';
import { adapter, now } from './_adapter';
import { DateTime, RawReference, Reference } from './common';
import { Customer, ICustomer } from './customer';
import { Model } from './model';
import { IUser, User } from './user';

export const TRANSACTION_STATUSES = [
  'pending',
  'wip',
  'task-done',
  'delivered',
  'done',
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

export type TransactionStatus = typeof TRANSACTION_STATUSES[number];

export interface ITransaction {
  customer: {
    ref: Reference<Customer>;
    snapshot: PickRequired<ICustomer, 'name' | 'whatsAppNumber'>;
  };
  status: TransactionStatus;
  items: TransactionItem[];
  estimatedFinishedAt?: DateTime;
  discount?: {
    name: string;
    labels?: string[];
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
    snapshot: PickRequired<IUser, 'name'>;
  };
  note?: string;
  createdAt: DateTime;
  createdBy: {
    ref: Reference<User>;
    snapshot: PickRequired<IUser, 'name'>;
  };
  updatedAt: DateTime;
}

export interface ITransactionCreate extends Pick<ITransaction, 'items'> {
  customer: {
    ref: RawReference<Customer>;
    snapshot: PickRequired<ICustomer, 'name' | 'whatsAppNumber'>;
  };
  createdBy: {
    ref: RawReference<User>;
    snapshot: PickRequired<IUser, 'name'>;
  }
}

export class Transaction extends Model<ITransaction> {
  static create(data: ITransactionCreate) {
    return new Transaction({
      customer: {
        ref: adapter.toReference(data.customer.ref.path),
        snapshot: data.customer.snapshot,
      },
      createdBy: {
        ref: adapter.toReference(data.createdBy.ref.path),
        snapshot: data.createdBy.snapshot,
      },
      items: data.items,
      status: 'pending',
      createdAt: now(),
      updatedAt: now(),
    });
  }

  get itemCount() {
    return this.data.items.reduce((acc, item) => acc + item.qty, 0);
  }

  get services() {
    return this.data.items.reduce((acc, item) => [...acc, item.name], [] as string[]);
  }

  get totalPrice() {
    const subtotal = this.data.items.reduce((acc, item) => acc + item.price * item.qty, 0);
    const discount = this.data.discount?.amountValue
      || (this.data.discount?.percentageValue ?? 0) * subtotal;

    return subtotal - discount;
  }

  flatten() {
    return {
      id: this.id,
      status: this.data.status,
      itemCount: this.itemCount,
      totalPrice: this.totalPrice,
      estimatedFinishedAt: this.data.estimatedFinishedAt && adapter.dateTimeToDate(this.data.estimatedFinishedAt).toISOString(),
      paidAmount: this.data.paidAmount,
      paymentMethod: this.data.paymentMethod,
      note: this.data.note,
      createdAt: adapter.dateTimeToDate(this.data.createdAt).toISOString(),
      updatedAt: adapter.dateTimeToDate(this.data.updatedAt).toISOString(),
      customerId: this.data.customer.ref.path,
      customerName: this.data.customer.snapshot.name,
      customerWhatsAppNumber: this.data.customer.snapshot.whatsAppNumber,
      createdById: this.data.createdBy.ref.path,
      createdByName: this.data.createdBy.snapshot.name,
      receiverId: this.data.receiver?.ref.path,
      receiverName: this.data.receiver?.snapshot.name,
      discountName: this.data.discount?.name,
      discountLabels: this.data.discount?.labels,
      discountAmountValue: this.data.discount?.amountValue,
      discountPercentageValue: this.data.discount?.percentageValue,
      itemNames: this.data.items.map((item) => item.name).join(','),
      itemPrices: this.data.items.map((item) => item.price).join(','),
      itemQtys: this.data.items.map((item) => item.qty).join(','),
      itemNotes: this.data.items.map((item) => item.note).join(','),
      itemTypes: this.data.items.map((item) => item.type).join(','),
      itemImageIns: this.data.items.map((item) => item.imageIn).join(','),
      itemImageOuts: this.data.items.map((item) => item.imageOut).join(','),
    };
  }
}
