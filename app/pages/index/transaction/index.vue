<script lang="ts">
import { Transaction, TransactionStatus, TRANSACTION_STATUSES } from '@anhzf-soekaer/shared/models';
import '@material/web/checkbox/checkbox';
import '@material/web/chips/chip-set';
import '@material/web/chips/filter-chip';
import '@material/web/iconbutton/icon-button';
import { UseTimeAgoMessages, UseTimeAgoUnitNamesDefault, formatTimeAgo } from '@vueuse/core';
import { Timestamp, doc } from 'firebase/firestore';

const timeAgoMessages: UseTimeAgoMessages<UseTimeAgoUnitNamesDefault> = {
  justNow: 'baru saja',
  past: n => n.match(/\d/) ? `${n} lalu` : n,
  future: n => n.match(/\d/) ? `dalam ${n}` : n,
  month: (n, past) => n === 1
    ? past
      ? 'bulan kemarin'
      : 'bulan besok'
    : `${n} bulan`,
  year: (n, past) => n === 1
    ? past
      ? 'tahun kemarin'
      : 'tahun besok'
    : `${n} tahun`,
  day: (n, past) => n === 1
    ? past
      ? 'kemarin'
      : 'besok'
    : `${n} hari`,
  week: (n, past) => n === 1
    ? past
      ? 'pekan kemarin'
      : 'pekan besok'
    : `${n} pekan`,
  hour: n => `${n} jam`,
  minute: n => `${n} menit`,
  second: n => `${n} detik`,
  invalid: '',
}

const displayTransactionTime = (date: Date) => {
  // if up to a week then display using formatTimeAgo, then display using localeDateString
  if (date > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)) {
    return formatTimeAgo(date, { messages: timeAgoMessages });
  } else {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
}
</script>

<script lang="ts" setup>
const transactions = ref(Array.from({ length: 50 }, (_, k) => new Transaction({
  customer: {
    ref: doc(refs().customers, '1'),
    snapshot: {
      name: 'Zakky Zuhad',
      whatsAppNumber: '6281234567890',
    },
  },
  status: TRANSACTION_STATUSES.at(Math.random() * TRANSACTION_STATUSES.length)!,
  items: [
    {
      name: 'Fast Clean',
      price: 25000,
      qty: 1,
    },
  ],
  createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 14)),
  createdBy: {
    ref: doc(refs().users, '1'),
    snapshot: {
      name: 'Rayyan Nur',
    },
  },
  updatedAt: Timestamp.fromDate(new Date()),
}, { id: k.toString() })));

const filteredSortedTransactions = computed(() => transactions.value
  .filter(transaction => (['pending', 'wip', 'task-done'] as TransactionStatus[]).includes(transaction.get('status')))
  .sort((a, b) => b.get('createdAt').toMillis() - a.get('createdAt').toMillis()));

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

          <table>
            <tr>
              <th class="w-40 text-left text-label-medium">
                <div class="flex justify-between items-center">
                  <span>Total transaksi</span>
                  <span>:</span>
                </div>
              </th>
              <td class="text-body-medium primary-text">24</td>
            </tr>
            <tr>
              <th class="w-40 text-left text-label-medium">
                <div class="flex justify-between items-center">
                  <span>Total nilai transaksi</span>
                  <span>:</span>
                </div>
              </th>
              <td class="text-body-medium primary-text">Rp 825.000,00</td>
            </tr>
            <tr>
              <th class="w-40 text-left text-label-medium">
                <div class="flex justify-between items-center">
                  <span>Jumlah barang</span>
                  <span>:</span>
                </div>
              </th>
              <td class="text-body-medium primary-text">28</td>
            </tr>
            <tr>
              <th class="w-40 text-left text-label-medium">
                <div class="flex justify-between items-center">
                  <span>Transaksi terselesaikan</span>
                  <span>:</span>
                </div>
              </th>
              <td class="text-body-medium primary-text">17</td>
            </tr>
            <tr>
              <th class="w-40 text-left text-label-medium">
                <div class="flex justify-between items-center">
                  <span>Pelanggan baru</span>
                  <span>:</span>
                </div>
              </th>
              <td class="text-body-medium primary-text">4</td>
            </tr>
            <tr>
              <th class="w-40 text-left text-label-medium">
                <div class="flex justify-between items-center">
                  <span>Barang terpopuler</span>
                  <span>:</span>
                </div>
              </th>
              <td class="text-body-medium primary-text">Fast Clean</td>
            </tr>
          </table>
        </section>

        <section class="grow relative surface min-w-sm flex flex-col gap-4 p-4 rounded-$md-sys-shape-corner-medium">
          <md-elevation style="--md-elevation-level: 1;" />
          <h2 class="text-label-small on-surface-variant-text">LAYANAN TERATAS PEKAN INI</h2>

          <ol class="flex flex-col">
            <li class="flex">
              <span class="grow text-ellipsis line-clamp-1 text-display-large tertiary-text">Fast Clean</span>
              <span class="text-label-medium on-surface-text">59</span>
            </li>
            <li class="flex">
              <span class="grow text-ellipsis line-clamp-1 text-display-medium secondary-text">Deep Clean White</span>
              <span class="text-label-medium on-surface-text">34</span>
            </li>
            <li class="flex">
              <span class="grow text-ellipsis line-clamp-1 text-display-small on-surface-variant-text">Women Shoes</span>
              <span class="text-label-medium on-surface-text">21</span>
            </li>
            <li class="flex">
              <span class="grow text-ellipsis line-clamp-1 text-body-medium on-surface-variant-text">Sandal</span>
              <span class="text-label-medium on-surface-text">12</span>
            </li>
            <li class="flex">
              <span class="grow text-ellipsis line-clamp-1 text-body-small on-surface-variant-text">Lainnya</span>
              <span class="text-label-medium on-surface-text">3</span>
            </li>
          </ol>
        </section>
      </div>

      <hr class="divider" />

      <section class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <h2 class="text-title-large">Daftar transaksi</h2>
            <md-icon-button>
              <md-icon>tune</md-icon>
            </md-icon-button>
          </div>

          <md-chip-set type="filter">
            <md-filter-chip label="status: Belum selesai" selected></md-filter-chip>
          </md-chip-set>
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
            <tr v-for="transaction in filteredSortedTransactions" :key="transaction.id"
              class="relative group text-body-medium">
              <td class="px-4 py-3 w-50 text-left text-body-small on-surface-variant-text">
                {{ displayTransactionTime(transaction.get('createdAt').toDate()) }}
              </td>
              <td class="px-4 py-3">{{ transaction.get('customer').snapshot.name }}</td>
              <td class="px-4 py-3 text-left">{{ transaction.get('items')[0].name }}</td>
              <td class="px-4 py-3 w-40">
                <div class="flex justify-center gap-2">
                  <span
                    class="relative text-label-medium line-clamp-1 flex items-center gap-2 px-3 py-1 rounded-$md-sys-shape-corner-small border border-$md-sys-color-outline-variant cursor-default">
                    {{ transaction.get('status') }}
                  </span>
                </div>
              </td>
              <NuxtLink :to="{ name: 'index-transaction-transactionId', params: { transactionId: transaction.id } }"
                class="absolute inset-0"></NuxtLink>
              <md-ripple />
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </app-page>
</template>
