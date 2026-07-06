// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true
  },

  css: [
    '~/assets/css/color-palette.css',
    '~/assets/css/main.css'
  ],

  modules: [
    '@nuxt/a11y',
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/ui',
    '@nuxt/scripts',
    '@nuxt/image',
    '@ant-design-vue/nuxt',
    '@dargmuesli/nuxt-cookie-control',
    '@formkit/auto-animate',
    '@morev/vue-transitions',
    '@nuxtjs/device',
    '@nuxtjs/google-fonts',
    '@nuxtjs/html-validator',
    'motion-v/nuxt',
    'v-gsap-nuxt',
    '@sentry/nuxt/module'
  ],

  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    },
    head: {
      htmlAttrs: {
        lang: 'de'
      },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'KZU-TRAADE',
      meta: [
        {
          name: 'description',
          content: 'KZU-TRAADE'
        },
        {
          name: 'theme-color',
          content: '#ffffff'
        }
      ]
    }
  },

  eslint: {
    config: {
      stylistic: true
    }
  },

  image: {
    quality: 80,
    format: ['webp'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  },

  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700]
    },
    display: 'swap',
    preconnect: true,
    preload: true,
    download: true
  },

  htmlValidator: {
    logLevel: 'warning',
    failOnError: false
  },

  cookieControl: {
    barPosition: 'bottom-full',
    closeModalOnClickOutside: true,
    cookies: {
      necessary: [],
      optional: []
    }
  },

  experimental: {
    typedPages: true
  },

  typescript: {
    strict: true,
    typeCheck: true
  },

  vite: {
    server: {
      allowedHosts: [
        'creational-zena-simulatively.ngrok-free.dev',
        'localhost'
      ],
      watch: {
        ignored: ['**/server/data/**']
      },
      fs: {
        allow: ['..']
      }
    }
  },

  nitro: {
    compressPublicAssets: true,
    experimental: {
      openAPI: true
    },
    watchOptions: {
      ignored: ['**/server/data/**']
    }
  },

  runtimeConfig: {
    tokenSecret: process.env.TOKEN_SECRET || '',
    databaseUrl: process.env.DATABASE_URL || '',
    minioEndpoint: process.env.MINIO_ENDPOINT || '',
    minioAccessKey: process.env.MINIO_ACCESS_KEY || '',
    minioSecretKey: process.env.MINIO_SECRET_KEY || '',
    minioBucket: process.env.MINIO_BUCKET || 'uploads',
  },

  sentry: {
    org: 'arsija-studios',
    project: 'javascript-nuxt'
  },

  sourcemap: {
    client: 'hidden'
  }
})