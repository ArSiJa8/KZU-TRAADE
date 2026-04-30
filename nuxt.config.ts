// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/a11y',
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/ui',
    '@nuxt/scripts',
    '@nuxt/image',
    '@ant-design-vue/nuxt',
    '@coremyslo/nuxt-icon-font',
    '@dargmuesli/nuxt-cookie-control',
    '@formkit/auto-animate',
    '@morev/vue-transitions',
    '@nuxtjs/device',
    '@nuxtjs/google-fonts',
    '@nuxtjs/html-validator'
  ]
})