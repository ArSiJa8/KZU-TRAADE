<template>
  <div class="create-post-container">
    <div class="create-post-card glass-panel">
      <h1>📝 Neuen Post erstellen</h1>

      <!-- Fehler anzeigen -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Erfolgs-Nachricht -->
      <div v-if="success" class="success-message">
        Post erfolgreich erstellt!
      </div>

      <form @submit.prevent="submitPost" class="form">
        <!-- Titel -->
        <div class="form-group">
          <label for="title">Titel *</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="z.B. Neue Galerie-Funktion"
            required
          />
        </div>

        <!-- Beschreibung -->
        <div class="form-group">
          <label for="description">Beschreibung *</label>
          <textarea
            id="description"
            v-model="form.description"
            placeholder="Erkläre deine Idee oder das Problem..."
            rows="5"
            required
          ></textarea>
        </div>

        <!-- Kategorie -->
        <div class="form-group">
          <label for="category">Kategorie *</label>
          <select id="category" v-model="form.category" required>
            <option value="">-- Wähle eine Kategorie --</option>
            <option value="feature">✨ Feature (Neue Funktion)</option>
            <option value="bug">🐛 Bug (Fehler)</option>
            <option value="design">🎨 Design (Optik/UX)</option>
            <option value="other">📌 Sonstiges</option>
          </select>
        </div>

        <!-- NEUE WÜNSCHE SECTION -->
        <div class="form-group">
          <label for="wishes">💡 Deine Wünsche (Optional)</label>
          <textarea
            id="wishes"
            v-model="form.wishes"
            placeholder="Was wünschst du dir noch? Z.B. dunkler Modus, schnellere Ladezeiten, etc."
            rows="3"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Wird erstellt...' : 'Post erstellen' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  title: '',
  description: '',
  category: '',
  wishes: '' // Neues Feld
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

async function submitPost() {
  error.value = ''
  success.value = false

  if (!form.value.title || !form.value.description || !form.value.category) {
    error.value = 'Bitte fülle alle Pflichtfelder aus'
    return
  }

  loading.value = true

  try {
    const response = await $fetch<any>('/api/create-post', {
      method: 'POST',
      body: {
        title: form.value.title,
        description: form.value.description,
        category: form.value.category,
        wishes: form.value.wishes // Sende Wünsche
      }
    })

    if (response.success) {
      success.value = true
      // Form zurücksetzen
      form.value = {
        title: '',
        description: '',
        category: '',
        wishes: ''
      }
      // Nach 2 Sekunden Nachricht ausblenden
      setTimeout(() => {
        success.value = false
      }, 2000)
    } else {
      error.value = response.error || 'Fehler beim Erstellen des Posts'
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Ein Fehler ist aufgetreten'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-post-container {
  min-height: 100vh;
  padding: 80px 20px;
  background-color: var(--background);
  display: flex;
  justify-content: center;
  align-items: center;
}

.create-post-card {
  padding: 40px;
  max-width: 600px;
  width: 100%;
}

h1 {
  margin: 0 0 32px;
  color: var(--neutral-100);
  font-size: 28px;
  text-align: center;
  letter-spacing: -0.02em;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 700;
  color: var(--neutral-200);
  font-size: 14px;
  margin-left: 4px;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  background-color: color-mix(in srgb, var(--neutral-900) 30%, transparent);
  color: var(--neutral-100);
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent);
  background-color: color-mix(in srgb, var(--neutral-900) 50%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 15%, transparent);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.submit-btn {
  margin-top: 12px;
  width: 100%;
}

@media (max-width: 600px) {
  .create-post-card {
    padding: 24px;
  }

  h1 {
    font-size: 24px;
  }
}
</style>
