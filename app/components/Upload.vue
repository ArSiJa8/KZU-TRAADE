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
          <div class="item-image-wrapper">
            <button class="post-preview" type="button" @click="selectedPost = post; loadMessages(post.id)">
              <img :src="`/uploads/${post.mainImage}`" alt="Tauschangebot">
            </button>
          </div>

          <div class="item-content">
            <button class="post-title-btn" type="button" @click="selectedPost = post; loadMessages(post.id)">
              <strong>{{ post.title }}</strong>
            </button>

            <p class="category-badge">
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
          </div>
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
      <section class="modal modal-with-chat">
        <button class="close-btn" type="button" @click="selectedPost = null">
          ×
        </button>

        <div class="modal-content-wrapper">
          <div class="modal-left">
            <button class="image-zoom-btn" @click="fullscreenImage = `/uploads/${selectedPost.mainImage}`">
              <img :src="`/uploads/${selectedPost.mainImage}`" class="modal-main-image" alt="Hauptbild">
            </button>

            <h2>{{ selectedPost.title }}</h2>

            <p class="modal-category">
              {{ selectedPost.category }}
            </p>

            <p class="modal-description">
              {{ selectedPost.description }}
            </p>

            <div v-if="selectedPost.images.length > 1" class="modal-images">
              <button
                  v-for="image in selectedPost.images"
                  :key="image"
                  class="image-zoom-btn thumb"
                  @click="fullscreenImage = `/uploads/${image}`"
              >
                <img
                    :src="`/uploads/${image}`"
                    alt="Weiteres Bild"
                >
              </button>
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
          </div>

          <!-- Chat Section -->
          <div class="modal-right">
            <div class="chat-header">
              <h3>💬 Verhandlungen</h3>
              <p class="chat-info">{{ messages.length }} Nachrichten</p>
            </div>

            <div class="chat-messages" ref="messagesContainer">
              <div v-if="messages.length === 0" class="no-messages">
                <p>Noch keine Nachrichten. Sei der Erste!</p>
              </div>

              <div v-for="msg in messages" :key="msg.id" class="message" :class="{ own: msg.authorEmail === login }">
                <div class="message-author">
                  <strong>{{ msg.author }}</strong>
                  <span class="message-time">{{ formatTime(msg.createdAt) }}</span>
                </div>
                <div class="message-content">{{ msg.content }}</div>
              </div>
            </div>

            <div v-if="!token" class="login-required">
              <p>Bitte <strong>einloggen</strong>, um zu verhandeln</p>
            </div>

            <form v-else class="chat-form" @submit.prevent="sendMessage">
              <input
                  v-model="newMessage"
                  type="text"
                  placeholder="Deine Nachricht..."
                  maxlength="2000"
                  :disabled="isSending"
              >
              <button type="submit" :disabled="isSending || !newMessage.trim()">
                {{ isSending ? 'Wird gesendet...' : 'Senden' }}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>

    <!-- Fullscreen Image Viewer -->
    <div
        v-if="fullscreenImage"
        class="fullscreen-overlay"
        role="button"
        tabindex="0"
        @click="fullscreenImage = null"
        @keydown.esc="fullscreenImage = null"
    >
      <button class="close-fullscreen" @click="fullscreenImage = null">×</button>
      <img :src="fullscreenImage" class="fullscreen-image" alt="Vollbild">
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

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

type Message = {
  id: string
  postId: string
  author: string
  authorEmail: string
  content: string
  createdAt: string
}

type UploadResult = ApiResult & {
  post?: TradePost
}

type PostsResult = ApiResult & {
  posts?: TradePost[]
}

type MessagesResult = ApiResult & {
  messages?: Message[]
  message?: Message
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
const fullscreenImage = ref<string | null>(null)

// Chat related
const messages = ref<Message[]>([])
const newMessage = ref('')
const isSending = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

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
let messagesPollingInterval: ReturnType<typeof setInterval> | null = null

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

  if (messagesPollingInterval) {
    clearInterval(messagesPollingInterval)
  }

  clearPreviews()
})

// Scroll to bottom when messages update
watch(messages, () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 0)
})

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'gerade eben'
  if (diffMins < 60) return `vor ${diffMins}m`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `vor ${diffHours}h`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `vor ${diffDays}d`

  return date.toLocaleDateString('de-DE')
}

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
    console.error('Upload error:', err)
    
    let message = 'Ein Fehler ist aufgetreten'
    
    if (err.status === 413) {
      message = 'Die hochgeladenen Bilder sind insgesamt zu groß für den Server (max. 100MB gesamt).'
    } else {
      message = err.data?.statusMessage || err.statusMessage || err.message || message
    }
    
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

// Chat functions
async function loadMessages(postId: string) {
  try {
    const res = await $fetch<MessagesResult>('/api/messages', {
      query: { postId }
    })

    if (res.messages) {
      messages.value = res.messages
    }

    // Start polling for new messages
    if (messagesPollingInterval) {
      clearInterval(messagesPollingInterval)
    }

    messagesPollingInterval = setInterval(async () => {
      try {
        const updated = await $fetch<MessagesResult>('/api/messages', {
          query: { postId }
        })
        if (updated.messages) {
          messages.value = updated.messages
        }
      } catch (err) {
        console.error('Error polling messages:', err)
      }
    }, 1000) // Poll every second for new messages
  } catch (err: any) {
    console.error('Error loading messages:', err)
  }
}

