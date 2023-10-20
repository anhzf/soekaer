<script lang="ts">
import { Customer, Transaction } from '@anhzf-soekaer/shared/models';
import type { MdMenu, MdOutlinedTextField } from '@material/web/all';
import '@material/web/button/filled-button';
import '@material/web/button/outlined-button';
import '@material/web/checkbox/checkbox';
import '@material/web/chips/assist-chip';
import '@material/web/chips/filter-chip';
import '@material/web/chips/input-chip';
import '@material/web/iconbutton/icon-button';
import '@material/web/menu/menu';
import '@material/web/menu/menu-item';
import '@material/web/progress/circular-progress';
import '@material/web/textfield/outlined-text-field';
import { doc, query, where } from 'firebase/firestore';
import { ref as storageRef, uploadBytes } from 'firebase/storage';
import { useFirebaseStorage } from 'vuefire';
import type { TransactionItem } from '@anhzf-soekaer/shared/models';

interface OrderedProduct extends Omit<TransactionItem, 'imageIn'> {
  imageIn: File | null;
}

const useCustomers = (filter: Ref<string>) => {
  // const MIN_FILTER_LENGTH = 3;
  const { data, ...useCollectionReturn } = useCollection(query(
    refs().customers,
    where('name', '>=', filter.value),
    where('name', '<=', filter.value + '\uf8ff'),
  ), { once: true });

  return { ...useCollectionReturn, data };
}

const useOrigins = (filter: Ref<string>) => {
  const MIN_FILTER_LENGTH = 1;
  const { data, execute, ...useLazyFetchReturn } = useLazyFetch('/dev/data/origins.csv', {
    default: (): string[] => [],
    responseType: 'text',
    transform: (values: string) => Array.from(new Set(values.split('\n'))).filter(Boolean),
    immediate: false,
  });

  const filteredData = computed(() => (console.count('filtering origin'), filter.value?.length >= MIN_FILTER_LENGTH
    ? data.value
      .filter(origin => origin.toLowerCase()
        .includes(filter.value.toLowerCase()))
    : []));

  watchOnce(() => filter.value.length >= MIN_FILTER_LENGTH, () => execute());

  return { ...useLazyFetchReturn, execute, data: filteredData, all: data };
}

const useProducts = (filter: Ref<string>) => {
  const { data: settings, ...useAppSettingsReturn } = useAppSettings();
  const products = computed(() => Object.entries(settings.value?.products || {})
    .map(([name, props]) => ({ ...props, name })));

  const filtered = useArrayFilter(
    products,
    (product) => !filter.value || (product.displayName?.toLowerCase() || product.name.toLowerCase())
      .includes(filter.value.toLowerCase()),
  );

  return { ...useAppSettingsReturn, data: products, filtered };
}
</script>

<script lang="ts" setup>
const DEFAULT_ITEM = Object.freeze({
  name: '' as string,
  type: '' as string,
  qty: 1 as number,
  image: null as File | null,
  note: '' as string,
});
const isDefaultItem = (item: typeof DEFAULT_ITEM) => Object.entries(item).every(([key, value]) => DEFAULT_ITEM[key as keyof typeof DEFAULT_ITEM] === value);

const user = useCurrentUser();
const { data: settings } = await useAppSettings();

const customerNameSelectionRef = ref<MdMenu>();
const customerOriginSelectionRef = ref<MdMenu>();
const discountSelectionRef = ref<MdMenu>();

const isLoading = ref(false);

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
});
const experimental_itemsField = ref<(Mutable<typeof DEFAULT_ITEM>)[]>([{ ...DEFAULT_ITEM }]);
const othersField = ref({
  discount: '',
  finishEstimation: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
  totalPrice: 0,
});

const customerNameOptionsFilter = computed(() => customerField.value.id ? '' : customerField.value.name);
const customerNameOptionsFilterThrottled = useThrottle(customerNameOptionsFilter, 800);
const { data: customerNameOptions, pending: isCustomerNameOptionsPending } = useCustomers(customerNameOptionsFilterThrottled);

const customerOriginOptionsFilter = computed(() => customerField.value.id ? '' : customerField.value.origin);
const customerOriginOptionsFilterThrottled = useThrottle(customerOriginOptionsFilter, 800);
const { data: customerOriginOptions, status: customerOriginOptionsStatus } = useOrigins(customerOriginOptionsFilterThrottled);

const productOptionsFilter = computed(() => itemField.value.name);
const productOptionsFilterThrottled = useThrottle(productOptionsFilter, 800);
const { data: products, pending: isProductsPending } = useProducts(productOptionsFilterThrottled);
const productOptions = computed(() => products.value.map(product => ({
  value: product.name,
  label: product.displayName,
  subtitle: fmtCurrency(product.price)
})));

