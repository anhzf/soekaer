<script lang="ts">
import '@material/web/button/filled-button';
import '@material/web/button/outlined-button';
import '@material/web/checkbox/checkbox';
import '@material/web/iconbutton/icon-button';
import '@material/web/progress/circular-progress';
import '@material/web/textfield/outlined-text-field';

const useCustomers = (filter: Ref<string>) => {
  const { data, execute, ...UseLazyFetchReturn } = useLazyFetch('/dev/data/customers.csv', {
    default: (): Customer[] => [],
    responseType: 'text',
    transform: (values: string) => values.split('\n')
      .map((row) => {
        const [id, name] = row.split(';');
        return new Customer({
          name,
          whatsAppNumber: '6281234567890',
          origin: 'independent',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }, { id });
      }),
    immediate: false,
  });

  const filteredData = computed(() => (console.count('filtering'), filter.value?.length >= 3
    ? data.value
      .filter(customer => customer.get('name')?.toLowerCase()
        .includes(filter.value.toLowerCase()))
    : []));

  watchOnce(() => filter.value.length >= 3, () => execute());

  return { ...UseLazyFetchReturn, execute, data: filteredData, all: data };
}
</script>

<script lang="ts" setup>
import { Customer, Transaction } from '@anhzf-soekaer/shared/models';
import type { MdMenu, MdOutlinedTextField } from '@material/web/all';
import { Timestamp, doc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes } from 'firebase/storage';
import { useFirebaseStorage } from 'vuefire';

const itemImageInputRef = ref<HTMLInputElement>();
const customerNameFieldRef = ref<MdOutlinedTextField>();
const customerSelectionRef = ref<MdMenu>();

const customerField = ref({
  id: null as string | null,
  name: '',
  whatsAppNumber: '',
  origin: '',
});
const itemField = ref({
  name: '',
  type: '',
  qty: 1,
  image: null as File | null,
  note: '',
  price: 0,
});

const itemImgSrcUrl = computed(() => itemField.value.image ? URL.createObjectURL(itemField.value.image) : '');

const customerOptionsFilter = computed(() => customerField.value.id ? '' : customerField.value.name);
const customerOptionsFilterThrotled = useThrottle(customerOptionsFilter, 800);
const { data: customerOptions, status } = useCustomers(customerOptionsFilterThrotled);

const log = console.log;

const clearCustomer = () => {
  customerField.value = {
    id: null,
    name: '',
    whatsAppNumber: '',
    origin: '',
  };
}

/**
 * TODO: Implements
 */
const createNewCustomer = (customer: Customer) => {
  return Promise.resolve(new Customer(customer.data, { id: Date.now().toString() }));
}

const uploadImage = (file: File) => {
  const fileRef = storageRef(useFirebaseStorage(), `/transactions/items/${Date.now()}_${file.name}`)
  return {
    ref: fileRef,
  };
}
const _uploadImage = (file: File) => {
  const fileRef = storageRef(useFirebaseStorage(), `/transactions/items/${Date.now()}_${file.name}`)
  return uploadBytes(fileRef, file);
}

const onCustomerSelect = (selected: Customer) => {
  customerField.value.id = selected.id;
  customerField.value.name = selected.get('name');
  customerField.value.whatsAppNumber = selected.get('whatsAppNumber');
  customerField.value.origin = selected.get('origin') || Customer.DEFAULT_ORIGIN;
}

const onSubmit = async () => {
  if (!itemField.value.image) {
    throw new Error("Image is required");
  }

  const customer = customerField.value.id
    ? new Customer({
      name: customerField.value.name,
      whatsAppNumber: customerField.value.whatsAppNumber,
      origin: customerField.value.origin,
      createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7)),
      updatedAt: Timestamp.now(),
    }, { id: customerField.value.id })
    : Customer.create({
      name: customerField.value.name,
      whatsAppNumber: customerField.value.whatsAppNumber,
      origin: customerField.value.origin,
    });

  const customerRef = doc(refs().customers, customer.id
    ? customer.id
    : (await createNewCustomer(customer)).id);
  const uploadedImage = await uploadImage(itemField.value.image);

  const transaction = Transaction.create({
    customer: {
      ref: customerRef,
      snapshot: customer.data,
    },
    items: [{
      name: itemField.value.name,
      type: itemField.value.type,
      qty: itemField.value.qty,
      note: itemField.value.note,
      imageIn: uploadedImage.ref.toString(),
      price: itemField.value.price,
    }],
    createdBy: {
      ref: doc(refs().users, '123'),
      snapshot: {
        name: 'Anhzf',
      },
    },
  });

  log(transaction);
}

watch(() => customerOptions.value.length, (hasOptions) => {
  if (hasOptions) customerSelectionRef.value?.show();
  else customerSelectionRef.value?.close();
});
</script>

