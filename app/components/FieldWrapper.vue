<script lang="ts" setup generic="T">
interface Props {
  modelValue: T;
  eventName?: string;
  propertyValue?: string;
}

interface Emit {
  (event: 'update:modelValue', value: T): void;
  (event: 'update:model-value', value: T): void;
}

const props = withDefaults(defineProps<Props>(), {
  eventName: 'input',
});
defineEmits<Emit>();

const getValue = (ev: Event) => {
  const target = ev.target as HTMLInputElement;

  if (props.propertyValue) {
    return target[props.propertyValue as keyof HTMLElement];
  }

  if (target.type === 'checkbox') {
    return target.checked;
  }

  if (target.type === 'file') {
    return target.multiple
      ? Array.from(target.files || [])
      : target.files?.[0];
  }

  return target.value;
}
</script>

<template>
  <slot :value="modelValue" @[eventName]="$emit('update:modelValue', getValue($event))"></slot>
</template>
