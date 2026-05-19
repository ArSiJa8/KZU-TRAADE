<template>
  <div class="create-post-container">
    <div class="create-post-card">
      <h1>📝 Neuen Post erstellen</h1>

      <!-- Fehler anzeigen -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Erfolgs-Nachricht -->
      <div v-if="success" class="success-message">
        ✅ Post erfolgreich erstellt!
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
    const response = await $fetch('/api/create-post', {
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
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.create-post-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  padding: 40px;
  max-width: 600px;
  width: 100%;
}

h1 {
  margin: 0 0 30px;
  color: #333;
  font-size: 28px;
  text-align: center;
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
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  background-color: #f9f9ff;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.submit-btn {
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee;
  border: 2px solid #f66;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 20px;
}

.success-message {
  background-color: #efe;
  border: 2px solid #6f6;
  color: #3c3;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 20px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
