<script lang="ts">
import { MdMenu, MdOutlinedTextField } from '@material/web/all';
import '@material/web/textfield/outlined-text-field';
import '@material/web/menu/menu';
import '@material/web/menu/menu-item';

interface Option {
  label?: string;
  subtitle?: string;
  value: string;
}
</script>

<script lang="ts" setup generic="T extends Option">
interface Props {
  modelValue: string;
  displayValue?: keyof T;
  label: string;
  options: T[];
  inputId?: string;
  inputName?: string;
  fieldAttrs?: MdOutlinedTextField;
  loading?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'selected', value: T): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const selectionRef = ref<MdMenu>();

const compInputId = computed(() => props.inputId || `input-${props.label}`);
const compModelValue = computed(() => ((selectedOption.value && props.displayValue && (props.displayValue in selectedOption.value)) ? selectedOption.value[props.displayValue] : props.modelValue))

const selectedOption = computed(() => props.options.find((opt) => opt.value === props.modelValue));

const onSelect = (opt: T) => {
  emit('update:modelValue', opt.value);
  emit('selected', opt);
}
</script>

<template>
  <div class="relative">
    <field-wrapper :model-value="compModelValue" @update:model-value="$emit('update:modelValue', $event as string)"
      v-slot="bindings">
      <md-outlined-text-field :id="compInputId" :label="label" :name="inputName" class="w-full"
        v-bind="{ ...fieldAttrs, ...bindings }" @click="selectionRef?.show()" />
      <md-menu ref="selectionRef" :anchor="compInputId" type="option" quick default-focus="NONE"
        class="min-w-full max-h-50vh">
        <div v-if="loading" class="flex justify-center">
          <md-circular-progress indeterminate />
        </div>

        <template v-else>
          <md-menu-item v-for="opt in options" :key="opt.value" @click="onSelect(opt)">
            <div slot="headline">{{ opt.label || opt.value }}</div>
            <div slot="supporting-text">{{ opt.subtitle }}</div>
          </md-menu-item>
        </template>
      </md-menu>
    </field-wrapper>
  </div>
</template>
