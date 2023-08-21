import { DateTime, Reference } from './common';

interface AdapterOptions {
  dateTimeFromDate: (date: Date) => DateTime;
  dateTimeToDate: (dateTime: DateTime) => Date;
  toReference: <T extends Record<string, any> = Record<string, any>>(path: string) => Reference<T>;
}

export const adapter: AdapterOptions = {
  dateTimeFromDate: (date: Date) => {
    throw new Error('dateTimeFromDate not initialized');
  },
  dateTimeToDate: (dateTime: DateTime) => {
    throw new Error('dateTimeToDate not initialized');
  },
  toReference: (path: string) => {
    throw new Error('toReference not initialized');
  },
};

export const now = () => adapter.dateTimeFromDate(new Date());

export const setAdapter = (options: AdapterOptions) => {
  Object.assign(adapter, options);
}
