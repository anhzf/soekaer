import { formatDate } from '@vueuse/core';

export const fmtDateTime = (date: Date) => date.toLocaleString('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZoneName: 'short',
});

export const fmtDate = (date: Date) => date.toLocaleDateString('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export const fmtDateShort = (date: Date) => date.toLocaleDateString('id-ID', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const fmtTime = (date: Date) => date.toLocaleTimeString('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZoneName: 'short',
});

export const fmtDateToInput = (date: Date) => formatDate(date, 'YYYY-MM-DDTHH:mm');

export const fmtCurrency = (amount: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumSignificantDigits: 3,
}).format(amount);