async function sendMessage() {
  if (!token.value || !selectedPost.value || !newMessage.value.trim()) {
    return
  }

  isSending.value = true

  try {
    const res = await $fetch<MessagesResult>('/api/messages', {
      method: 'POST',
      body: {
        postId: selectedPost.value.id,
        content: newMessage.value.trim()
      },
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (res.error) {
      alert(res.error)
      return
    }

    newMessage.value = ''
    await loadMessages(selectedPost.value.id)
  } catch (err: any) {
    const message = err.data?.statusMessage || err.statusMessage || err.message || 'Fehler beim Senden'
    alert(`Nachricht konnte nicht gesendet werden: ${message}`)
  } finally {
    isSending.value = false
  }
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
  margin-bottom: 24px;
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.empty-gallery {
  color: var(--text-muted);
  font-style: italic;
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
}

.item {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.item:hover {
  border-color: var(--accent);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.item-image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 0;
}

.post-preview {
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.post-preview:hover img {
  transform: scale(1.05);
}

.item-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-title-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  color: var(--text);
}

.post-title-btn strong {
  display: block;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  transition: color 0.2s;
}

.post-title-btn:hover strong {
  color: var(--accent);
}

.category-badge {
  margin: 0;
  padding: 6px 10px;
  background-color: var(--bg);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid var(--border);
}

.delete-btn {
  align-self: flex-start;
  background: var(--danger);
  color: var(--danger-text);
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
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

.modal-with-chat {
  width: min(1200px, 100%);
  padding: 0;
  overflow: hidden;
  display: flex;
}

.modal-content-wrapper {
  display: flex;
  gap: 0;
  width: 100%;
  height: 100%;
  max-height: 90vh;
}

.modal-left {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  border-right: 1px solid var(--border);
}

.modal-right {
  width: 350px;
  display: flex;
  flex-direction: column;
  background-color: var(--bg);
  overflow: hidden;
}

.new-post-modal {
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
  z-index: 10;
}

.modal-main-image {
  width: 100%;
  max-height: 360px;
  object-fit: contain;
  border-radius: 14px;
  margin-bottom: 16px;
  background-color: var(--bg);
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

.image-zoom-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: zoom-in;
  width: 100%;
  display: block;
  border-radius: 14px;
  overflow: hidden;
  transition: opacity 0.2s;
}

.image-zoom-btn:hover {
  opacity: 0.9;
}

.image-zoom-btn.thumb {
  height: 100px;
  border-radius: 10px;
  border: 1px solid var(--border);
}

.image-zoom-btn img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background-color: var(--bg);
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

/* Chat styles */
.chat-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  background-color: var(--bg-surface);
}

.chat-header h3 {
  margin: 0 0 4px;
  font-size: 16px;
}

.chat-info {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.no-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  text-align: center;
}

.message {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 8px;
  background-color: var(--bg);
  border: 1px solid var(--border);
}

.message.own {
  background-color: var(--accent);
  color: white;
  border-color: var(--accent);
  align-self: flex-end;
  max-width: 85%;
}

.message-author {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.message-author strong {
  font-weight: 700;
  font-size: 13px;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.message-content {
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.4;
}

.login-required {
  padding: 16px;
  text-align: center;
  color: var(--text-muted);
  border-top: 1px solid var(--border);
}

.chat-form {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--border);
  background-color: var(--bg-surface);
}

.chat-form input {
  flex: 1;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--background);
  color: var(--text-main);
  font: inherit;
  font-size: 13px;
}

.chat-form input:disabled {
  opacity: 0.6;
}

.chat-form button {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.chat-form button:hover:not(:disabled) {
  opacity: 0.9;
}

.up-top {
  z-index: 3;
  margin-top: 20px;
}

.fullscreen-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.95);
  display: grid;
  place-items: center;
  padding: 40px;
  cursor: zoom-out;
}

.fullscreen-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
}

.close-fullscreen {
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 210;
}

.close-fullscreen:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* Responsive design */
@media (max-width: 900px) {
  .modal-with-chat {
    flex-direction: column;
  }

  .modal-left {
    border-right: none;
    border-bottom: 1px solid var(--border);
    max-height: 50%;
  }

  .modal-right {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .gallery {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  .item-image-wrapper {
    height: 180px;
  }

  .item-content {
    padding: 14px;
    gap: 10px;
  }

  .post-title-btn strong {
    font-size: 15px;
  }

  .modal-left {
    padding: 16px;
  }

  .chat-form input {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .gallery {
    grid-template-columns: 1fr;
  }

  .item-image-wrapper {
    height: 200px;
  }

  .gallery-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .category-filter {
    width: 100%;
  }

  .category-filter select {
    flex: 1;
    min-width: unset;
  }

  .modal {
    width: 100% !important;
    max-height: 100vh;
    border-radius: 0;
    padding: 0;
  }

  .modal-content-wrapper {
    flex-direction: column;
  }

  .modal-left {
    max-height: none;
    border-right: none;
    border-bottom: 1px solid var(--border);
    overflow-y: auto;
    max-height: 50%;
  }

  .modal-right {
    width: 100%;
  }
}
</style>
