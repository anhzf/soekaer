import { Ref } from 'vue';

export const getVModelBindings = <T>(ref: Ref<T>) => ({
  onInput: (e: Event) => {
    ref.value = (e.target as HTMLInputElement).value as unknown as T;
  },
  value: ref.value,
});