const orderedProducts = computed<OrderedProduct[]>(() => products.value.filter((product) => experimental_itemsField.value.some(item => item.name === product.name))
  .map((product) => {
    const fromList = experimental_itemsField.value.find(item => item.name === product.name)!;

    return {
      ...product,
      qty: fromList.qty || 1,
      note: fromList.note,
      imageIn: fromList.image,
    };
  }));

const totalPrice = computedEager(() => othersField.value.totalPrice || ((orderedProducts.value.reduce((acc, item) => acc + item.price * item.qty, 0))));

const billedAmount = computed(() => {
  const subtotal = totalPrice.value;
  const selectedDiscount = settings.value?.discounts[othersField.value.discount];

  if (selectedDiscount?.amountValue) {
    return subtotal - selectedDiscount.amountValue;
  }

  if (selectedDiscount?.percentageValue) {
    return subtotal - (subtotal * (selectedDiscount.percentageValue));
  }

  return subtotal;
});

const togglePriceAutoCalc = () => {
  if (othersField.value.totalPrice) {
    othersField.value.totalPrice = 0;
  } else {
    othersField.value.totalPrice = totalPrice.value;
  }
}

const clearCustomer = () => {
  customerField.value = {
    id: null,
    name: '',
    whatsAppNumber: '',
    origin: '',
  };
};

const uploadImage = (file: File) => {
  const fileRef = storageRef(useFirebaseStorage(), `/transactions/items/${Date.now()}_${file.name}`)
  return uploadBytes(fileRef, file);
}

const onCustomerNameSelect = (selected: Customer) => {
  customerField.value.id = selected.id;
  customerField.value.name = selected.get('name');
  customerField.value.whatsAppNumber = selected.get('whatsAppNumber');
  customerField.value.origin = selected.get('origin') || Customer.DEFAULT_ORIGIN;
}

const onCustomerOriginSelect = (selected: string) => {
  customerField.value.origin = selected;
}

const onDiscountSelect = (selected: string) => {
  othersField.value.discount = selected;
}

const onAddItemClick = () => {
  // Only add item when the last item is not empty
  if (!(experimental_itemsField.value.at(-1) && isDefaultItem(experimental_itemsField.value.at(-1)!))) {
    experimental_itemsField.value.push({ ...DEFAULT_ITEM });
  }
}

const onDeleteItemClick = (i: number) => {
  experimental_itemsField.value.splice(i, 1);
}

