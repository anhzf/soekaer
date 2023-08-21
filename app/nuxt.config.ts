// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('md-'),
    },
  },
  css: [
    '@unocss/reset/tailwind.css',
    '~/assets/styles/tokens.scss',
    '~/assets/styles/global.scss',
  ],
  vite: {
    server: {
      fs: {
        allow: ['..'],
      },
    },
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      link: [
        { rel: 'preload', href: 'https://fonts.gstatic.com/s/materialsymbolsoutlined/v129/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpEpjC_1v-p_4MrImHCIJIZrDCvHOej.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined' },
      ],
    },
  },
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    'nuxt-vuefire',
    'nuxt-ssr-lit',
    '@vite-pwa/nuxt',
  ],
  vuefire: {
    emulators: {
      enabled: false,
    },
    auth: true,
    config: JSON.parse(process.env.FIREBASE_CONFIG || '{}'),
  },
  ssrLit: {
    litElementPrefix: ['md-'],
  },
})
