<script setup lang="ts">
import { ref, computed } from 'vue'

interface User {
  id: string
  login: string
}

interface TradeData {
  tradeId?: string
  itemTitle?: string
  partnerLogin?: string
}

const token = useState<string | null>('authToken', () => null)
const loginName = useState<string | null>('authLogin', () => null)

const isOpen = ref(false)
const selectedPartner = ref<User | null>(null)
const isLoading = ref(false)
const error = ref('')
const success = ref(false)
const availableUsers = ref<User[]>([])

const itemTitle = ref('')
const itemDescription = ref('')

const isFormValid = computed(() => {
  return itemTitle.value.trim() && selectedPartner.value && loginName.value
})

async function openModal() {
  if (!token.value) {
    error.value = 'Du musst eingeloggt sein'
    return
  }
  
  isOpen.value = true
  selectedPartner.value = null
  itemTitle.value = ''
  itemDescription.value = ''
  error.value = ''
  success.value = false
  
  // Lade verfügbare Benutzer
  await fetchUsers()
}

async function fetchUsers() {
  try {
    const res = await $fetch<{ users: User[] }>('/api/users/available', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    availableUsers.value = res.users.filter(u => u.login !== loginName.value)
  } catch (e: any) {
    error.value = 'Fehler beim Laden der Benutzer'
  }
}

async function completeTradeOld() {
  if (!isFormValid.value) return
  
  isLoading.value = true
  error.value = ''
  success.value = false
  
  try {
    const res = await $fetch<{
      success: boolean
      message?: string
      points?: number
      spinData?: any
    }>('/api/trades/complete', {
      method: 'POST',
      body: {
        itemTitle: itemTitle.value,
        itemDescription: itemDescription.value,
        partnerLogin: selectedPartner.value?.login,
        partnerId: selectedPartner.value?.id
      },
      headers: { Authorization: `Bearer ${token.value}` }
    })
    
    if (res.success) {
      success.value = true
      // Hier könnte man später das Glücksrad starten
      setTimeout(() => {
        isOpen.value = false
        itemTitle.value = ''
        itemDescription.value = ''
        selectedPartner.value = null
      }, 2000)
    } else {
      error.value = res.message || 'Fehler beim Abschließen des Handels'
    }
  } catch (e: any) {
    error.value = e.data?.statusMessage || e.message || 'Fehler bei der Anfrage'
  } finally {
    isLoading.value = false
  }
}

function closeModal() {
  isOpen.value = false
  selectedPartner.value = null
  itemTitle.value = ''
  itemDescription.value = ''
  error.value = ''
  success.value = false
}

defineExpose({
  openModal
})
</script>

<template>
  <div>
    <button
      class="trade-completion-btn"
      type="button"
      @click="openModal"
      aria-label="Handel abschließen"
    >
      ✓ Handel abgeschlossen
    </button>

    <div
      v-if="isOpen"
      class="trade-completion-backdrop"
      role="button"
      tabindex="0"
      @click.self="closeModal"
      @keydown.esc="closeModal"
    >
      <section class="trade-completion-modal">
        <button class="close-btn" type="button" @click="closeModal">
          ×
        </button>

        <h2>Handel abschließen</h2>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          ✓ Handel erfolgreich abgeschlossen! Beide Spieler erhalten Punkte!
        </div>

        <form v-if="!success" @submit.prevent="completeTradeOld" class="trade-form">
          <!-- Artikel-Titel -->
          <div class="form-group">
            <label for="item-title">Was wurde getauscht? *</label>
            <input
              id="item-title"
              v-model="itemTitle"
              type="text"
              maxlength="100"
              placeholder="z.B. Geodreieck, Notizbuch, ..."
              required
            />
          </div>

          <!-- Artikel-Beschreibung (optional) -->
          <div class="form-group">
            <label for="item-description">Beschreibung (Optional)</label>
            <textarea
              id="item-description"
              v-model="itemDescription"
              maxlength="300"
              rows="3"
              placeholder="Weitere Informationen zum Tausch..."
            />
          </div>

          <!-- Partner-Auswahl -->
          <div class="form-group">
            <label for="partner-select">Handelspartner * </label>
            <select
              id="partner-select"
              v-model="selectedPartner"
              required
              class="partner-select"
            >
              <option :value="null" disabled>
                Wähle deinen Handelspartner
              </option>
              <option
                v-for="user in availableUsers"
                :key="user.id"
                :value="user"
              >
                {{ user.login }}
              </option>
            </select>
          </div>

          <!-- Buttons -->
          <div class="form-actions">
            <button
              type="button"
              class="btn-secondary"
              @click="closeModal"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="!isFormValid || isLoading"
            >
              {{ isLoading ? 'Wird verarbeitet...' : 'Handel abschließen' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.trade-completion-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.trade-completion-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.trade-completion-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.trade-completion-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.trade-completion-modal {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #000;
}

h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: #333;
  text-align: center;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  border-left: 4px solid #c62828;
}

.success-message {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  border-left: 4px solid #2e7d32;
  font-weight: 600;
}

.trade-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.partner-select {
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.btn-primary {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}
</style>
