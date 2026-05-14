<template>
  <div id="upload" class="container up-top">
    <div
        v-if="newPostOpen"
        class="new-post-backdrop"
        role="button"
        tabindex="0"
        @click.self="closeNewPost"
        @keydown.esc="closeNewPost"
    >
      <section class="new-post-modal">
        <button class="close-btn" type="button" @click="closeNewPost">
          ×
        </button>

        <h2>Tauschangebot erstellen</h2>

        <p v-if="token" class="login-success">
          Eingeloggt als {{ role === 'admin' ? 'Admin' : 'User' }}
        </p>

        <form v-if="token" class="upload-form" @submit.prevent="upload">
          <div class="form-group">
            <label for="title">Titel</label>
            <input
                id="title"
                v-model="title"
                type="text"
                maxlength="80"
                placeholder="z.B. Geodreieck, fast neu"
            >
          </div>

          <div class="form-group">
            <label for="description">Beschreibung</label>
            <textarea
                id="description"
                v-model="description"
                maxlength="800"
                rows="5"
                placeholder="Beschreibe den Gegenstand kurz... (Schreibe bitte auch wie stark die Abnutzung ist.)"
            />
          </div>

          <div class="form-group">
            <label for="category">Kategorie</label>
            <select id="category" v-model="category">
              <option value="" disabled>
                Kategorie auswählen
              </option>
              <option value="Schulmaterial">
                Schulmaterial
              </option>
              <option value="Stifte">
                Stifte
              </option>
              <option value="Bücher">
                Bücher
              </option>
              <option value="Sportmaterialien">
                Sportmaterialien
              </option>
              <option value="Anderes">
                Anderes
              </option>
            </select>
          </div>

          <div class="upload-controls">
            <label for="file-upload" class="custom-file-upload">
              Bilder auswählen
            </label>

            <input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                @change="previewImages"
            >

            <button :disabled="isUploading || uploadCooldown > 0">
              {{ uploadButtonText }}
            </button>
          </div>

          <p v-if="files.length" class="file-info">
            {{ files.length }} Bild{{ files.length === 1 ? '' : 'er' }} ausgewählt
          </p>

          <div v-if="previews.length" class="preview-grid">
            <div
                v-for="(item, index) in previews"
                :key="item.url"
                class="preview-card"
                :class="{ selected: mainImageIndex === index }"
            >
              <button
                  type="button"
                  class="preview-select"
                  @click="mainImageIndex = index"
              >
                <img :src="item.url" alt="Vorschau">
                <span>
                  {{ mainImageIndex === index ? 'Main Image' : 'Als Main Image wählen' }}
                </span>
              </button>

              <button
                  type="button"
                  class="preview-remove"
                  aria-label="Bild entfernen"
                  @click="removePreviewImage(index)"
              >
                ×
              </button>
            </div>
          </div>

          <div class="rules-box">
            <h3>Regeln</h3>

            <ul>
              <li>Nur Tausch — kein Geld.</li>
              <li>Sachen müssen sauber und funktionstüchtig sein.</li>
              <li>Respektvoller Umgang, keine Beleidigungen.</li>
              <li>Verbotene Gegenstände: Esswaren, Kleider und Lebewesen.</li>
              <li>Nach dem Trade den Gegenstand wieder von der Website löschen.</li>
            </ul>

            <label class="rules-accept">
              <input v-model="rulesAccepted" type="checkbox">
              Ich akzeptiere diese Regeln.
            </label>
          </div>
        </form>

        <p v-else class="login-hint">
          Bitte oben im Header einloggen oder registrieren, um Angebote hochzuladen.
        </p>
      </section>
    </div>

    <section id="gallery" class="gallery-section">
      <div class="gallery-header">
        <h2>Tauschangebote</h2>

        <label class="category-filter">
          Kategorie:
          <select v-model="selectedCategory">
            <option value="Alle">
              Alle
            </option>
            <option value="Schulmaterial">
              Schulmaterial
            </option>
            <option value="Stifte">
              Stifte
            </option>
            <option value="Bücher">
              Bücher
            </option>
            <option value="Sportmaterialien">
              Sportmaterialien
            </option>
            <option value="Anderes">
              Anderes
            </option>
          </select>
        </label>
      </div>

      <div class="gallery">
        <article v-for="post in filteredPosts" :key="post.id" class="item">
          <button class="post-preview" type="button" @click="selectedPost = post">
            <img :src="`/uploads/${post.mainImage}`" alt="Tauschangebot">
            <strong>{{ post.title }}</strong>
          </button>

          <p class="category">
            {{ post.category }}
          </p>

          <button
              v-if="canDelete(post)"
              class="delete-btn"
              type="button"
              @click="remove(post.id)"
          >
            Löschen
          </button>
        </article>
      </div>

      <p v-if="!filteredPosts.length" class="empty-gallery">
        Keine Angebote in dieser Kategorie gefunden.
      </p>
    </section>

    <div
        v-if="selectedPost"
        class="modal-backdrop"
        role="button"
        tabindex="0"
        @click.self="selectedPost = null"
        @keydown.esc="selectedPost = null"
    >
      <section class="modal">
        <button class="close-btn" type="button" @click="selectedPost = null">
          ×
        </button>

        <img :src="`/uploads/${selectedPost.mainImage}`" class="modal-main-image" alt="Hauptbild">

        <h2>{{ selectedPost.title }}</h2>

        <p class="modal-category">
          {{ selectedPost.category }}
        </p>

        <p class="modal-description">
          {{ selectedPost.description }}
        </p>

        <div v-if="selectedPost.images.length > 1" class="modal-images">
          <img
              v-for="image in selectedPost.images"
              :key="image"
              :src="`/uploads/${image}`"
              alt="Weiteres Bild"
          >
        </div>

        <div class="owner-info">
          <p><strong>Name:</strong> {{ selectedPost.ownerName }}</p>
          <p><strong>E-Mail:</strong> {{ selectedPost.ownerEmail }}</p>
        </div>

        <button
            v-if="canDelete(selectedPost)"
            class="modal-delete-btn"
            type="button"
            @click="remove(selectedPost.id)"
        >
          Diesen Post löschen
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type ApiResult = {
  success?: boolean
  error?: string
}

