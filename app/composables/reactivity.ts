export const refWithDefault = <T>(defaultValue: () => T, initialValue?: T) => {
  const refValue = ref(initialValue) as Ref<T | undefined>;
  const isDefault = computed<boolean>(() => refValue.value === undefined);
  const refReturn = computed<T>({
    get: () => isDefault.value ? defaultValue() : refValue.value!,
    set: (v: T) => {
      refValue.value = v;
    },
  });
  const reset = () => {
    refValue.value = undefined;
  };

  return Object.assign(refReturn, {
    data: refReturn,
    reset,
    toDefault: reset,
    isDefault,
  });
}
