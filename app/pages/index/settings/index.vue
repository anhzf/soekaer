<script lang="ts">
import '@material/web/button/text-button';
import '@material/web/button/filled-tonal-button';
import '@material/web/chips/input-chip';
import '@material/web/chips/chip-set';
import '@material/web/iconbutton/icon-button';
import '@material/web/field/outlined-field';
import '@material/web/field/filled-field';
import '@material/web/textfield/outlined-text-field';
import '@material/web/textfield/filled-text-field';
import '@material/web/progress/circular-progress';
import { parse } from 'csv-parse/browser/esm/sync';
import { Timestamp, updateDoc } from 'firebase/firestore';

const mapToCsv = <T extends Record<string, any>>(obj: T, columnsOrder?: (keyof T)[]) => Object.entries(obj)
  .map(([k, v]) => [k, ...(columnsOrder ? columnsOrder.map(colName => v[colName]) : Object.values(v))].map(vv => JSON.stringify(vv)).join(';')).join('\n');

const productsToCsv = (products: Record<string, { displayName?: string, price: number }>) => mapToCsv(products, ['displayName', 'price']);
const productsFromCsv = (csv: string) => Object.fromEntries((parse(csv, { delimiter: ';', skip_empty_lines: true }) as [string, string, string][])
  .map(([id, displayName, price]) => [id, ({ displayName, price: Number(price) })]));
</script>

<script lang="ts" setup>
const { data: settings, pending } = await useAppSettings();

const isLoading = ref(false);

const invoiceMessageTemplateField = ref(settings.value?.invoiceMessageTemplate || '');
syncRefs(() => settings.value?.invoiceMessageTemplate, invoiceMessageTemplateField);

const productsField = ref(productsToCsv(settings.value?.products || {}));
syncRefs(() => productsToCsv(settings.value?.products || {}), productsField);

/**
 * TODO: Add validation
 */
const onProductsSettingsSubmit = async () => {
  isLoading.value = true;

  try {
    await updateDoc(refs().appSettings,
      'products',
      productsFromCsv(productsField.value),
      'updatedAt',
      Timestamp.now(),
    );

    window.alert('Berhasil menyimpan produk layanan');
  } finally {
    isLoading.value = false;
  }
}

const onSubmitInvoiceMessageTemplate = async () => {
  isLoading.value = true;

  try {
    await updateDoc(refs().appSettings,
      'invoiceMessageTemplate',
      settings.value?.invoiceMessageTemplate,
      'updatedAt',
      Timestamp.now(),
    );

    window.alert('Berhasil menyimpan template pesan invoice');
  } finally {
    isLoading.value = false;
  }
}

watch(() => settings.value?.products, (v) => console.log(v));

useSeoMeta({
  title: 'Pengaturan'
});
</script>

<template>
  <app-page v-bind="{
    title: 'Pengaturan',
    menuBtn: true,
  }">
    <main class="flex flex-col">
      <section class="relative surface on-surface-text p-4 rounded-$md-sys-shape-corner-medium">
        <div class="flex flex-col gap-8">
          <div v-if="pending" class="flex min-h-30vh">
            <div class="m-auto">
              <md-circular-progress indeterminate />
            </div>
          </div>

          <template v-else-if="settings">
            <form :id="`${$.uid}_settings-invoiceMessageTemplate`" class="relative flex gap-x-6 gap-y-4 flex-wrap"
              @submit.prevent="onSubmitInvoiceMessageTemplate">
              <div class="w-25ch flex flex-col gap-4">
                <h3 class="text-title-medium">Template Pesan Invoice</h3>
              </div>

              <div class="grow min-w-40ch flex flex-col gap-8">
                <field-wrapper v-model="invoiceMessageTemplateField" v-slot="bindings">
                  <md-outlined-text-field label="Template Pesan" type="textarea" name="settingsInvoiceMessageTemplate"
                    rows="12" v-bind="bindings" />
                </field-wrapper>
              </div>

              <div class="flex flex-col gap-4">
                <md-filled-tonal-button class="transition-opacity"
                  :class="{ 'opacity-0': invoiceMessageTemplateField === settings.invoiceMessageTemplate }">
                  <md-icon slot="icon">save</md-icon>
                  Simpan
                </md-filled-tonal-button>
              </div>
            </form>

            <form :id="`${$.uid}_settings-products`" class="relative flex gap-x-6 gap-y-4 flex-wrap"
              @submit.prevent="onProductsSettingsSubmit">
              <div class="w-25ch flex flex-col gap-4">
                <h3 class="text-title-medium">Produk Layanan</h3>
              </div>

              <div class="grow min-w-40ch flex flex-col gap-8">
                <field-wrapper v-model="productsField" v-slot="bindings">
                  <md-outlined-text-field label="Produk Layanan" type="textarea" name="settingsProducts" rows="12"
                    v-bind="bindings" />
                </field-wrapper>
              </div>

              <div class="flex flex-col gap-4">
                <md-filled-tonal-button class="transition-opacity"
                  :class="{ 'opacity-0': productsField === productsToCsv(settings.products) }">
                  <md-icon slot="icon">save</md-icon>
                  Simpan
                </md-filled-tonal-button>
              </div>
            </form>

            <!-- <div class="relative flex gap-4 pt-4 border-t border-$md-sys-color-outline-variant">
              <div class="w-35ch flex flex-col gap-4">
                <h3 class="text-title-medium">Produk Layanan</h3>

                <md-text-button class="self-start">
                  <md-icon slot="icon">add</md-icon>
                  Tambah Produk
                </md-text-button>
              </div>

              <div class="grow flex flex-col gap-8">
                <div v-for="( product, id ) in  settings.products " :key="id" class="flex items-center gap-2">
                  <field-wrapper :model-value="product.displayName"
                    @update:modelValue="settings.products[id].displayName = $event" v-slot="bindings">
                    <md-outlined-text-field label="Nama Produk" class="grow" v-bind="bindings">
                      <md-icon slot="leadingicon">sell</md-icon>
                    </md-outlined-text-field>
                  </field-wrapper>

                  <field-wrapper :model-value="product.price" @update:modelValue="settings.products[id].price = $event"
                    v-slot="bindings">
                    <md-outlined-text-field label="Harga" type="number" prefix-text="Rp " class="w-25ch"
                      v-bind="bindings">
                    </md-outlined-text-field>
                  </field-wrapper>

                  <md-icon-button>
                    <md-icon>delete</md-icon>
                  </md-icon-button>
                </div>
              </div>
            </div> -->
          </template>
        </div>

        <div class="h-10" />

        <loading-overlay v-if="isLoading" />
      </section>
    </main>
  </app-page>
</template>
