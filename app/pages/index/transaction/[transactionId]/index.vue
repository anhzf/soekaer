<script lang="ts">
import { DISPLAY_TRANSACTION_STATUSES } from '@anhzf-soekaer/shared';
import { TRANSACTION_STATUSES, Transaction, TransactionStatus } from '@anhzf-soekaer/shared/models';
import '@material/web/button/elevated-button';
import '@material/web/button/filled-button';
import '@material/web/button/filled-tonal-button';
import '@material/web/button/outlined-button';
import '@material/web/button/text-button';
import '@material/web/chips/assist-chip';
import { MdDialog } from '@material/web/dialog/dialog';
import '@material/web/menu/menu';
import '@material/web/radio/radio';
import '@material/web/textfield/outlined-text-field';
import { Timestamp, doc } from 'firebase/firestore';
import { nanoid } from 'nanoid';

const SEND_INVOICE_URL = 'https://api.whatsapp.com/send?phone={{phoneNumber}}&text={{message}}';

const MESSAGE_TEMPLATE = `Halo Kak {{customerName}},

Berikut invoice order Anda:

Tanggal: {{createdAt}}
Estimasi selesai: {{estimatedFinishedAt}}
Link invoice: {{invoiceUrl}}

Nama Barang & Layanan
____________

{{items}}
____________

*TOTAL: {{totalPrice}}*

*LUNAS*

Terima kasih telah mempercayakan barang kesayangannya dengan layanan kami.

Jangan lupa untuk mengambil totebag/tas anda bila anda menitipkanya kepada kami. 😁🙏

Instagram: @soekaer.uns
Hp: 081392363385
Cuci & Beli Sepatu
SOEKAER UNS`;

const TRANSACTION_STATUS_ICONS: Record<TransactionStatus, string> = {
  pending: 'clock_loader_10',
  wip: 'clock_loader_40',
  'task-done': 'check',
  paid: 'paid',
  delivered: 'package',
  done: 'check_all',
  canceled: 'close',
}

const replaceVars = (template: string, deps: Record<string, unknown>) => Object.entries(deps)
  .reduce((acc, [key, value]) => acc.replace(new RegExp(`{{${key}}}`, 'g'), value as string), template);

const fmtDateTime = (date: Date) => date.toLocaleString('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZoneName: 'short',
});

const fmtDate = (date: Date) => date.toLocaleDateString('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const fmtTime = (date: Date) => date.toLocaleTimeString('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZoneName: 'short',
});

const fmtCurrency = (amount: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumSignificantDigits: 3,
}).format(amount);

const hidePhoneNumberText = (phoneNumber: string) => phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3');
</script>

<script lang="ts" setup>
const url = useRequestURL();
const router = useRouter();

