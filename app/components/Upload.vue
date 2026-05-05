<template>
  <div class="container">
    <h2>Foto hochladen</h2>

    <div class="login-box">
      <template v-if="!token">
        <div class="auth-tabs">
          <button
              :class="{ active: authMode === 'login' }"
              type="button"
              @click="authMode = 'login'"
          >
            Login
          </button>

          <button
              :class="{ active: authMode === 'register' }"
              type="button"
              @click="authMode = 'register'"
          >
            Registrieren
          </button>
        </div>

        <template v-if="authMode === 'login'">
          <input
              v-model="loginValue"
              type="text"
              placeholder="Admin-Name oder E-Mail"
              class="auth-input"
              @keyup.enter="login"
          >

          <input
              v-model="password"
              type="password"
              placeholder="Passwort"
              class="auth-input"
              @keyup.enter="login"
          >

          <button @click="login">
            Einloggen
          </button>
        </template>

        <template v-else>
          <input
              v-model="email"
              type="email"
              placeholder="E-Mail"
              class="auth-input"
              @keyup.enter="register"
          >

          <input
              v-model="password"
              type="password"
              placeholder="Passwort"
              class="auth-input"
              @keyup.enter="register"
          >

          <button @click="register">
            Account erstellen
          </button>
        </template>
      </template>

      <template v-else>
        <p class="login-success">
          Eingeloggt als {{ role === 'admin' ? 'Admin' : 'User' }}
        </p>

        <button class="logout-btn" @click="logout">
          Ausloggen
        </button>
      </template>
    </div>

    <div v-if="token" class="upload-controls">
      <label for="file-upload" class="custom-file-upload">
        Datei auswählen
      </label>

      <input
          id="file-upload"
          type="file"
          accept="image/*"
          @change="previewImage"
      >

      <button
          :disabled="isUploading || uploadCooldown > 0"
          @click="upload"
      >
        {{ uploadButtonText }}
      </button>
    </div>

    <p v-else class="login-hint">
      Bitte einloggen oder registrieren, um Bilder hochzuladen.
    </p>

    <p v-if="file" class="file-info">
      {{ file.name }}
    </p>

    <div v-if="preview" class="preview-container">
      <img :src="preview" class="preview" alt="Vorschau">
    </div>

    <div class="gallery">
      <div v-for="img in images" :key="img" class="item">
        <img :src="`/uploads/${img}`" alt="User Foto">

        <button
            v-if="role === 'admin'"
            class="delete-btn"
            @click="remove(img)"
        >
          Löschen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type ApiResult = {
  success?: boolean
  error?: string
}

type UploadResult = ApiResult & {
  file?: string
}

type ImagesResult = ApiResult & {
  images?: string[]
}

type LoginResult = ApiResult & {
  token?: string
  role?: 'admin' | 'user'
  login?: string
}

const preview = ref<string | null>(null)
const file = ref<File | null>(null)
const images = ref<string[]>([])
const authMode = ref<'login' | 'register'>('login')
const loginValue = ref('')
const email = ref('')
const password = ref('')
const token = ref<string | null>(null)
const role = ref<'admin' | 'user' | null>(null)
const uploadCooldown = ref(0)
const isUploading = ref(false)

const uploadButtonText = computed(() => {
  if (isUploading.value) {
    return 'Wird hochgeladen...'
  }

  if (uploadCooldown.value > 0) {
    return `Warte ${uploadCooldown.value}s`
  }

  return 'Bild veröffentlichen'
})

let uploadCooldownInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  token.value = localStorage.getItem('token')
  role.value = localStorage.getItem('role') as 'admin' | 'user' | null
  loadImages()
})

onBeforeUnmount(() => {
  if (uploadCooldownInterval) {
    clearInterval(uploadCooldownInterval)
  }

  if (preview.value) {
    URL.revokeObjectURL(preview.value)
  }
})

async function register() {
  const res = await $fetch<ApiResult>('/api/register', {
    method: 'POST',
    body: {
      email: email.value,
      password: password.value
    }
  })

  if (res.error) {
    alert(res.error)
    return
  }

  alert('Registrierung erfolgreich. Du kannst dich jetzt einloggen.')

  loginValue.value = email.value
  email.value = ''
  password.value = ''
  authMode.value = 'login'
}

