<template>
  <div class="container">
    <h2>Foto hochladen</h2>

    <input type="file" @change="previewImage" accept="image/*" />
    <img v-if="preview" :src="preview" class="preview" />

    <button @click="upload">Bild veröffentlichen</button>

    <div class="gallery">
      <div v-for="img in images" :key="img" class="item">
        <img :src="`/uploads/${img}`" alt="User Foto" />
        <button class="delete-btn" @click="remove(img)">Löschen</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

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

function previewImage(e: Event) {
  const target = e.target as HTMLInputElement

  if (!target.files?.[0]) return

  file.value = target.files[0]

  if (preview.value) {
    URL.revokeObjectURL(preview.value)
  }

  preview.value = URL.createObjectURL(file.value)
}

async function upload() {
  if (!file.value) return

  const form = new FormData()
  form.append('file', file.value)

  const res = await $fetch<UploadResult>('/api/upload', {
    method: 'POST',
    body: form
  })

  if (res.error) {
    alert(res.error)
    return
  }

  file.value = null

  if (preview.value) {
    URL.revokeObjectURL(preview.value)
    preview.value = null
  }

  await loadImages()
}

async function remove(name: string) {
  const res = await $fetch<ApiResult>('/api/delete', {
    method: 'POST',
    body: { file: name }
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

onMounted(loadImages)
</script>

<style scoped>
.container { max-width: 600px; margin: 40px auto; text-align: center; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
.preview { max-width: 100%; margin: 10px 0; border-radius: 10px; border: 2px solid #ddd; }
.gallery { margin-top: 30px; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
.item { position: relative; }
.item img { width: 100%; height: 150px; object-fit: cover; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 0, 0, 0.85);
  color: white;
  border: none;
  padding: 5px 8px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
}
.delete-btn:hover { background: red; }
</style>