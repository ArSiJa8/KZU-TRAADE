

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

let heartbeatInterval: any = null
const clientId = useCookie('client-id')

onMounted(() => {
  if (!clientId.value) {
    clientId.value = Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  const sendHeartbeat = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await $fetch('/api/heartbeat', {
        method: 'POST',
        body: { id: clientId.value },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      if (response && (response as any).redirect) {
        const redirect = (response as any).redirect
        const lastRedirect = localStorage.getItem('last-redirect-ts')
        
        if (!lastRedirect || parseInt(lastRedirect) < redirect.timestamp) {
          localStorage.setItem('last-redirect-ts', redirect.timestamp.toString())
          window.location.href = redirect.url
        }
      }
    } catch (e) {
      console.error('Heartbeat failed', e)
    }
  }

  // Send heartbeat immediately and then every 10 seconds
  sendHeartbeat()
  heartbeatInterval = setInterval(sendHeartbeat, 10000)
})

onUnmounted(() => {
  if (heartbeatInterval) clearInterval(heartbeatInterval)
})
</script>

<template>
  <Header />
  <main>
    <NuxtPage />
  </main>
</template>