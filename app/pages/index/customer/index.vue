<script lang="ts" setup>
import { query } from 'firebase/firestore';

const { data: customers, pending: isCustomersPending } = useCollection(query(refs().customers));

useSeoMeta({
  title: 'Daftar Pelanggan',
});
</script>

<template>
  <app-page v-bind="{
    title: 'Daftar Pelanggan',
    menuBtn: true,
  }">
    <main class="flex flex-col gap-6">
      <section class="flex flex-col gap-4">
        <table class="surface on-surface-text rounded-$md-sys-shape-corner-medium">
          <thead class="border-b border-$md-sys-color-outline">
            <tr class="text-label-medium font-semibold">
              <th class="px-4 py-3 text-left">Nama Pelanggan</th>
              <th class="px-4 py-3 text-left">Instansi</th>
              <th class="px-4 py-3 text-left">Nomor WhatsApp</th>
              <th class="px-4 py-3 text-left">Transaksi Terakhir</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isCustomersPending">
              <td colspan="4" class="text-center py-3">
                <md-circular-progress indeterminate />
              </td>
            </tr>

            <template v-else-if="customers.length">
              <tr v-for="customer in customers" :key="customer.id" class="relative group text-body-medium">
                <td class="px-4 py-3">{{ customer.data.name }}</td>
                <td class="px-4 py-3 text-left">{{ customer.data.origin }}</td>
                <td class="px-4 py-3 text-left">{{ customer.data.whatsAppNumber }}</td>
                <td class="px-4 py-3 text-left">-</td>
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