const onSubmit = async () => {
  try {
    if (!user.value) {
      throw new Error("Unauthenticated");
    }

    isLoading.value = true;

    const createCustomer = () => customerActions.create(Customer.create({
      name: customerField.value.name,
      whatsAppNumber: customerField.value.whatsAppNumber,
      origin: customerField.value.origin,
    }));

    const customer = customerField.value.id
      ? (await customerActions.get(customerField.value.id) || await createCustomer())
      : await createCustomer();

    const items = await Promise.all(orderedProducts.value.map(async ({ imageIn, ...product }) => {
      const uploadedImg = await uploadImage(imageIn!);

      return {
        ...product,
        imageIn: uploadedImg.ref.toString(),
      };
    }));

    const transaction = Transaction.create({
      customer: {
        ref: doc(refs().customers, customer.id),
        snapshot: customer.data,
      },
      items,
      customTotalPrice: othersField.value.totalPrice,
      discount: {
        ...settings.value?.discounts[othersField.value.discount],
        name: othersField.value.discount,
      },
      estimatedFinishedAt: othersField.value.finishEstimation,
      createdBy: {
        ref: doc(refs().users, user.value.uid),
        snapshot: {
          name: user.value.displayName || user.value.email || 'No Name',
        },
      },
    });

    const created = await transactionActions.create(transaction);

    navigateTo({ name: 'index-transaction-transactionId', params: { transactionId: created.id } });

  } catch (err: any) {
    window.alert(err.message || String(err));
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

watch(() => customerField.value.name, (hasInput) => {
  if (hasInput) customerNameSelectionRef.value?.show();
  else customerNameSelectionRef.value?.close();
});

watch(() => customerField.value.origin, (hasInput) => {
  if (hasInput) customerOriginSelectionRef.value?.show();
  else customerOriginSelectionRef.value?.close();
});

useSeoMeta({
  title: 'Buat Transaksi Baru',
});
</script>

<template>
  <app-page v-bind="{
    title: 'Buat Transaksi Baru',
    backBtn: true,
  }">
    <main class="flex flex-col">
      <section class="relative surface on-surface-text p-4 rounded-$md-sys-shape-corner-medium">
        <form id="form-transaction-new" class="flex flex-col gap-8" @submit.prevent="onSubmit">
          <div class="self-center w-full max-w-prose flex flex-col gap-8">
            <div class="flex flex-col gap-2">
              <p class="text-label-large">Data pelanggan</p>
              <hr class="divider" />
            </div>

            <div class="relative">
              <div class="flex gap-4 items-center">
                <field-wrapper v-model.lazy="customerField.name" v-slot="bindings">
                  <md-outlined-text-field id="newTransaction-customerNameField" label="Nama Pelanggan" name="customerName"
                    :disabled="customerField.id" required class="w-full" v-bind="bindings">
                    <md-icon v-if="customerField.id" slot="leadingicon">person_check</md-icon>
                  </md-outlined-text-field>
                </field-wrapper>

                <md-icon-button v-if="customerField.id" @click="clearCustomer">
                  <md-icon>delete</md-icon>
                </md-icon-button>
              </div>

              <md-menu ref="customerNameSelectionRef" anchor="newTransaction-customerNameField" type="option" quick
                default-focus="NONE" class="min-w-full max-h-50vh">
                <div v-if="isCustomerNameOptionsPending" class="flex justify-center">
                  <md-circular-progress indeterminate />
                </div>

                <template v-else>
                  <md-menu-item v-for="opt in customerNameOptions" :key="opt.id" @click="onCustomerNameSelect(opt)">
                    <div slot="headline">{{ opt.get('name') }}</div>
                  </md-menu-item>
                </template>
              </md-menu>
            </div>

            <field-wrapper v-model="customerField.whatsAppNumber" v-slot="bindings">
              <md-outlined-text-field label="No. WhatsApp" name="customerWhatsAppNumber" type="tel"
                supporting-text="Gunakan format internasional (cth: 628123456)" :disabled="customerField.id" required
                v-bind="bindings" />
            </field-wrapper>

            <div class="flex items-center gap-4">
              <field-wrapper v-model="customerField.origin" v-slot="bindings">
                <label class="inline-flex items-center gap-2 cursor-pointer">
                  <md-checkbox :checked="customerField.origin === Customer.DEFAULT_ORIGIN"
                    @input="customerField.origin = $event.target.checked ? '' : Customer.DEFAULT_ORIGIN"
                    :disabled="customerField.id" />
                  Mandiri
                </label>

                <div class="grow relative">
                  <md-outlined-text-field id="newTransaction-customerOriginFieldRef" label="Instansi"
                    name="customerOrigin" :disabled="customerField.id || customerField.origin === Customer.DEFAULT_ORIGIN"
                    required class="w-full" v-bind="bindings">
                  </md-outlined-text-field>

                  <md-menu ref="customerOriginSelectionRef" anchor="newTransaction-customerOriginFieldRef" type="option"
                    quick default-focus="NONE" class="min-w-full max-h-50vh">
                    <div v-if="customerOriginOptionsStatus === 'pending'" class="flex justify-center">
                      <md-circular-progress indeterminate />
                    </div>

                    <template v-else>
                      <md-menu-item v-for="opt in customerOriginOptions" :key="opt" :headline="opt"
                        @click="onCustomerOriginSelect(opt)" />
                    </template>
                  </md-menu>
                </div>
              </field-wrapper>
            </div>

            <div class="mt-4 flex flex-col gap-2">
              <p class="text-label-large on-surface-variant-text">Detail transaksi</p>
              <hr class="divider" />
            </div>

            <div class="flex flex-col gap-4">
              <div v-for="(item, i) in experimental_itemsField" :key="i" class="flex gap-2">
                <div class="text-label-large on-surface-variant-text p-1 align-middle"
                  :class="[i % 2 === 0 ? 'surface-variant' : 'surface-dim']">
                  {{ i + 1 }}
                </div>

                <div class="grow flex flex-col gap-2">
                  <div class="flex gap-2">
                    <text-field-autocomplete :model-value="item.name" display-value="label" label="Jenis Cuci"
                      :options="productOptions" :input-id="`newTransaction-productField${i}`"
                      :input-name="`item[${i}].name`" :loading="isProductsPending" class="grow"
                      @update:model-value="experimental_itemsField[i].name = $event" />
                    <md-outlined-text-field label="Jumlah Pasang Sepatu" :value="item.qty" :name="`item[${i}].qty`"
                      type="number" required class="w-10ch"
                      @input="experimental_itemsField[i].qty = Number($event.target.value)" />
                  </div>

                  <field-wrapper :model-value="item.note" @update:model-value="experimental_itemsField[i].name"
                    v-slot="bindings">
                    <md-outlined-text-field label="Kondisi Sepatu" type="textarea" :name="`item[${i}].note`"
                      v-bind="bindings" />
                  </field-wrapper>

                  <div class="flex items-center gap-4 flex-wrap">
                    <div class="shrink-0 flex flex-col gap-4 self-start">
                      <span class="text-body-medium">Foto sepatu:</span>
                      <md-outlined-button type="button">
                        Pilih gambar
                        <md-icon slot="icon">add_a_photo</md-icon>
                        <input type="file" accept=".png,.jpeg,.jpg" name="itemImage"
                          class="absolute inset-0 opacity-0 cursor-pointer"
                          @change="experimental_itemsField[i].image = ($event.target as HTMLInputElement)?.files?.[0] || null" />
                      </md-outlined-button>
                    </div>

                    <div
                      class="grow group relative surface-container-low aspect-4/3 rounded-$md-sys-shape-corner-large overflow-hidden">
                      <img :src="item.image ? createObjectUrl(item.image) : ''" alt="foto sepatu"
                        class="w-full  h-full object-cover">
                    </div>
                  </div>
                </div>

                <md-icon-button class="self-center" @click="onDeleteItemClick(i)">
                  <md-icon>delete</md-icon>
                </md-icon-button>
              </div>

              <div class="flex gap-2">
                <md-outlined-button type="button" :disabled="isDefaultItem(experimental_itemsField.at(-1)!)"
                  @click="onAddItemClick">
                  Tambah barang
                  <md-icon slot="icon">add</md-icon>
                </md-outlined-button>
              </div>
            </div>

            <md-outlined-text-field label="Estimasi selesai" :value="fmtDateToInput(othersField.finishEstimation)"
              name="estimationDate" type="datetime-local"
              @input="othersField.finishEstimation = new Date($event.target.value)"
              @focusin="$event.target?.getInput()?.showPicker?.()" />

            <div class="flex flex-col gap-2">
              <p class="text-label-large">Tagihan</p>
              <hr class="divider" />
            </div>

            <div class="flex items-center gap-2">
              <md-outlined-text-field label="Total Bayar" :value="totalPrice" type="number" name="itemPrice" required
                :disabled="!othersField.totalPrice" class="grow" step="500" prefix-text="Rp "
                @change="othersField.totalPrice = Number($event.target.value) || 100" />
              <md-filter-chip v-if="orderedProducts.length" label="Hitung otomatis" :selected="!othersField.totalPrice"
                @selected="togglePriceAutoCalc" />
            </div>

            <div class="flex items-center gap-4">
              <div class="grow relative">
                <md-outlined-text-field id="newTransaction-discountField" label="Diskon"
                  :value="othersField.discount || '-'" name="discount" readonly class="w-full"
                  @click="discountSelectionRef?.show()">
                  <md-icon-button v-if="othersField.discount" slot="trailingicon" type="button"
                    @click="othersField.discount = ''">
                    <md-icon>close</md-icon>
                  </md-icon-button>
                </md-outlined-text-field>

                <md-menu ref="discountSelectionRef" anchor="newTransaction-discountField" type="option" quick
                  default-focus="NONE" class="min-w-full max-h-50vh">
                  <md-menu-item v-for="(_, discountName) in settings?.discounts" :key="discountName"
                    :headline="discountName" @click="onDiscountSelect(discountName as string)" />
                </md-menu>
              </div>

              <template v-if="settings?.discounts[othersField.discount]">
                <md-assist-chip v-if="settings.discounts[othersField.discount].amountValue"
                  :label="`- ${fmtCurrency(settings.discounts[othersField.discount].amountValue!)}`" elevated />
                <md-assist-chip v-else-if="settings.discounts[othersField.discount].percentageValue"
                  :label="`Diskon ${settings.discounts[othersField.discount].percentageValue! * 100}%`" elevated />
              </template>
            </div>

            <md-outlined-text-field label="Total Bayar" :value="billedAmount" prefix-text="Rp" readonly>
              <md-icon slot="leadingicon">equal</md-icon>
            </md-outlined-text-field>
          </div>

          <hr class="divider" />

          <div class="flex">
            <md-filled-button type="submit" class="grow">
              Simpan
              <md-icon slot="icon">save</md-icon>
            </md-filled-button>
          </div>
        </form>

        <loading-overlay v-if="isLoading" />
      </section>
    </main>
  </app-page>
</template>

<style>
md-menu md-list {
  overflow-y: auto !important;
}
</style>
