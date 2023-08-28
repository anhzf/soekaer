<script lang="ts">
import { DISPLAY_TRANSACTION_STATUSES } from '@anhzf-soekaer/shared';
import { TransactionStatus } from '@anhzf-soekaer/shared/models';
import '@material/web/button/elevated-button';
import '@material/web/button/filled-button';
import '@material/web/button/filled-tonal-button';
import '@material/web/button/outlined-button';
import '@material/web/button/text-button';
import '@material/web/chips/assist-chip';
import '@material/web/dialog/dialog';
import { MdDialog } from '@material/web/dialog/dialog';
import '@material/web/menu/menu';
import '@material/web/radio/radio';
import '@material/web/textfield/outlined-text-field';
import { Timestamp, doc, updateDoc } from 'firebase/firestore';
import { ref as storageRef } from 'firebase/storage';
import { useFirebaseStorage, useStorageFileUrl } from 'vuefire';

const SEND_INVOICE_URL = 'https://api.whatsapp.com/send?phone={{phoneNumber}}&text={{message}}';


const ALLOWED_UPDATE_STATUSES: TransactionStatus[] = ['pending', 'wip', 'delivered', 'canceled'];

const replaceVars = (template: string, deps: Record<string, unknown>) => Object.entries(deps)
  .reduce((acc, [key, value]) => acc.replace(new RegExp(`{{${key}}}`, 'g'), value as string), template);

export const useTransaction = () => {
  const route = useRoute();

  const docRef = doc(refs().transactions, String(route.params.transactionId));
  const useDocumentReturn = useDocument(docRef);

  return Object.assign(useDocumentReturn, { docRef });
}
</script>

<script lang="ts" setup>
const user = useCurrentUser();

const storageBucket = useFirebaseStorage();

const url = useRequestURL();
const router = useRouter();

const { data: appSettings } = await useAppSettings();

const { data: transaction, docRef, pending: isLoading } = await useTransaction();

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

const newStatus = ref(transaction.value?.data.status);
syncRefs(() => transaction.value?.data.status, newStatus);

const imgInRef = computed(() => transaction.value?.data.items[0].imageIn ? storageRef(storageBucket, transaction.value?.data.items[0].imageIn) : null);
const imgOutRef = computed(() => transaction.value?.data.items[0].imageOut ? storageRef(storageBucket, transaction.value?.data.items[0].imageOut) : null);

const { url: imgInUrl } = useStorageFileUrl(imgInRef);
const { url: imgOutUrl } = useStorageFileUrl(imgOutRef);

const sendInvoiceUrl = computed(() => {
  if (!transaction.value) return 'Required data was not loaded yet';

  const source = transaction.value.data;
  const deps = {
    customerName: source.customer.snapshot.name,
    phoneNumber: source.customer.snapshot.whatsAppNumber,
    totalPrice: transaction.value.totalPrice,
    createdAt: fmtDateTime(source.createdAt.toDate()),
    estimatedFinishedAt: source.estimatedFinishedAt ? fmtDateTime(source.estimatedFinishedAt.toDate()) : '-',
    items: source.items.map(({ name, qty, price }) => `${displayItemName(name)} (${qty}x) = ${fmtCurrency(price)}`).join('\n'),
    invoiceUrl: urlToCopy.value,
  };

  return replaceVars(SEND_INVOICE_URL, {
    ...deps,
    message: encodeURIComponent(replaceVars(appSettings.value?.invoiceMessageTemplate || '', deps)),
  });
});

const { share: _share } = useShare();
const share = () => {
  if (!transaction.value) return window.alert('Required data was not loaded yet. Please try again later.');

  const source = transaction.value.data;
  const deps = {
    customerName: source.customer.snapshot.name,
    phoneNumber: source.customer.snapshot.whatsAppNumber,
    totalPrice: transaction.value.totalPrice,
    createdAt: fmtDateTime(source.createdAt.toDate()),
    estimatedFinishedAt: source.estimatedFinishedAt ? fmtDateTime(source.estimatedFinishedAt.toDate()) : '-',
    items: source.items.map(({ name, qty, price }) => `${displayItemName(name)} (${qty}x) = ${fmtCurrency(price)}`).join('\n'),
    invoiceUrl: urlToCopy.value,
  };

  _share({ text: replaceVars(appSettings.value?.invoiceMessageTemplate || '', deps) })
}

const [hidePhoneNumber, toggleHidePhoneNumber] = useToggle(true);
const [isImageDialogOpen] = useToggle();
const [isUpdateStatusDialogOpen] = useToggle();

const isEditable = computed(() => !isLoading.value
  && !!user.value
  && ALLOWED_UPDATE_STATUSES.includes(transaction.value?.data.status || 'wip'));

const onUpdateStatusDialogClose = async (ev: Event) => {
  isUpdateStatusDialogOpen.value = false;

  const { returnValue } = (ev.target as MdDialog)!;

  console.log(returnValue);

  if (returnValue === 'ok') {
    if (newStatus.value !== transaction.value?.data.status) {
      await updateDoc(docRef,
        'status', newStatus.value,
        'updatedAt', Timestamp.now(),
      );

      window.alert('Status berhasil diperbarui!');
    }
  } else {
    newStatus.value = transaction.value?.data.status;
  }
}

