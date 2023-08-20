<script lang="ts">
import '@material/web/button/filled-button';
import '@material/web/iconbutton/icon-button';
import { objectOmit } from '@vueuse/core';
</script>

<script lang="ts" setup>
import type { Component } from 'vue';
import type { RouteLocationRaw } from 'vue-router';
import { toggleShowDrawer } from '../pages/index.vue';

interface Props {
  title: string;
  backBtn?: boolean;
  menuBtn?: boolean;
  trailingBtn?: {
    label: string;
    component?: string | Component;
    icon?: string;
    to?: RouteLocationRaw;
    iconTrailing?: boolean;
    [key: string]: any;
  };
  fullWidth?: boolean;
}

defineProps<Props>();
</script>

<template>
  <div class="flex flex-col gap-6">
    <header
      class="sticky top-0 inset-x-0 z-1 bg-$md-sys-color-surface-container flex justify-between items-center gap-4 py-4">
      <div class="flex items-center gap-4">
        <div class="shrink-0 flex gap-2">
          <slot name="header-start" v-bind="toggleShowDrawer">
            <md-icon-button v-if="menuBtn" @click="toggleShowDrawer()">
              <md-icon>menu</md-icon>
            </md-icon-button>
            <md-icon-button v-if="backBtn" @click="$router.back()">
              <md-icon>arrow_back</md-icon>
            </md-icon-button>
          </slot>
        </div>

        <h2 class="shrink text-headline-large line-clamp-1 text-ellipsis">{{ title }}</h2>
      </div>

      <div class="shrink-0 flex gap-2">
        <slot name="header-trailing">
          <template v-if="trailingBtn">
            <NuxtLink v-if="trailingBtn.to" :to="trailingBtn.to" custom v-slot="{ href, navigate }">
              <component :is="trailingBtn.component || 'md-filled-button'" :href="href"
                :trailing-icon="trailingBtn.iconTrailing" @click="navigate"
                v-bind="objectOmit(trailingBtn, ['to', 'component', 'iconTrailing', 'icon', 'label'])">
                <md-icon v-if="trailingBtn.icon" slot="icon">
                  {{ trailingBtn.icon }}
                </md-icon>
                {{ trailingBtn.label }}
              </component>
            </NuxtLink>
            <NuxtLink v-else>
              <component :is="trailingBtn.component || 'md-filled-button'" :trailing-icon="trailingBtn.iconTrailing"
                v-bind="objectOmit(trailingBtn, ['to', 'component', 'iconTrailing', 'icon', 'label'])">
                <md-icon v-if="trailingBtn.icon" slot="icon">
                  {{ trailingBtn.icon }}
                </md-icon>
                {{ trailingBtn.label }}
              </component>
            </NuxtLink>
          </template>
        </slot>
      </div>
    </header>

    <div class="overflow-hidden" :class="{ 'w-full max-w-screen-xl mx-auto': !fullWidth }">
      <slot />

      <div class="h-20"></div>
    </div>
  </div>
</template>
