<script lang="ts">
import { DISPLAY_TRANSACTION_STATUSES } from '@anhzf-soekaer/shared';
import '@material/web/checkbox/checkbox';
import '@material/web/chips/chip-set';
import '@material/web/chips/filter-chip';
import '@material/web/iconbutton/icon-button';
import { Timestamp, query, where } from 'firebase/firestore';
</script>

<script lang="ts" setup>
const { data: appSettings } = await useAppSettings();

const { data: transactions, pending: isTransactionsPending } = useCollection(refs().transactions);
// today is counted from 00:00:00
const { data: todayTransactions, pending: isTodayTransactionsPending } = useCollection(query(refs().transactions,
  where('createdAt', '>', Timestamp.fromMillis(new Date().setHours(0, 0, 0, 0))),
));
const { data: todayNewCustomers, pending: isTodayNewCustomersPending } = useCollection(query(
  refs().customers,
  where('createdAt', '>', Timestamp.fromMillis(new Date().setHours(0, 0, 0, 0))),
));

const { data: weeklyTransactions, pending: isWeeklyTransactionsPending } = useCollection(
  query(refs().transactions,
    where('createdAt', '>', Timestamp.fromMillis(new Date().setDate(new Date().getDate() - 7))),
  ));

const todayStats = computed(() => ({
  totalTransactions: todayTransactions.value.length,
  totalValue: todayTransactions.value.reduce((acc, transaction) => acc + transaction.totalPrice, 0),
  totalItems: todayTransactions.value.reduce((acc, transaction) => acc + transaction.data.items.length, 0),
  totalFinished: todayTransactions.value.filter(transaction => transaction.data.status === 'done').length,
  totalNewCustomers: todayNewCustomers.value.length,
  mostPopularItem: todayTransactions.value
    .map(transaction => transaction.data.items[0])
    .reduce((acc, item) => {
      if (acc.name === item.name) {
        acc.count += item.qty;
      } else {
        acc = { name: item.name, count: 1 };
      }
      return acc;
    }, { name: '-', count: 0 }),
}));

const weeklyPopularItems = computed(() => Object.entries(weeklyTransactions.value
  .map(transaction => transaction.data.items[0])
  .reduce((acc, item) => {
    if (acc[item.name]) {
      acc[item.name] += item.qty;
    } else {
      acc[item.name] = item.qty;
    }
    return acc;
  }, {} as Record<string, number>))
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([name, count]) => ({ name, count, displayName: appSettings.value!.products[name]?.displayName ?? name }))
);

const filteredSortedTransactions = computed(() => transactions.value
  // .filter(transaction => (['pending', 'wip', 'task-done'] as TransactionStatus[]).includes(transaction.get('status')))
  .sort((a, b) => b.get('createdAt').toMillis() - a.get('createdAt').toMillis()));

const onDownloadCsvClick = () => {
  const DELIMITER = ';';
  const flattened = transactions.value.map(t => t.flatten());
  const headers = Object.keys(flattened[0]) as (keyof typeof flattened[0])[];
  const csv = [
    headers.join(DELIMITER),
    ...flattened.map((t) => headers.map((h) => (typeof t[h] === 'number' ? t[h] : `"${t[h] ?? ''}"`)).join(DELIMITER)),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });

  window.open(URL.createObjectURL(blob), '_blank');
}

useSeoMeta({
  title: 'Transaksi',
});
</script>