useSeoMeta({
  title: 'Detail Transaksi',
});

definePageMeta({
  skipAuth: true,
});
</script>

<template>
  <app-page v-bind="{
    title: 'Detail Transaksi',
    backBtn: !!user,
    trailingBtn: isEditable ? {
      label: 'Selesaikan transaksi',
      component: 'md-elevated-button',
      icon: 'navigate_next',
      iconTrailing: true,
      to: { name: 'index-transaction-transactionId-finish' },
    } : undefined,
  }">
    <main class="flex flex-col">
      <section class="surface on-surface-text p-4 rounded-$md-sys-shape-corner-medium">
        <div v-if="transaction" class="flex flex-col gap-8">
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
                    <md-assist-chip
                      :label="DISPLAY_TRANSACTION_STATUSES[transaction.data.status] || transaction.data.status"
                      @click="isEditable && (isUpdateStatusDialogOpen = true)">
                      <md-icon slot="icon">
                        {{ TRANSACTION_STATUS_ICONS[transaction.data.status] || 'circle' }}
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
                <td class="text-label-large primary-text text-right">
                  {{ transaction.services.map(displayItemName).join(', ') }}
                </td>
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

        <div v-else-if="isLoading" class="h-40 flex justify-center items-center">
          <md-circular-progress indeterminate />
        </div>

        <div v-else>
          <p class="text-body-medium on-surface-variant-text text-center">Transaksi tidak ditemukan</p>
        </div>
      </section>

      <hr class="divider mt-12" />

      <div class="mt-4 flex flex-col sm:flex-row gap-4">
        <NuxtLink v-if="user" :to="{ name: 'index-transaction' }" custom v-slot="{ href, navigate, ...nuxtLinkBindings }">
          <md-text-button :href="href" class="grow" @click="navigate" v-bind="nuxtLinkBindings">
            Kembali ke beranda
            <md-icon slot="icon">home</md-icon>
          </md-text-button>
        </NuxtLink>

        <md-outlined-button type="button" class="grow" @click="copy">
          Salin link invoice
          <md-icon slot="icon">link</md-icon>
        </md-outlined-button>

        <NuxtLink v-if="user" :to="sendInvoiceUrl" external target="_blank" custom
          v-slot="{ href, navigate, ...nuxtLinkBindings }">
          <md-filled-button :href="href" class="grow" :disabled="!appSettings?.invoiceMessageTemplate" @click="navigate"
            v-bind="nuxtLinkBindings">
            Kirim invoice ke pelanggan
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>whatsapp</title>
              <path
                d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 14C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.5 11.15 9.61 11 9.73 10.89C9.84 10.78 10 10.6 10.1 10.45C10.23 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.61C10.27 9.5 9.77 8.26 9.56 7.77C9.36 7.29 9.16 7.35 9 7.34C8.86 7.34 8.7 7.33 8.53 7.33Z" />
            </svg>
          </md-filled-button>
        </NuxtLink>

        <md-filled-button class="grow" :disabled="!appSettings?.invoiceMessageTemplate" @click="share">
          Bagikan invoice
          <md-icon slot="icon">share</md-icon>
        </md-filled-button>
      </div>
    </main>

    <md-dialog :open="isImageDialogOpen" @opened="isImageDialogOpen = true" @closed="isImageDialogOpen = false">
      <div slot="headline">Foto Sepatu</div>
      <div slot="content" class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <p class="text-label-medium">Before:</p>
          <img :src="imgInUrl || 'https://placehold.co/400x300?text=Tidak+ada+gambar'" alt="before"
            class="aspect-4/3 object-cover rounded-$md-sys-shape-corner-large">
        </div>

        <div class="flex flex-col gap-2">
          <p class="text-label-medium">After:</p>
          <img :src="imgOutUrl || 'https://placehold.co/400x300?text=Tidak+ada+gambar'" alt="before"
            class="aspect-4/3 object-cover rounded-$md-sys-shape-corner-large">
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
        <template v-for="status in ALLOWED_UPDATE_STATUSES" :key="status">
          <field-wrapper v-model="newStatus" event-name="change" v-slot="{ value, ...bindings }">
            <label class="flex items-center">
              <md-radio name="transaction-updateStatus" :value="status" :checked="status === value"
                :aria-label="DISPLAY_TRANSACTION_STATUSES[status]" touch-target="wrapper" v-bind="bindings" />
              <span aria-hidden="true">{{ DISPLAY_TRANSACTION_STATUSES[status] }}</span>
            </label>
          </field-wrapper>
        </template>
      </form>

      <div slot="actions">
        <md-text-button form="transactionUpdateStatusForm" :value.attr="'cancel'">Batalkan</md-text-button>
        <md-text-button form="transactionUpdateStatusForm" :value.attr="'ok'">Simpan</md-text-button>
      </div>
    </md-dialog>
  </app-page>
</template>
