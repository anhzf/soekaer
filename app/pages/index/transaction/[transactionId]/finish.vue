<script lang="ts">
import { PaymentMethod } from '@anhzf-soekaer/shared/models';
import { PAYMENT_METHODS } from '@anhzf-soekaer/shared/models';
import { MdMenu } from '@material/web/menu/menu';
import '@material/web/menu/menu';
import '@material/web/menu/menu-item';
import '@material/web/button/outlined-button';
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field';
import '@material/web/textfield/outlined-text-field';
import { useTransaction } from './index.vue';
import { Timestamp, doc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes } from 'firebase/storage';
import { useFirebaseStorage } from 'vuefire';
</script>

<script lang="ts" setup>
const paymentMethodSelectionRef = ref<MdMenu>();

const user = useCurrentUser();

const { data: transaction, docRef, pending: isTransactionPending } = await useTransaction();

const isLoading = ref(false);

const fieldDefault = computed(() => ({
  paymentMethod: 'cash',
  image: null as File | null,
}));

const field = ref(fieldDefault.value);

syncRefs(fieldDefault, field);

const imgSrcUrl = useObjectUrl(() => field.value.image);

const uploadImage = (file: File) => {
  const fileRef = storageRef(useFirebaseStorage(), `/transactions/items/${Date.now()}_${file.name}`)
  return uploadBytes(fileRef, file);
}

const onPaymentMethodSelect = (method: PaymentMethod) => {
  field.value.paymentMethod = method;
}

const onSubmit = async () => {
  if (window.confirm('Apakah Anda yakin ingin menyelesaikan transaksi ini?') === false) return;

  isLoading.value = true;

  try {
    const uploadedImg = field.value.image ? await uploadImage(field.value.image) : null;

    await updateDoc(docRef,
      'paymentMethod', field.value.paymentMethod,
      'status', 'done',
      'paidAmount', transaction.value?.billedAmount,
      'paidAt', Timestamp.now(),
      'isPaid', true,
      'items', [{
        ...transaction.value?.data.items[0],
        imageOut: uploadedImg?.ref.toString() || transaction.value?.data.items[0].imageOut,
      }],
      'receiver', {
      ref: doc(refs().users, user.value!.uid),
      snapshot: {
        name: user.value!.displayName || 'No Name',
      },
    },
      'updatedAt', Timestamp.now(),
    );

    navigateTo({ name: 'index-transaction' });
    window.alert('Transaksi berhasil diselesaikan');
  } finally {
    isLoading.value = false;
  }
}

useSeoMeta({
  title: 'Selesaikan Transaksi',
});
</script>

<template>
  <app-page v-bind="{
    title: 'Selesaikan Transaksi',
    backBtn: true,
    trailingBtn: {
      label: 'Simpan',
      type: 'submit',
      icon: 'save',
      form: `finishTransaction-${transaction?.id}`,
    },
  }">
    <main class="relative flex flex-col">
      <section class="surface on-surface-text p-4 rounded-$md-sys-shape-corner-medium">
        <div v-if="transaction && !isTransactionPending" class="flex flex-col gap-8">
          <div
            class="self-center w-full max-w-prose flex flex-col gap-8 border border-$md-sys-color-outline-variant p-3 rounded-$md-sys-shape-corner-medium">
            <table class="children:children:h-10 children:children:p-0 children:children:children:h-inherit">
              <tr>
                <th class="text-label-large on-surface-text text-left font-semibold">Nama Pelanggan</th>
                <td class="text-label-large primary-text text-right">
                  {{ transaction.data.customer.snapshot.name }}
                </td>
              </tr>
              <tr>
                <th class="text-label-large on-surface-text text-left font-semibold">Tanggal dan Waktu</th>
                <td class="text-label-large primary-text text-right">
                  {{ fmtDateTime(transaction.data.createdAt.toDate()) }}
                </td>
              </tr>
              <tr>
                <th class="text-label-large on-surface-text text-left font-semibold">Pembelian</th>
                <td class="text-label-large primary-text text-right">
                  {{ transaction.data.items.map(({ name, qty }) => `${displayItemName(name)} (${qty}x)`).join(', ') }}
                </td>
              </tr>
              <tr>
                <th class="text-label-large on-surface-text text-left font-semibold">Total</th>
                <td class="text-label-large primary-text text-right">
                  {{ fmtCurrency(transaction.totalPrice) }}
                </td>
              </tr>
              <tr v-if="transaction.data.discount?.amountValue">
                <th class="text-label-large on-surface-text text-left font-semibold">Diskon</th>
                <td class="text-label-large primary-text text-right">
                  -{{ fmtCurrency(transaction.data.discount.amountValue) }}
                </td>
              </tr>
              <tr v-if="transaction.data.discount?.percentageValue">
                <th class="text-label-large on-surface-text text-left font-semibold">Diskon</th>
                <td class="text-label-large primary-text text-right">
                  -{{ fmtCurrency(transaction.totalPrice - (transaction.totalPrice * (1 -
                    transaction.data.discount.percentageValue))) }}
                  ({{ transaction.data.discount.percentageValue * 100 }}%)
                </td>
              </tr>
              <tr>
                <th class="text-label-large on-surface-text text-left align-top font-semibold">Total Tagihan</th>
                <td class="text-display-small secondary-text text-right">{{ fmtCurrency(transaction.billedAmount) }}</td>
              </tr>
            </table>
          </div>

          <form :id="`finishTransaction-${transaction.id}`" class="self-center w-full max-w-prose flex flex-col gap-8"
            @submit.prevent="onSubmit">
            <div class="flex flex-col gap-2">
              <p class="text-label-large">Masukkan detail penyelesaian transaksi</p>
              <hr class="divider" />
            </div>

            <div class="grow relative">
              <md-outlined-text-field id="finishTransaction-paymentMethodField" label="Metode Pembayaran"
                :value="field.paymentMethod" name="paymentMethod" required readonly class="w-full"
                @click="paymentMethodSelectionRef?.show()" />

              <md-menu ref="paymentMethodSelectionRef" anchor="finishTransaction-paymentMethodField" type="option" quick
                default-focus="NONE" class="min-w-full max-h-50vh">
                <md-menu-item v-for="method in PAYMENT_METHODS" :key="method" :headline="method"
                  @click="onPaymentMethodSelect(method)" />
              </md-menu>
            </div>

            <div class="flex items-center gap-4 flex-wrap">
              <div class="shrink-0 flex flex-col gap-4 self-start">
                <span class="text-body-medium">Foto sepatu:</span>
                <md-outlined-button type="button">
                  Pilih gambar
                  <md-icon slot="icon">add_a_photo</md-icon>
                  <input type="file" accept=".png,.jpeg,.jpg" name="image"
                    class="absolute inset-0 opacity-0 cursor-pointer"
                    @change="field.image = ($event.target as HTMLInputElement)?.files?.[0] || null" />
                </md-outlined-button>
              </div>

              <div
                class="grow group relative surface-container-low aspect-4/3 rounded-$md-sys-shape-corner-large overflow-hidden">
                <img :src="imgSrcUrl || transaction.data.items[0].imageOut" alt="foto sepatu"
                  class="w-full  h-full object-cover">
              </div>
            </div>
          </form>
        </div>

        <div v-else class="flex justify-center py-20">
          <md-circular-progress indeterminate />
        </div>

        <div class="h-10" />
      </section>
    </main>

    <loading-overlay v-if="isLoading" />
  </app-page>
</template>
