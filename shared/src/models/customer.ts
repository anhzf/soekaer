import { now } from './_adapter';
import { DateTime, Person } from './common';
import { Model } from './model';

export interface ICustomer extends Person {
  whatsAppNumber: string;
  origin?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export class Customer extends Model<ICustomer> {
  static DEFAULT_ORIGIN = 'independent';

  static create(data: Pick<ICustomer, 'name' | 'origin' | 'whatsAppNumber'>) {
    return new Customer({
      ...data,
      createdAt: now(),
      updatedAt: now(),
    });
  }

  static empty() {
    return Customer.create({
      name: '',
      whatsAppNumber: '',
      origin: Customer.DEFAULT_ORIGIN,
    }).data;
  }
}
