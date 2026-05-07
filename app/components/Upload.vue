<template>
  <div id="upload" class="container">
    <h2>Foto hochladen</h2>

    <p v-if="token" class="login-success">
      Eingeloggt als {{ role === 'admin' ? 'Admin' : 'User' }}
    </p>

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
      Bitte oben im Header einloggen oder registrieren, um Bilder hochzuladen.
    </p>

    <p v-if="file" class="file-info">
      {{ file.name }}
    </p>

    <div v-if="preview" class="preview-container">
      <img :src="preview" class="preview" alt="Vorschau">
    </div>

    <div id="gallery" class="gallery">
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

const preview = ref<string | null>(null)
const file = ref<File | null>(null)
const images = ref<string[]>([])

const token = useState<string | null>('authToken', () => null)
const role = useState<'admin' | 'user' | null>('authRole', () => null)

const uploadCooldown = ref(0)
const isUploading = ref(false)

let uploadCooldownInterval: ReturnType<typeof setInterval> | null = null

const uploadButtonText = computed(() => {
  if (isUploading.value) {
    return 'Wird hochgeladen...'
  }

  if (uploadCooldown.value > 0) {
    return `Warte ${uploadCooldown.value}s`
  }

  return 'Bild veröffentlichen'
})

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
    alert('Bitte zuerst eine Datei auswählen')
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

.login-success {
  margin: 0 0 20px;
  color: var(--success);
  font-weight: 600;
}

.login-hint {
  color: var(--text-muted);
  margin-bottom: 20px;
}

.upload-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
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

.up-top {
  z-index: 3;
  margin-top: -70px;
}
</style>