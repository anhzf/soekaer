<script lang="ts">
import { NuxtLink } from '#components';
import { breakpointsTailwind } from '@vueuse/core';
import { signOut } from 'firebase/auth';
import type { RouteLocationRaw } from 'vue-router';

export const useDrawerToggler = createGlobalState(() => {
  const user = useCurrentUser();

  const bp = useBreakpoints(breakpointsTailwind);
  const bpBelowSm = bp.smaller('sm');
  const bpAboveSm = bp.greater('sm');

  const [isOpen, toggle] = useToggle(bpAboveSm.value);

  whenever(bpBelowSm, () => {
    toggle(false);
  });

  whenever(bpAboveSm, () => {
    toggle(true);
  });

  whenever(() => !user.value, () => {
    toggle(false);
  }, { immediate: true });

  return [isOpen, toggle] as const;
});
</script>

<script lang="ts" setup>
const auth = useFirebaseAuth();
const user = useCurrentUser()

const route = useRoute();

const [showDrawer, toggleShowDrawer] = useDrawerToggler();

if (route.path === '/') {
  navigateTo('/transaction');
}

const [NavItemTemplate, NavItem] = createReusableTemplate<{
  label: string;
  icon: string;
  to?: RouteLocationRaw;
  onClick?: () => void;
}>();

const onLogoutClick = async () => {
  if (!auth) throw new Error("Auth is not defined");

  await signOut(auth);
  navigateTo({ name: 'auth' });
};

definePageMeta({
  middleware: 'auth',
});
</script>

<template>
  <div class="w-full h-100dvh surface-container on-surface-text flex">
    <nav-item-template v-slot="{ label, icon, to, onClick }">
      <li class="inline-full inline-flex flex-col">
        <component :is="to ? NuxtLink : 'button'" v-bind="{ to, onClick }" class="nav-item">
          <md-icon>{{ icon }}</md-icon>
          <span class="label-text text-label-large">{{ label }}</span>

          <md-ripple />
        </component>
      </li>
    </nav-item-template>

    <NuxtLoadingIndicator class="absolute!" color="var(--md-sys-color-secondary)" />

    <transition enter-active-class="transform transition-transform" enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0" leave-active-class="transform transition-transform" leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full">
      <aside v-if="showDrawer"
        class="shrink-0 fixed sm:static w-xs flex flex-col z-2 sm:z-1 left-0 inset-y-0 sm:pl-6 sm:pr-3 sm:py-6 overflow-y-auto"
        style="--md-elevation-level: 1;">
        <md-elevation />

        <div class="fixed block sm:hidden inset-0 -z-1 bg-#0005" @click.self="toggleShowDrawer()" />

        <nav
          class="grow flex flex-col sm:gap-6 rounded-r-$md-sys-shape-corner-large sm:rounded-l-$md-sys-shape-corner-large">
          <div
            class="grow surface-container-low on-surface-text flex flex-col rounded-b-none sm:rounded-b-inherit rounded-inherit">
            <div class="p-3">
              <h1 class="text-title-large">Spotz Cleaning Solution</h1>
            </div>

            <hr class="divider" />

            <ul class="grow p-3">
              <nav-item label="Transaksi" icon="receipt_long" :to="{ name: 'index-transaction' }" />
              <nav-item label="Daftar pelanggan" icon="groups" :to="{ name: 'index-customer' }" />
              <nav-item label="Pengaturan" icon="settings" :to="{ name: 'index-settings' }" />
            </ul>
          </div>

          <ul class="p-3 surface-container-low on-surface-text rounded-t-none sm:rounded-t-inherit rounded-inherit">
            <!-- User info -->
            <NuxtLink to="/" class="relative p-2 flex gap-3 rounded-$md-sys-shape-corner-full">
              <div
                class="shrink-0 block-14 inline-14 inline-flex bg-$md-sys-color-tertiary-container text-$md-sys-color-tertiary flex-col justify-center items-center rounded-full">
                <span class="text-title-large">A</span>
              </div>
              <div class="inline-flex flex-col justify-center">
                <span class="text-title-medium">{{ user?.displayName || 'No Name' }}</span>
                <span class="text-body-medium">{{ user?.email }}</span>
              </div>

              <md-ripple />
            </NuxtLink>

            <!-- User nav actions -->
            <nav-item label="Keluar" icon="logout" @click="onLogoutClick" />
          </ul>
        </nav>
      </aside>
    </transition>

    <div class="grow relative overflow-y-auto">
      <NuxtPage class="children:pl-4 children:sm:pl-3 children:pr-4 sm:children:pr-6 py-6" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nav-item {
  @apply relative pl-4 pr-6 py-4 rounded-$md-sys-shape-corner-full;
  @apply flex items-center gap-6;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;

  &:hover {
    background-color: rgba(var(--md-sys-color-on-surface), var(--md-sys-state-hover-state-layer-opacity));
  }

  &.router-link-active {
    @apply bg-$md-sys-color-secondary-container;

    & .label-text {
      @apply font-semibold;
    }
  }
}
</style>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.25s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