// Alle Kategorien sind hier im Type definiert
type TradeCategory = 'Schulmaterial' | 'Stifte' | 'Bücher' | 'Sportmaterialien' | 'Anderes'

type TradePost = {
  id: string
  title: string
  description: string
  category: TradeCategory
  images: string[]
  mainImage: string
  ownerEmail: string
  ownerName: string
  createdAt: string
}

type UploadResult = ApiResult & {
  post?: TradePost
}

type PostsResult = ApiResult & {
  posts?: TradePost[]
}

const newPostOpen = useState('newPostOpen', () => false)
const selectedCategory = ref<'Alle' | TradeCategory>('Alle')

const title = ref('')
const description = ref('')
const category = ref<TradeCategory | ''>('')
const rulesAccepted = ref(false)

const files = ref<File[]>([])
const previews = ref<{ file: File, url: string }[]>([])
const mainImageIndex = ref(0)

const posts = ref<TradePost[]>([])
const selectedPost = ref<TradePost | null>(null)

const filteredPosts = computed(() => {
  if (selectedCategory.value === 'Alle') {
    return posts.value
  }

  return posts.value.filter((post) => post.category === selectedCategory.value)
})

const token = useState<string | null>('authToken', () => null)
const role = useState<'admin' | 'user' | null>('authRole', () => null)
const login = useState<string | null>('authLogin', () => null)

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

  return 'Angebot veröffentlichen'
})

onMounted(() => {
  token.value = localStorage.getItem('token')
  role.value = localStorage.getItem('role') as 'admin' | 'user' | null
  login.value = localStorage.getItem('login')
  loadPosts()
})

onBeforeUnmount(() => {
  if (uploadCooldownInterval) {
    clearInterval(uploadCooldownInterval)
  }

  clearPreviews()
})

function closeNewPost() {
  newPostOpen.value = false
  resetForm()
}

function clearPreviews() {
  for (const preview of previews.value) {
    URL.revokeObjectURL(preview.url)
  }

  previews.value = []
}

function previewImages(e: Event) {
  const target = e.target as HTMLInputElement

  clearPreviews()

  files.value = Array.from(target.files ?? []).slice(0, 8)
  previews.value = files.value.map((file) => ({
    file,
    url: URL.createObjectURL(file)
  }))
  mainImageIndex.value = 0
}

function removePreviewImage(index: number) {
  const preview = previews.value[index]

  if (!preview) {
    return
  }

  URL.revokeObjectURL(preview.url)

  previews.value.splice(index, 1)
  files.value.splice(index, 1)

  if (!previews.value.length) {
    mainImageIndex.value = 0
    return
  }

  if (mainImageIndex.value === index) {
    mainImageIndex.value = 0
    return
  }

  if (mainImageIndex.value > index) {
    mainImageIndex.value -= 1
  }
}

function canDelete(post: TradePost) {
  return role.value === 'admin' || post.ownerEmail === login.value
}

async function upload() {
  if (isUploading.value || uploadCooldown.value > 0) {
    return
  }

  if (!token.value) {
    alert('Bitte zuerst einloggen')
    return
  }

  if (!title.value.trim()) {
    alert('Bitte einen Titel eingeben')
    return
  }

  if (!description.value.trim()) {
    alert('Bitte eine Beschreibung eingeben')
    return
  }

  if (!category.value) {
    alert('Bitte eine Kategorie auswählen')
    return
  }

  if (!files.value.length) {
    alert('Bitte mindestens ein Bild auswählen')
    return
  }

  if (!rulesAccepted.value) {
    alert('Bitte die Regeln akzeptieren')
    return
  }

  isUploading.value = true

  try {
    const form = new FormData()

    form.append('title', title.value.trim())
    form.append('description', description.value.trim())
    form.append('category', category.value)
    form.append('mainImageIndex', String(mainImageIndex.value))
    form.append('rulesAccepted', String(rulesAccepted.value))

    for (const file of files.value) {
      form.append('files', file)
    }

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
    resetForm()
    newPostOpen.value = false

    await loadPosts()
  } catch (err: any) {
    const message = err.data?.statusMessage || err.statusMessage || err.message || 'Ein Fehler ist aufgetreten'
    alert(`Upload fehlgeschlagen: ${message}`)
  } finally {
    isUploading.value = false
  }
}

