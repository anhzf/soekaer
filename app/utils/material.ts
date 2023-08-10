export const getVModelBindings = <T>(refValue: T) => ({
  onInput: (e: Event) => {
    console.log(e);

    refValue = (e.target as HTMLInputElement).value as unknown as T;
  },
  modelValue: refValue
})
