import { TransactionStatus } from '@anhzf-soekaer/shared/models';

export const TRANSACTION_STATUS_ICONS: Record<TransactionStatus, string> = {
  pending: 'clock_loader_10',
  wip: 'clock_loader_40',
  delivered: 'package',
  done: 'check_all',
  canceled: 'close',
}
