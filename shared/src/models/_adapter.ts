import { DateTime } from './common';

interface AdapterOptions {
  dateTimeFromDate: (date: Date) => DateTime;
  dateTimeToDate: (dateTime: DateTime) => Date;
}

export const adapter: AdapterOptions = {
  dateTimeFromDate: (date: Date) => {
    throw new Error('dateTimeFromDate not initialized');
  },
  dateTimeToDate: (dateTime: DateTime) => {
    throw new Error('dateTimeToDate not initialized');
  },
};

export const now = () => adapter.dateTimeFromDate(new Date());

export const setAdapter = (options: AdapterOptions) => {
  Object.assign(adapter, options);
}