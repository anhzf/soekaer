<script lang="ts">
import { PaymentMethod } from '@anhzf-soekaer/shared/models';
import { PAYMENT_METHODS } from '@anhzf-soekaer/shared/models';
import { MdMenu } from '@material/web/menu/menu';
import '@material/web/menu/menu-item';
import '@material/web/button/outlined-button';
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field';
</script>

<script lang="ts" setup>
const paymentMethodFieldRef = ref<MdOutlinedTextField>();
const paymentMethodSelectionRef = ref<MdMenu>();
const discountFieldRef = ref<MdOutlinedTextField>();
const discountSelectionRef = ref<MdMenu>();

const field = ref({
  paymentMethod: 'cash',
  discount: '',
  paidAmount: 0,
  image: null as File | null,
});

const imgSrcUrl = useObjectUrl(() => field.value.image);

const onPaymentMethodSelect = (method: PaymentMethod) => {
  field.value.paymentMethod = method;
}

const onDiscountSelect = (discount: string) => {
  field.value.paymentMethod = discount;
}

const onSubmit = () => {
  console.log(field.value);
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
      icon: 'save',
    }
  }">
    <main class="flex flex-col">
      <section class="surface on-surface-text p-4 rounded-$md-sys-shape-corner-medium">
        <div class="flex flex-col gap-8">
          <form class="self-center w-full max-w-prose flex flex-col gap-8" @submit.prevent="onSubmit">
            <div class="flex flex-col gap-2">
              <p class="text-label-large">Masukkan detail penyelesaian transaksi</p>
              <hr class="divider" />
            </div>

            <field-wrapper v-model="field.paymentMethod" v-slot="bindings">
              <div class="grow relative">
                <md-outlined-text-field ref="paymentMethodFieldRef" label="Metode Pembayaran" name="paymentMethod"
                  required class="w-full" @click="paymentMethodSelectionRef?.show()" v-bind="bindings">
                </md-outlined-text-field>

                <md-menu ref="paymentMethodSelectionRef" :anchor="paymentMethodFieldRef" type="option" quick
                  default-focus="NONE" class="min-w-full max-h-50vh">
                  <md-menu-item v-for="method in PAYMENT_METHODS" :key="method" :headline="method"
                    @click="onPaymentMethodSelect(method)" />
                </md-menu>
              </div>
            </field-wrapper>

            <field-wrapper v-model="field.discount" v-slot="bindings">
              <div class="grow relative">
                <md-outlined-text-field ref="discountFieldRef" label="Diskon" name="discount" required class="w-full"
                  @click="discountSelectionRef?.show()" v-bind="bindings">
                </md-outlined-text-field>

                <md-menu ref="discountSelectionRef" :anchor="discountFieldRef" type="option" quick default-focus="NONE"
                  class="min-w-full max-h-50vh">
                  <md-menu-item v-for="opt in []" :key="opt" :headline="opt" @click="onDiscountSelect(opt)" />
                </md-menu>
              </div>
            </field-wrapper>

            <field-wrapper v-model="field.paidAmount" v-slot="bindings">
              <md-outlined-text-field label="Tagihan Akhir" type="number" name="itemPrice" required class="grow"
                step="500" prefix-text="IDR " v-bind="bindings" />
            </field-wrapper>

            <div class="flex items-center gap-4 flex-wrap">
              <div class="shrink-0 flex flex-col gap-4 self-start">
                <span class="text-body-medium">Foto sepatu:</span>
                <md-outlined-button>
                  Pilih gambar
                  <md-icon slot="icon">add_a_photo</md-icon>
                  <input type="file" accept=".png,.jpeg,.jpg" name="image"
                    class="absolute inset-0 opacity-0 cursor-pointer"
                    @change="field.image = ($event.target as HTMLInputElement)?.files?.[0] || null" />
                </md-outlined-button>
              </div>

              <div
                class="grow group relative surface-container-low aspect-4/3 rounded-$md-sys-shape-corner-large overflow-hidden">
                <img :src="imgSrcUrl" alt="foto sepatu" class="w-full  h-full object-cover">
              </div>
            </div>
          </form>
        </div>

        <div class="h-10" />
      </section>
    </main>
  </app-page>
</template>