<template>
  <app-page v-bind="{
    title: 'Transaksi',
    menuBtn: true,
    trailingBtn: {
      label: 'Transaksi baru',
      to: { name: 'index-transaction-new' },
      icon: 'add',
    },
  }">
    <main class="flex flex-col gap-6">
      <div class="flex items-start gap-4 flex-wrap">
        <section class="grow relative surface min-w-sm flex flex-col gap-4 p-4 rounded-$md-sys-shape-corner-medium">
          <md-elevation style="--md-elevation-level: 1;" />
          <h2 class="text-label-small on-surface-variant-text">HARI INI</h2>

          <div v-if="isTodayTransactionsPending || isTodayNewCustomersPending" class="flex justify-center">
            <md-circular-progress indeterminate />
          </div>

          <table v-else-if="todayTransactions && todayNewCustomers">
            <tr>
              <th class="w-40 text-left text-label-medium">
                <div class="flex justify-between items-center">
                  <span>Total transaksi</span>
                  <span>:</span>
                </div>
              </th>
              <td class="text-body-medium primary-text">{{ todayStats.totalTransactions }}</td>
            </tr>

            <tr>
              <th class="w-40 text-left text-label-medium">
                <div class="flex justify-between items-center">
                  <span>Total nilai transaksi</span>
                  <span>:</span>
                </div>
              </th>
              <td class="text-body-medium primary-text">{{ fmtCurrency(todayStats.totalValue) }}</td>
            </tr>

            <tr>
              <th class="w-40 text-left text-label-medium">
                <div class="flex justify-between items-center">
                  <span>Jumlah barang</span>
                  <span>:</span>
                </div>
              </th>
              <td class="text-body-medium primary-text">{{ todayStats.totalItems }}</td>
            </tr>

            <tr>
              <th class="w-40 text-left text-label-medium">
                <div class="flex justify-between items-center">
                  <span>Transaksi terselesaikan</span>
                  <span>:</span>
                </div>
              </th>
              <td class="text-body-medium primary-text">{{ todayStats.totalFinished }}</td>
            </tr>

            <tr>
              <th class="w-40 text-left text-label-medium">
                <div class="flex justify-between items-center">
                  <span>Pelanggan baru</span>
                  <span>:</span>
                </div>
              </th>
              <td class="text-body-medium primary-text">{{ todayStats.totalNewCustomers }}</td>
            </tr>

            <tr>
              <th class="w-40 text-left text-label-medium">
                <div class="flex justify-between items-center">
                  <span>Barang terpopuler</span>
                  <span>:</span>
                </div>
              </th>
              <td class="text-body-medium primary-text">{{ displayItemName(todayStats.mostPopularItem.name) }}</td>
            </tr>
          </table>
        </section>

        <section class="grow relative surface min-w-sm flex flex-col gap-4 p-4 rounded-$md-sys-shape-corner-medium">
          <md-elevation style="--md-elevation-level: 1;" />
          <h2 class="text-label-small on-surface-variant-text">LAYANAN TERATAS PEKAN INI</h2>

          <div v-if="isWeeklyTransactionsPending" class="flex justify-center">
            <md-circular-progress indeterminate />
          </div>

          <ol v-else-if="weeklyPopularItems.length" class="flex flex-col">
            <li v-if="weeklyPopularItems.at(0)" class="flex">
              <span class="grow text-ellipsis line-clamp-1 text-display-large tertiary-text">
                {{ weeklyPopularItems.at(0)?.displayName }}
              </span>
              <span class="text-label-medium on-surface-text">
                {{ weeklyPopularItems.at(0)?.count }}
              </span>
            </li>
            <li v-if="weeklyPopularItems.at(1)" class="flex">
              <span class="grow text-ellipsis line-clamp-1 text-display-medium secondary-text">
                {{ weeklyPopularItems.at(1)?.displayName }}
              </span>
              <span class="text-label-medium on-surface-text">
                {{ weeklyPopularItems.at(1)?.count }}
              </span>
            </li>
            <li v-if="weeklyPopularItems.at(2)" class="flex">
              <span class="grow text-ellipsis line-clamp-1 text-display-small on-surface-variant-text">
                {{ weeklyPopularItems.at(2)?.displayName }}
              </span>
              <span class="text-label-medium on-surface-text">
                {{ weeklyPopularItems.at(2)?.count }}
              </span>
            </li>
            <li v-if="weeklyPopularItems.at(3)" class="flex">
              <span class="grow text-ellipsis line-clamp-1 text-body-medium on-surface-variant-text">
                {{ weeklyPopularItems.at(3)?.displayName }}
              </span>
              <span class="text-label-medium on-surface-text">
                {{ weeklyPopularItems.at(3)?.count }}
              </span>
            </li>
            <li v-if="weeklyPopularItems.at(4)" class="flex">
              <span class="grow text-ellipsis line-clamp-1 text-body-small on-surface-variant-text">
                {{ weeklyPopularItems.at(4)?.displayName }}
              </span>
              <span class="text-label-medium on-surface-text">
                {{ weeklyPopularItems.at(4)?.count }}
              </span>
            </li>
          </ol>

          <span v-else class="text-body-medium on-surface-variant-text text-center">Tidak ada data yang ditampilkan</span>
        </section>
      </div>

      <hr class="divider" />

      <section class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <h2 class="text-title-large">Daftar transaksi</h2>
            <div class="grow"></div>
            <md-text-button @click="onDownloadCsvClick">
              <md-icon slot="icon">download</md-icon>
              Unduh CSV
            </md-text-button>
          </div>

          <!-- <md-chip-set type="filter">
            <md-filter-chip label="status: Belum selesai" selected></md-filter-chip>
          </md-chip-set> -->
        </div>

        <table class="surface on-surface-text rounded-$md-sys-shape-corner-medium">
          <thead class="border-b border-$md-sys-color-outline">
            <tr class="text-label-medium font-semibold">
              <th class="px-4 py-3 text-left">Waktu</th>
              <th class="px-4 py-3 text-left">Nama Pelanggan</th>
              <th class="px-4 py-3 text-left">Nama Barang</th>
              <th class="px-4 py-3 ">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isTransactionsPending">
              <td colspan="4" class="text-center py-3">
                <md-circular-progress indeterminate />
              </td>
            </tr>

            <template v-else-if="filteredSortedTransactions.length">
              <tr v-for="transaction in filteredSortedTransactions" :key="transaction.id"
                class="relative group text-body-medium">
                <td class="px-4 py-3 w-50 text-left text-body-small on-surface-variant-text">
                  {{ displayTransactionTime(transaction.data.createdAt.toDate()) }}
                </td>
                <td class="px-4 py-3">{{ transaction.data.customer.snapshot.name }}</td>
                <td class="px-4 py-3 text-left">{{ displayItemName(transaction.data.items[0].name) }}</td>
                <td class="px-4 py-3 w-40">
                  <div class="flex justify-center gap-2">
                    <span
                      class="relative text-label-medium line-clamp-1 flex items-center gap-2 px-3 py-1 rounded-$md-sys-shape-corner-small border border-$md-sys-color-outline-variant cursor-default">
                      {{ DISPLAY_TRANSACTION_STATUSES[transaction.data.status] }}
                    </span>
                  </div>
                </td>
                <NuxtLink :to="{ name: 'index-transaction-transactionId', params: { transactionId: transaction.id } }"
                  class="absolute inset-0" />
                <md-ripple />
              </tr>
            </template>

            <tr v-else>
              <td colspan="4" class="text-body-medium text-center py-3">Tidak ada data yang ditampilkan</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </app-page>
</template>
