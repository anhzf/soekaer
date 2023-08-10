<script lang="ts" setup>
// import { getVModelBindings } from '#imports';
const router = useRouter();
// const field = ref({
//   email: '',
//   password: '',
// });
// const fieldEmail = ref('');
// const fieldPassword = ref('');

const [showPassword, toggleShowPassword] = useToggle();

const onSubmit = (e: Event) => {
  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries()) as { email: string, password: string };
  console.log(data);
  router.push({ name: 'index-transaction' });
};
</script>

<template>
  <main
    class="w-full h-100svh p-6 surface-container on-surface-text flex flex-col justify-center items-center gap-6 children:rounded-$md-sys-shape-corner-large">
    <h1 class="text-headline-small">Masuk</h1>

    <form class="w-full max-w-md" @submit.prevent="onSubmit">
      <section
        class="relative bg-$md-sys-color-surface rounded-$md-sys-shape-corner-medium border border-$md-sys-color-outline flex flex-col">
        <img src="/logo.png" alt="Logo Soekaer" class="self-center w-36 h-36">

        <div class="px-4 py-8 flex flex-col gap-8">
          <md-outlined-text-field label="Email" name="email" type="email"></md-outlined-text-field>
          <md-outlined-text-field label="Password" name="password" :type="showPassword ? 'text' : 'password'">
            <md-standard-icon-button slot="trailingicon" @click="toggleShowPassword()">
              <md-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</md-icon>
            </md-standard-icon-button>
          </md-outlined-text-field>
        </div>

        <div class="p-4 flex flex-col gap-2">
          <md-filled-button type="submit">Masuk</md-filled-button>
        </div>
      </section>
    </form>
  </main>
</template>