const transaction = ref<Transaction>(new Transaction({
  customer: {
    ref: doc(refs().customers, '1'),
    snapshot: {
      name: 'Zakky Zuhad',
      whatsAppNumber: '6281326230183',
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
}, { id: nanoid() }));

const urlToCopy = computed(() => {
  const { href } = router.resolve({
    name: router.currentRoute.value.name!,
    params: router.currentRoute.value.params,
    query: {
      ref: 'link_copy',
    },
  });
  return new URL(href, url.origin).href;
});
const { copy: _copy } = useClipboard({ source: urlToCopy });
const copy = async () => {
  await _copy();
  window.alert('Link invoice berhasil disalin!');
}

const sendInvoiceUrl = computed(() => {
  const source = transaction.value.data;
  const deps = {
    customerName: source.customer.snapshot.name,
    phoneNumber: source.customer.snapshot.whatsAppNumber,
    totalPrice: transaction.value.totalPrice,
    createdAt: fmtDateTime(source.createdAt.toDate()),
    estimatedFinishedAt: source.estimatedFinishedAt ? fmtDateTime(source.estimatedFinishedAt.toDate()) : '-',
    items: source.items.map(({ name, qty, price }) => `${name} (${qty}x) = ${fmtCurrency(price)}`).join('\n'),
    invoiceUrl: urlToCopy.value,
  };

  return replaceVars(SEND_INVOICE_URL, {
    ...deps,
    message: encodeURIComponent(replaceVars(MESSAGE_TEMPLATE, deps)),
  });
});

const updateStatusField = ref<TransactionStatus>('wip');

const [hidePhoneNumber, toggleHidePhoneNumber] = useToggle(true);
const [isImageDialogOpen] = useToggle();
const [isUpdateStatusDialogOpen] = useToggle();

const onUpdateStatusDialogClose = (ev: Event) => {
  isUpdateStatusDialogOpen.value = false;
  console.log((ev.target as MdDialog)?.returnValue);
}

useSeoMeta({
  title: 'Detail Transaksi',
});
</script>

<template>
  <app-page v-bind="{
    title: 'Detail Transaksi',
    backBtn: true,
    trailingBtn: {
      label: 'Selesaikan transaksi',
      component: 'md-elevated-button',
      icon: 'navigate_next',
      iconTrailing: true,
      to: { name: 'index-transaction-transactionId-finish' },
    }
  }">
    <main class="flex flex-col">
      <section class="surface on-surface-text p-4 rounded-$md-sys-shape-corner-medium">
        <div class="flex flex-col gap-8">
          <div class="self-center w-full max-w-prose flex flex-col gap-8">
            <table
              class="border-separate border-spacing-y-2 children:children:h-10 children:children:p-0 children:children:children:h-inherit children:last:children:h-12 children:last:children:border-t children:last:children:border-$md-sys-color-outline children:last:children:pt-2">
              <tr>
                <th class="text-label-large on-surface-variant-text text-left font-semibold">ID</th>
                <td class="text-label-large secondary-text text-right">
                  {{ transaction.id }}
                </td>
              </tr>
              <tr>
                <th class="text-label-large on-surface-text text-left font-semibold">Status</th>
                <td>
                  <div class="flex justify-end items-center gap-2">
                    <md-assist-chip :label="DISPLAY_TRANSACTION_STATUSES[transaction.data.status]"
                      @click="isUpdateStatusDialogOpen = true">
                      <md-icon slot="icon">
                        {{ TRANSACTION_STATUS_ICONS[transaction.data.status] }}
                      </md-icon>
                    </md-assist-chip>
                  </div>
                </td>
              </tr>
              <tr>
                <th class="text-label-large on-surface-text text-left font-semibold">Nama Pelanggan</th>
                <td class="text-label-large primary-text text-right">
                  {{ transaction.data.customer.snapshot.name }}
                </td>
              </tr>
              <tr>
                <th class="text-label-large on-surface-text text-left font-semibold">Tanggal</th>
                <td class="text-label-large primary-text text-right">
                  {{ fmtDate(transaction.data.createdAt.toDate()) }}
                </td>
              </tr>
              <tr>
                <th class="text-label-large on-surface-text text-left font-semibold">Waktu</th>
                <td class="text-label-large primary-text text-right">
                  {{ fmtTime(transaction.data.createdAt.toDate()) }}
                </td>
              </tr>
              <tr>
                <th class="text-label-large on-surface-text text-left font-semibold">No. WhatsApp</th>
                <td>
                  <div class="flex justify-end items-center gap-2">
                    <span class="text-label-large primary-text">
                      {{ hidePhoneNumber ? hidePhoneNumberText(transaction.data.customer.snapshot.whatsAppNumber) :
                        transaction.data.customer.snapshot.whatsAppNumber }}
                    </span>
                    <md-icon-button @click="toggleHidePhoneNumber()">
                      <md-icon>{{ hidePhoneNumber ? 'visibility' : 'visibility_off' }}</md-icon>
                    </md-icon-button>
                  </div>
                </td>
              </tr>
              <tr>
                <th class="text-label-large on-surface-text text-left font-semibold">Instansi</th>
                <td class="text-label-large primary-text text-right">{{ transaction.data.customer.snapshot.origin || '-'
                }}
                </td>
              </tr>
              <tr>
                <th class="text-label-large on-surface-text text-left font-semibold">Jumlah Pasang Sepatu</th>
                <td class="text-label-large primary-text text-right">{{ transaction.itemCount }}</td>
              </tr>
              <tr>
                <th class="text-label-large on-surface-text text-left font-semibold">Jenis Cuci</th>
                <td class="text-label-large primary-text text-right">{{ transaction.services.join(', ') }}</td>
              </tr>
              <tr>
                <th class="text-label-large on-surface-text text-left font-semibold">Foto Sepatu</th>
                <td>
                  <div class="flex justify-end items-center gap-2">
                    <md-filled-tonal-button @click="isImageDialogOpen = true;">
                      <md-icon slot="icon">visibility</md-icon>
                      Lihat
                    </md-filled-tonal-button>
                  </div>
                </td>
              </tr>
              <tr>
                <th class="text-label-large on-surface-text text-left align-top font-semibold">Total Tagihan</th>
                <td class="text-display-small secondary-text text-right">{{ fmtCurrency(transaction.totalPrice) }}</td>
              </tr>
            </table>

            <p class="text-body-small on-surface-variant-text text-center italic">
              Terakhir diperbarui: <time>{{ fmtDateTime(transaction.data.updatedAt.toDate()) }}</time>
            </p>
          </div>
        </div>
      </section>

      <hr class="divider mt-12" />

      <div class="mt-4 flex flex-col sm:flex-row gap-4">
        <NuxtLink :to="{ name: 'index-transaction' }" custom v-slot="{ href, navigate, ...nuxtLinkBindings }">
          <md-text-button :href="href" class="grow" @click="navigate" v-bind="nuxtLinkBindings">
            Kembali ke beranda
            <md-icon slot="icon">home</md-icon>
          </md-text-button>
        </NuxtLink>

        <md-outlined-button class="grow" @click="copy">
          Salin link invoice
          <md-icon slot="icon">link</md-icon>
        </md-outlined-button>

        <NuxtLink :to="sendInvoiceUrl" external target="_blank" custom v-slot="{ href, navigate, ...nuxtLinkBindings }">
          <md-filled-button :href="href" class="grow" @click="navigate" v-bind="nuxtLinkBindings">
            Kirim invoice ke pelanggan
            <md-icon slot="icon">share</md-icon>
          </md-filled-button>
        </NuxtLink>
      </div>
    </main>

    <md-dialog :open="isImageDialogOpen" @opened="isImageDialogOpen = true" @closed="isImageDialogOpen = false">
      <div slot="headline">Foto Sepatu</div>
      <div slot="content" class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <p class="text-label-medium">Before:</p>
          <img src="https://picsum.photos/500/500" alt="before" class="aspect-4/3 rounded-$md-sys-shape-corner-large">
        </div>

        <hr class="divider" />

        <div class="flex flex-col gap-2">
          <p class="text-label-medium">After:</p>
          <img src="https://picsum.photos/500/500" alt="before" class="aspect-4/3 rounded-$md-sys-shape-corner-large">
        </div>
      </div>
      <div slot="actions">
        <md-text-button @click="isImageDialogOpen = false;">Tutup</md-text-button>
      </div>
    </md-dialog>

    <md-dialog :open="isUpdateStatusDialogOpen" @opened="isUpdateStatusDialogOpen = true"
      @closed="onUpdateStatusDialogClose">
      <div slot="headline">Perbarui Status</div>
      <form slot="content" id="transactionUpdateStatusForm" method="dialog">
        <template v-for="status in TRANSACTION_STATUSES" :key="status">
          <field-wrapper v-model="updateStatusField" event-name="change" v-slot="{ value, ...bindings }">
            <label class="flex items-center">
              <md-radio name="transaction-updateStatus" :value="status" :checked="status === value" :aria-label="status"
                touch-target="wrapper" v-bind="bindings"></md-radio>
              <span aria-hidden="true">{{ status }}</span>
            </label>
          </field-wrapper>
        </template>
      </form>

      <div slot="actions">
        <md-text-button form="transactionUpdateStatusForm" value="cancel">Batalkan</md-text-button>
        <md-text-button form="transactionUpdateStatusForm" :value="updateStatusField">Simpan</md-text-button>
      </div>
    </md-dialog>
  </app-page>
</template>
