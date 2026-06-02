<template>
  <div class="verify-email">
    <h1>E-Mail-Bestätigung</h1>
    
    <div v-if="loading" class="loading">
      Überprüfe deine E-Mail...
    </div>
    
    <div v-else-if="success" class="success">
      <p>✓ Deine E-Mail wurde erfolgreich bestätigt!</p>
      <NuxtLink to="/login">Zur Anmeldung</NuxtLink>
    </div>
    
    <div v-else class="error">
      <p>✗ {{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const loading = ref(true)
const success = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    errorMessage.value = 'Kein Verifikationstoken gefunden'
    loading.value = false
    return
  }

  try {
    const response = await $fetch<any>('/api/verify-email', {
      method: 'POST',
      body: { token }
    })

    if (response.success) {
      success.value = true
    } else {
      errorMessage.value = response.error || 'Verifizierung fehlgeschlagen'
    }
  } catch (error) {
    errorMessage.value = 'Ein Fehler ist aufgetreten'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.verify-email {
  text-align: center;
  padding: 2rem;
}

.success {
  color: green;
}

.error {
  color: red;
}
</style>