function resetForm() {
  title.value = ''
  description.value = ''
  category.value = ''
  rulesAccepted.value = false
  files.value = []
  mainImageIndex.value = 0
  clearPreviews()
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

async function remove(id: string) {
  if (!token.value) {
    alert('Bitte zuerst einloggen')
    return
  }

  if (!confirm('Diesen Post wirklich löschen?')) {
    return
  }

  try {
    const res = await $fetch<ApiResult>('/api/delete', {
      method: 'POST',
      body: {
        id
      },
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (res.error) {
      alert(res.error)
      return
    }

    if (selectedPost.value?.id === id) {
      selectedPost.value = null
    }

    await loadPosts()
  } catch (err: any) {
    const message = err.data?.statusMessage || err.statusMessage || err.message || 'Löschen fehlgeschlagen'
    alert(`Fehler beim Löschen: ${message}`)
  }
}

async function loadPosts() {
  const res = await $fetch<PostsResult>('/api/images')

  if (res.error) {
    alert(res.error)
    return
  }

  posts.value = res.posts ?? []
}
</script>

<style scoped>
.container {
  max-width: 1000px;
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

.upload-form {
  max-width: 720px;
  margin: 0 auto;
  text-align: left;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
}

.form-group {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.form-group label {
  font-weight: 700;
}

.form-group input,
.form-group textarea,
.form-group select,
.category-filter select {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--background);
  color: var(--text-main);
  font: inherit;
}

.upload-controls {
  display: flex;
  gap: 12px;
  justify-content: flex-start;
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

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin: 20px 0;
}

.preview-card {
  position: relative;
  border: 2px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 12px;
  overflow: hidden;
}

.preview-card.selected {
  border-color: var(--accent);
}

.preview-select {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  text-align: center;
}

.preview-select img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.preview-select span {
  display: block;
  padding: 8px;
  font-size: 12px;
  font-weight: 700;
}

.preview-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0 0 2px;
  border: 0;
  border-radius: 999px;
  background: var(--danger);
  color: var(--danger-text);
  cursor: pointer;
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
}

.preview-remove:hover {
  background: var(--danger-hover);
}

.rules-box {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
  background: var(--bg);
}

.rules-box h3 {
  margin-top: 0;
}

.rules-box ul {
  margin: 0 0 14px;
  padding-left: 20px;
}

.rules-accept {
  display: flex;
  gap: 8px;
  align-items: center;
  font-weight: 700;
}

.gallery-section {
  margin-top: 20px;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.gallery-header h2 {
  margin: 0;
}

.category-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.category-filter select {
  width: auto;
  min-width: 170px;
}

.gallery {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 20px;
}

.empty-gallery {
  color: var(--text-muted);
  font-style: italic;
}

.item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
}

.post-preview {
  width: 100%;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  text-align: left;
}

.post-preview img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.post-preview strong {
  display: block;
  padding: 12px 12px 4px;
  font-size: 16px;
}

.category {
  margin: 0;
  padding: 0 12px 14px;
  color: var(--text-muted);
  font-size: 13px;
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

.new-post-backdrop,
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 150;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
}

.new-post-modal,
.modal {
  position: relative;
  width: min(720px, 100%);
  max-height: 90vh;
  overflow: auto;
  background: var(--bg-surface);
  color: var(--text);
  border-radius: 18px;
  padding: 24px;
  text-align: left;
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0 0 3px;
  border: 0;
  border-radius: 999px;
  background: var(--danger);
  color: var(--danger-text);
  cursor: pointer;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.modal-main-image {
  width: 100%;
  max-height: 360px;
  object-fit: cover;
  border-radius: 14px;
  margin-bottom: 16px;
}

.modal-category {
  color: var(--text-muted);
  font-weight: 700;
}

.modal-description {
  white-space: pre-wrap;
  line-height: 1.6;
}

.modal-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
  margin: 20px 0;
}

.modal-images img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid var(--border);
}

.owner-info {
  border-top: 1px solid var(--border);
  margin-top: 20px;
  padding-top: 16px;
}

.modal-delete-btn {
  background: var(--danger);
  color: var(--danger-text);
  border: 0;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 700;
  margin-top: 10px;
}

.up-top {
  z-index: 3;
  margin-top: -70px;
}
</style>