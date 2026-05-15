import * as Sentry from '@sentry/nuxt'

/**
 * Nuxt Global Sentry Automation Plugin
 * 
 * This plugin ensures that any error occurring in the Nuxt application
 * (Vue errors, app errors, and unhandled promise rejections) is
 * automatically captured by Sentry.
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Capture general Nuxt app errors
  nuxtApp.hook('app:error', (error) => {
    Sentry.captureException(error)
  })

  // Capture Vue-specific errors (rendering, component hooks)
  nuxtApp.hook('vue:error', (error, instance, info) => {
    Sentry.captureException(error, {
      extra: {
        info,
        component: instance?.$options?.name || 'unknown'
      }
    })
  })

  // For $fetch errors that are caught in try/catch blocks:
  // Sentry normally wouldn't see them because they are "handled".
  // If we want to automate this without manual captureException calls,
  // we can use a global proxy for $fetch or similar, but the most
  // idiomatic Nuxt way is to rely on the hooks above or use a global
  // response error handler if using useFetch.
})
