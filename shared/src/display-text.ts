import { PaymentMethod, TransactionStatus } from './models';

export const DISPLAY_TRANSACTION_STATUSES: Record<TransactionStatus, string> = {
  pending: 'Dalam antrian',
  wip: 'Sedang dikerjakan',
  done: 'Sudah dikerjakan',
  delivered: 'Sudah diambil',
  canceled: 'Dibatalkan',
};

export const DISPLAY_PAYMENT_METHODS: Record<PaymentMethod, string> = {
  cash: 'Tunai',
  qris: 'QRIS',
  bank_transfer: 'Transfer Bank',
};