<template>
  <app-page v-bind="{
    title: 'Buat Transaksi Baru',
    backBtn: true,
  }">
    <main class="flex flex-col">
      <section class="surface on-surface-text p-4 rounded-$md-sys-shape-corner-medium">
        <form id="form-transaction-new" class="flex flex-col gap-8" @submit.prevent="onSubmit">
          <div class="self-center w-full max-w-prose flex flex-col gap-8">
            <div class="flex flex-col gap-2">
              <p class="text-label-large">Data pelanggan</p>
              <hr class="divider" />
            </div>

            <div class="relative">
              <div class="flex gap-4 items-center">
                <field-wrapper v-model="customerField.name" v-slot="bindings">
                  <md-outlined-text-field ref="customerNameFieldRef" label="Nama Pelanggan" name="customerName"
                    :disabled="customerField.id" required class="w-full" v-bind="bindings">
                    <md-icon v-if="customerField.id" slot="leadingicon">person_check</md-icon>
                  </md-outlined-text-field>
                </field-wrapper>

                <md-icon-button v-if="customerField.id" @click="clearCustomer">
                  <md-icon>delete</md-icon>
                </md-icon-button>
              </div>

              <md-menu ref="customerSelectionRef" :anchor="customerNameFieldRef" type="option" quick default-focus="NONE"
                class="min-w-full max-h-50vh">
                <md-circular-progress v-if="status === 'pending'" indeterminate />

                <template v-else>
                  <md-menu-item v-for="opt in customerOptions" :key="opt.id" :headline="opt.get('name')"
                    @click="onCustomerSelect(opt)" />
                </template>
              </md-menu>
            </div>

            <field-wrapper v-model="customerField.whatsAppNumber" v-slot="bindings">
              <md-outlined-text-field label="No. WhatsApp" name="customerWhatsAppNumber" type="tel"
                :disabled="customerField.id" required v-bind="bindings" />
            </field-wrapper>

            <div class="flex items-center gap-4">
              <field-wrapper v-model="customerField.origin" v-slot="bindings">
                <label class="inline-flex items-center gap-2 cursor-pointer">
                  <md-checkbox :checked="customerField.origin === Customer.DEFAULT_ORIGIN"
                    @input="customerField.origin = $event.target.checked ? '' : Customer.DEFAULT_ORIGIN"
                    :disabled="customerField.id" required></md-checkbox>
                  Mandiri
                </label>
                <md-outlined-text-field label="Instansi" name="customerOrigin"
                  :disabled="customerField.id || customerField.origin === Customer.DEFAULT_ORIGIN" required class="grow"
                  v-bind="bindings">
                </md-outlined-text-field>
              </field-wrapper>
            </div>

            <div class="mt-4 flex flex-col gap-2">
              <p class="text-label-large on-surface-variant-text">Detail transaksi</p>
              <hr class="divider" />
            </div>

            <field-wrapper v-model="itemField.name" v-slot="bindings">
              <md-outlined-text-field label="Jenis Cuci" name="itemName" required v-bind="bindings" />
            </field-wrapper>

            <field-wrapper v-model="itemField.qty" v-slot="bindings">
              <md-outlined-text-field label="Jumlah Pasang Sepatu" name="itemQty" type="number" required
                v-bind="bindings" />
            </field-wrapper>

            <field-wrapper v-model="itemField.note" v-slot="bindings">
              <md-outlined-text-field label="Kondisi Sepatu" type="textarea" name="itemNote" v-bind="bindings" />
            </field-wrapper>

            <field-wrapper v-model="itemField.price" v-slot="bindings">
              <md-outlined-text-field label="Total Bayar" type="number" name="itemPrice" required v-bind="bindings"
                step="500" />
            </field-wrapper>

            <div class="flex items-center gap-4 flex-wrap">
              <div class="shrink-0 flex flex-col gap-4 self-start">
                <span class="text-body-medium">Foto sepatu:</span>
                <md-outlined-button @click="itemImageInputRef?.click()">
                  Pilih gambar
                  <md-icon slot="icon">add_a_photo</md-icon>
                </md-outlined-button>
              </div>

              <div
                class="grow group relative surface-container-low aspect-4/3 rounded-$md-sys-shape-corner-medium overflow-hidden">
                <img :src="itemImgSrcUrl" alt="foto sepatu" class="w-full  h-full object-cover">
              </div>

              <input ref="itemImageInputRef" type="file" accept=".png,.jpeg,.jpg" name="itemImage" class="hidden"
                @change="itemField.image = ($event.target as HTMLInputElement)?.files?.[0] || null" />
            </div>
          </div>

          <hr class="divider" />

          <div class="flex">
            <md-filled-button type="submit" class="grow">
              Simpan
              <md-icon slot="icon">save</md-icon>
            </md-filled-button>
          </div>
        </form>
      </section>
    </main>
  </app-page>
</template>

<style>
md-menu md-list {
  overflow-y: auto !important;
}
</style>
