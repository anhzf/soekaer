import { PaymentMethod, TransactionStatus } from './models';

export const DISPLAY_TRANSACTION_STATUSES: Record<TransactionStatus, string> = {
  pending: 'Dalam antrian',
  wip: 'Sedang dikerjakan',
  'task-done': 'Sudah dikerjakan',
  paid: 'Sudah dibayar',
  delivered: 'Sudah diambil',
  done: 'Selesai',
  canceled: 'Dibatalkan',
};

export const DISPLAY_PAYMENT_METHODS: Record<PaymentMethod, string> = {
  cash: 'Tunai',
  qris: 'QRIS',
  bank_transfer: 'Transfer Bank',
};
