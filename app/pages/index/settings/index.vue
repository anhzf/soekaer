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

const mapToCsv = (obj: Record<string, any>) => Object.entries(obj).map(([k, v]) => [k, ...Object.values(v)].map(vv => JSON.stringify(vv)).join(';')).join('\n');
const productsFromCsv = (csv: string) => Object.fromEntries((parse(csv, { skip_empty_lines: true }) as [string, string, string][])
  .map(([id, displayName, price]) => [id, ({ displayName, price: Number(price) })]));
</script>

<script lang="ts" setup>
const { data: settings, pending } = useAppSettings();
const productsField = computed({
  get: () => mapToCsv(settings.value?.products || {}),
  set: (csv) => {
    if (settings.value) {
      settings.value.products = productsFromCsv(csv)
    }
  },
});

const onSubmit = () => {
  console.log('submit');
}

useSeoMeta({
  title: 'Pengaturan'
});
</script>

<template>
  <app-page v-bind="{
    title: 'Pengaturan',
    menuBtn: true,
    // trailingBtn: {
    //   label: 'Simpan',
    //   icon: 'save',
    //   type: 'submit',
    //   form: `${$.uid}_settings`,
    // },
  }">
    <main class="flex flex-col">
      <section class="surface on-surface-text p-4 rounded-$md-sys-shape-corner-medium">
        <div class="flex flex-col gap-8">
          <div v-if="pending" class="flex min-h-30vh">
            <div class="m-auto">
              <md-circular-progress indeterminate />
            </div>
          </div>

          <template v-else-if="settings">
            <form :id="`${$.uid}_settings`" class="flex gap-4" @submit.prevent="onSubmit">
              <div class="w-35ch flex flex-col gap-4">
                <h3 class="text-title-medium">Produk Layanan</h3>

                <md-filled-tonal-button class="self-start">
                  <md-icon slot="icon">save</md-icon>
                  Simpan
                </md-filled-tonal-button>
              </div>

              <div class="grow flex flex-col gap-8">
                <field-wrapper :model-value="productsField" v-slot="bindings">
                  <md-outlined-text-field label="Produk Layanan" type="textarea" name="settingsProducts" rows="12"
                    v-bind="bindings" />
                </field-wrapper>
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
                    <md-outlined-text-field label="Harga" type="number" prefix-text="Rp " class="w-20ch"
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
      </section>
    </main>
  </app-page>
</template>
