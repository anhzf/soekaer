import { ROOT_COLLECTION_PREFIX } from './constants';

export const documentPaths = {
  users: `${ROOT_COLLECTION_PREFIX}users/{user}` as const,

  customers: `${ROOT_COLLECTION_PREFIX}customers/{customer}` as const,

  transactions: `${ROOT_COLLECTION_PREFIX}transactions/{transaction}` as const,

  appSettings: `${ROOT_COLLECTION_PREFIX}app/appSettings` as const,
};
