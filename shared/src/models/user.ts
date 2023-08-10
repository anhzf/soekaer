import { now } from './_adapter';
import { DateTime, Person } from './common';
import { Model } from './model';

export interface IUser extends Person {
  createdAt: DateTime;
  updatedAt: DateTime;
}

export class User extends Model<IUser> {
  static create(data: Pick<IUser, 'name'>) {
    return new User({
      ...data,
      createdAt: now(),
      updatedAt: now(),
    });
  }

  static empty() {
    return User.create({
      name: '',
    }).data;
  }
}