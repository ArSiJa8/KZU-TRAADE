<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const role = useState<'admin' | 'user' | null>('authRole')
const stats = ref<{
  totalViews: number
  onlineCount: number
  users: Array<{
    ip: string
    login?: string
    id: string
    lastSeen: number
  }>
} | null>(null)

const blocklist = ref<string[]>([])
const newWord = ref('')
const redirectUrl = ref('')
const loading = ref(false)
const error = ref('')

async function fetchStats() {
  loading.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('token')
    const data = await $fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    stats.value = data as any
  } catch (e: any) {
    error.value = e.data?.statusMessage || e.message || 'Fehler beim Laden der Stats'
  } finally {
    loading.value = false
  }
}

async function fetchBlocklist() {
  try {
    const token = localStorage.getItem('token')
    const res = await $fetch<{ words: string[] }>('/api/admin/blocklist', {
      headers: { Authorization: `Bearer ${token}` }
    })
    blocklist.value = res.words
  } catch (e: any) {
    console.error('Fehler beim Laden der Blocklist', e)
  }
}

async function addWord() {
  if (!newWord.value.trim()) return
  const word = newWord.value.trim().toLowerCase()
  if (blocklist.value.includes(word)) {
    newWord.value = ''
    return
  }
  
  const newList = [...blocklist.value, word]
  await saveBlocklist(newList)
  newWord.value = ''
}

async function removeWord(word: string) {
  const newList = blocklist.value.filter(w => w !== word)
  await saveBlocklist(newList)
}

async function saveBlocklist(words: string[]) {
  try {
    const token = localStorage.getItem('token')
    await $fetch('/api/admin/blocklist', {
      method: 'POST',
      body: { words },
      headers: { Authorization: `Bearer ${token}` }
    })
    blocklist.value = words
  } catch (e: any) {
    alert('Fehler beim Speichern: ' + (e.data?.statusMessage || e.message))
  }
}

async function sendRedirect(targetId?: string) {
  const url = targetId ? prompt('URL für diesen Nutzer eingeben:', 'https://google.com') : redirectUrl.value
  if (!url) return
  
  try {
    const token = localStorage.getItem('token')
    await $fetch('/api/admin/stats', {
      method: 'POST',
      body: { url, targetId },
      headers: { Authorization: `Bearer ${token}` }
    })
    alert(targetId ? 'Nutzer umgeleitet!' : 'Alle umgeleitet!')
    if (!targetId) redirectUrl.value = ''
  } catch (e: any) {
    alert('Fehler: ' + (e.data?.statusMessage || e.message))
  }
}

let interval: any = null

onMounted(() => {
  if (role.value === 'admin') {
    fetchStats()
    fetchBlocklist()
    interval = setInterval(fetchStats, 5000) // Auto-refresh every 5s
  }
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <div class="admin-container">
    <div v-if="role !== 'admin'" class="no-access">
      <h1>Zugriff verweigert</h1>
      <p>Bitte logge dich als Admin ein.</p>
      <NuxtLink to="/" class="back-link">Zurück zur Startseite</NuxtLink>
    </div>

    <div v-else class="admin-dashboard">
      <header class="admin-header">
        <h1>Admin Dashboard</h1>
        <button class="reload-btn" @click="fetchStats" :disabled="loading">
          {{ loading ? 'Lädt...' : 'Reload' }}
        </button>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Views</h3>
          <p class="stat-value">{{ stats?.totalViews || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Online Users</h3>
          <p class="stat-value">{{ stats?.onlineCount || 0 }}</p>
        </div>
      </div>

      <section class="blocklist-section">
        <h2>Wörter Blockliste</h2>
        <div class="blocklist-form">
          <input 
            v-model="newWord" 
            type="text" 
            placeholder="Neues Schimpfwort..." 
            class="url-input"
            @keyup.enter="addWord"
          >
          <button class="add-btn" @click="addWord">Hinzufügen</button>
        </div>
        <div class="words-container">
          <span v-for="word in blocklist" :key="word" class="word-tag">
            {{ word }}
            <button class="remove-word" @click="removeWord(word)">×</button>
          </span>
          <p v-if="blocklist.length === 0" class="empty-msg">Keine Wörter auf der Liste.</p>
        </div>
      </section>

      <section class="redirect-section">
        <h2>Nutzer umleiten</h2>
        <div class="redirect-form">
          <input 
            v-model="redirectUrl" 
            type="url" 
            placeholder="https://google.com" 
            class="url-input"
          >
          <button class="redirect-btn" @click="() => sendRedirect()">Alle umleiten</button>
        </div>
      </section>

      <section class="users-section">
        <h2>Online Nutzer Liste</h2>
        <div v-if="error" class="error-msg">{{ error }}</div>
        <div class="table-wrapper">
          <table class="users-table">
            <thead>
              <tr>
                <th>IP Adresse</th>
                <th>Login / Name</th>
                <th>Status</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in stats?.users" :key="user.id">
                <td>{{ user.ip }}</td>
                <td>{{ user.login || 'Gast' }}</td>
                <td><span class="status-online">Online</span></td>
                <td>
                  <button class="small-redirect-btn" @click="() => sendRedirect(user.id)">Senden</button>
                </td>
              </tr>
              <tr v-if="!stats?.users || stats.users.length === 0">
                <td colspan="3" class="empty-cell">Keine Nutzer online</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  padding: 80px 20px;
  max-width: 1000px;
  margin: 0 auto;
  min-height: 80vh;
}

.no-access {
  text-align: center;
  padding-top: 100px;
}

.back-link {
  display: inline-block;
  margin-top: 20px;
  color: var(--blue-400);
}

.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reload-btn {
  padding: 8px 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  padding: 24px;
  border-radius: 16px;
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 10px 0 0;
  color: var(--blue-400);
}

.blocklist-section {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  padding: 24px;
  border-radius: 16px;
}

.blocklist-form {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  margin-bottom: 20px;
}

.add-btn {
  padding: 12px 24px;
  background: var(--blue-600);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.words-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.word-tag {
  background: var(--bg-input);
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.remove-word {
  background: none;
  border: none;
  color: var(--red-500);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.empty-msg {
  color: var(--neutral-400);
  font-style: italic;
}

.redirect-section {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  padding: 24px;
  border-radius: 16px;
}

.redirect-form {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.url-input {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-input);
  color: var(--neutral-700);
}

.redirect-btn {
  padding: 12px 24px;
  background: var(--red-600);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.users-table th, .users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.status-online {
  color: #10b981;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-online::before {
  content: '';
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 50%;
}

.empty-cell {
  text-align: center;
  padding: 40px;
  color: var(--neutral-400);
}

.error-msg {
  color: var(--red-500);
  margin-bottom: 10px;
}

.table-wrapper {
  overflow-x: auto;
}

.small-redirect-btn {
  padding: 6px 12px;
  background: var(--blue-600);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.small-redirect-btn:hover {
  background: var(--blue-500);
}
</style>