async function login() {
  const res = await $fetch<LoginResult>('/api/login', {
    method: 'POST',
    body: {
      login: loginValue.value,
      password: password.value
    }
  })

  if (res.error) {
    alert(res.error)
    return
  }

  if (!res.token || !res.role) {
    alert('Kein Token erhalten')
    return
  }

  token.value = res.token
  role.value = res.role

  localStorage.setItem('token', res.token)
  localStorage.setItem('role', res.role)

  loginValue.value = ''
  password.value = ''
}

function logout() {
  token.value = null
  role.value = null

  localStorage.removeItem('token')
  localStorage.removeItem('role')
}

function previewImage(e: Event) {
  const target = e.target as HTMLInputElement

  if (!target.files?.[0]) {
    return
  }

  file.value = target.files[0]

  if (preview.value) {
    URL.revokeObjectURL(preview.value)
  }

  preview.value = URL.createObjectURL(file.value)
}

async function upload() {
  if (isUploading.value || uploadCooldown.value > 0) {
    return
  }

  if (!token.value) {
    alert('Bitte zuerst einloggen')
    return
  }

  if (!file.value) {
    return
  }

  isUploading.value = true

  try {
    const form = new FormData()
    form.append('file', file.value)

    const res = await $fetch<UploadResult>('/api/upload', {
      method: 'POST',
      body: form,
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (res.error) {
      alert(res.error)
      return
    }

    startUploadCooldown()

    file.value = null

    if (preview.value) {
      URL.revokeObjectURL(preview.value)
      preview.value = null
    }

    await loadImages()
  } finally {
    isUploading.value = false
  }
}

function startUploadCooldown() {
  uploadCooldown.value = 10

  if (uploadCooldownInterval) {
    clearInterval(uploadCooldownInterval)
  }

  uploadCooldownInterval = setInterval(() => {
    uploadCooldown.value -= 1

    if (uploadCooldown.value <= 0 && uploadCooldownInterval) {
      clearInterval(uploadCooldownInterval)
      uploadCooldownInterval = null
    }
  }, 1000)
}

async function remove(name: string) {
  if (!token.value) {
    alert('Bitte zuerst einloggen')
    return
  }

  if (role.value !== 'admin') {
    alert('Nur Admins dürfen Bilder löschen')
    return
  }

  const res = await $fetch<ApiResult>('/api/delete', {
    method: 'POST',
    body: {
      file: name
    },
    headers: {
      Authorization: `Bearer ${token.value}`
    }
  })

  if (res.error) {
    alert(res.error)
    return
  }

  await loadImages()
}

async function loadImages() {
  const res = await $fetch<ImagesResult>('/api/images')

  if (res.error) {
    alert(res.error)
    return
  }

  images.value = res.images ?? []
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 40px auto;
  text-align: center;
  padding: 0 20px;
}

.login-box {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  margin: 0 auto 24px;
  flex-wrap: wrap;
}

.auth-tabs {
  display: flex;
  gap: 8px;
  width: 100%;
  justify-content: center;
}

.auth-tabs button {
  background-color: var(--btn-secondary-bg);
  color: var(--btn-secondary-text);
  border: 1px solid var(--border);
}

.auth-tabs button.active {
  background-color: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border-color: var(--accent);
}

.auth-input {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  background: var(--bg-input);
  color: var(--neutral-700);
  font-size: 14px;
}

.login-success {
  margin: 0;
  color: var(--success);
  font-weight: 600;
}

.login-hint {
  color: var(--text-muted);
  margin-bottom: 20px;
}

.logout-btn {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.upload-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}

#file-upload {
  display: none;
}

.custom-file-upload {
  background-color: var(--btn-secondary-bg);
  color: var(--btn-secondary-text);
  border: 1px solid var(--border);
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  display: inline-block;
}

.custom-file-upload:hover {
  background-color: var(--btn-secondary-hover);
  border-color: var(--accent);
}

button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.file-info {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.preview-container {
  margin: 20px 0;
}

.preview {
  max-width: 100%;
  max-height: 300px;
  border-radius: 12px;
  border: 1px solid var(--border);
}

.gallery {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
}

.item img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--danger);
  color: var(--danger-text);
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  transition: background 0.2s, transform 0.2s;
}

.delete-btn:hover {
  background: var(--danger-hover);
  transform: scale(1.05);
}
</style>