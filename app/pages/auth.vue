<script lang="ts">
import '@material/web/textfield/outlined-text-field';
import '@material/web/button/filled-button';
import '@material/web/iconbutton/icon-button';
import { signInWithEmailAndPassword } from 'firebase/auth';
</script>

<script lang="ts" setup>
const auth = useFirebaseAuth();
const isPending = ref(false);
const field = ref({
  email: '',
  password: '',
});

const [showPassword, toggleShowPassword] = useToggle();

const onSubmit = async () => {
  if (!auth) throw new Error("Auth is not defined");

  isPending.value = true;
  await signInWithEmailAndPassword(auth, field.value.email, field.value.password);
  isPending.value = false;
  navigateTo({ name: 'index-transaction' });
};

definePageMeta({
  middleware: 'no-auth',
});
</script>

<template>
  <main
    class="w-full h-100svh p-6 surface-container on-surface-text flex flex-col justify-center items-center gap-6 children:rounded-$md-sys-shape-corner-large">
    <h1 class="text-headline-small">Masuk</h1>

    <NuxtLoadingIndicator color="var(--md-sys-color-secondary)" />

    <form class="relative w-full max-w-md" @submit.prevent="onSubmit">
      <section
        class="relative bg-$md-sys-color-surface rounded-$md-sys-shape-corner-medium border border-$md-sys-color-outline flex flex-col">
        <img src="/logo.png" alt="Logo Soekaer" class="self-center w-36 h-36">

        <div class="px-4 py-8 flex flex-col gap-8">
          <field-wrapper v-model="field.email" v-slot="bindings">
            <md-outlined-text-field label="Email" name="email" type="email" v-bind="bindings" />
          </field-wrapper>
          <field-wrapper v-model="field.password" v-slot="bindings">
            <md-outlined-text-field label="Password" name="password" :type="showPassword ? 'text' : 'password'"
              v-bind="bindings">
              <md-icon-button type="button" slot="trailingicon" @click="toggleShowPassword()">
                <md-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</md-icon>
              </md-icon-button>
            </md-outlined-text-field>
          </field-wrapper>
        </div>

        <div class="p-4 flex flex-col gap-2">
          <md-filled-button type="submit">Masuk</md-filled-button>
        </div>

        <loading-overlay v-if="isPending" />
      </section>
    </form>
  </main>
</template>
