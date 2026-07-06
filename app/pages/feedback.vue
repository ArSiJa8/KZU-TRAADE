<template>
  <div class="feedback-container">
    <div class="feedback-card glass-panel">

      <!-- Erfolgs-Zustand -->
      <div v-if="submitted" class="success-state">
        <div class="success-icon">✅</div>
        <h2>Danke für dein Feedback!</h2>
        <p>Wir haben deine Nachricht erhalten und melden uns bei Bedarf bei dir.</p>
      </div>

      <!-- Formular -->
      <template v-else>
        <h1>💬 Feedback geben</h1>
        <p class="subtitle">
          Hast du einen Bug entdeckt, eine Idee oder Anmerkungen?<br>
          Wir freuen uns über jede Rückmeldung.
        </p>

        <div v-if="errorMsg" class="error-banner" role="alert">
          {{ errorMsg }}
        </div>

        <form class="form" @submit.prevent="submitFeedback">
          <!-- Name -->
          <div class="form-group">
            <label for="fb-name">
              Name <span class="optional">(optional)</span>
            </label>
            <input
              id="fb-name"
              v-model="form.name"
              type="text"
              placeholder="Dein Name"
              autocomplete="name"
            />
          </div>

          <!-- E-Mail -->
          <div class="form-group">
            <label for="fb-email">
              E-Mail <span class="required">*</span>
            </label>
            <input
              id="fb-email"
              v-model="form.email"
              type="email"
              placeholder="deine@email.ch"
              required
              autocomplete="email"
            />
          </div>

          <!-- Typ -->
          <div class="form-group">
            <label for="fb-category">
              Typ <span class="required">*</span>
            </label>
            <select id="fb-category" v-model="form.category" required>
              <option value="">-- Bitte wählen --</option>
              <option value="bug">🐛 Bug melden</option>
              <option value="feature">✨ Feature-Wunsch</option>
              <option value="design">🎨 Design-Feedback</option>
              <option value="general">💬 Allgemeines Feedback</option>
            </select>
          </div>

          <!-- Nachricht -->
          <div class="form-group">
            <label for="fb-message">
              Nachricht <span class="required">*</span>
              <span class="char-hint" :class="{ valid: form.message.length >= 20 }">
                {{ form.message.length }} / min. 20
              </span>
            </label>
            <textarea
              id="fb-message"
              v-model="form.message"
              placeholder="Beschreibe deinen Bug, deinen Wunsch oder deine Anmerkung…"
              rows="6"
              required
            ></textarea>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="spinner" aria-hidden="true" />
            {{ loading ? 'Wird gesendet…' : 'Feedback senden' }}
          </button>
        </form>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
const form = ref({
  name: '',
  email: '',
  category: '',
  message: ''
})

const loading = ref(false)
const errorMsg = ref('')
const submitted = ref(false)

async function submitFeedback() {
  errorMsg.value = ''

  if (!form.value.email || !form.value.category || !form.value.message) {
    errorMsg.value = 'Bitte fülle alle Pflichtfelder aus.'
    return
  }

  if (form.value.message.length < 20) {
    errorMsg.value = 'Die Nachricht muss mindestens 20 Zeichen lang sein.'
    return
  }

  loading.value = true

  try {
    await $fetch('/api/feedback', {
      method: 'POST',
      body: {
        name: form.value.name,
        email: form.value.email,
        category: form.value.category,
        message: form.value.message
      }
    })

    submitted.value = true
  } catch (err: any) {
    const status = err.status ?? err.statusCode ?? err.response?.status
    if (status === 429) {
      errorMsg.value = 'Du hast zu viele Feedbacks gesendet. Bitte warte eine Stunde.'
    } else {
      errorMsg.value =
        err.data?.statusMessage ??
        err.statusMessage ??
        err.message ??
        'Ein Fehler ist aufgetreten. Bitte versuche es erneut.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ── Layout ──────────────────────────────────────────────── */
.feedback-container {
  min-height: 100vh;
  padding: 80px 20px;
  background-color: var(--background);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.feedback-card {
  padding: 44px 40px;
  max-width: 620px;
  width: 100%;
}

/* ── Heading ─────────────────────────────────────────────── */
h1 {
  margin: 0 0 10px;
  color: var(--neutral-100);
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  text-align: center;
}

.subtitle {
  margin: 0 0 32px;
  color: var(--text-muted);
  font-size: 0.95rem;
  text-align: center;
  line-height: 1.6;
}

/* ── Error banner ────────────────────────────────────────── */
.error-banner {
  margin-bottom: 24px;
  padding: 12px 16px;
  border: 1px solid var(--danger);
  border-radius: 12px;
  background: color-mix(in srgb, var(--danger) 12%, transparent);
  color: var(--red-300);
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.5;
}

/* ── Form ────────────────────────────────────────────────── */
.form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 14px;
  color: var(--text-main);
  margin-left: 2px;
}

.required {
  color: var(--danger);
  font-weight: 700;
}

.optional {
  color: var(--text-muted);
  font-weight: 400;
  font-size: 12px;
}

.char-hint {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  transition: color 0.25s ease;
}

.char-hint.valid {
  color: var(--success);
}

/* ── Inputs ──────────────────────────────────────────────── */
.form-group input,
.form-group textarea,
.form-group select {
  padding: 13px 15px;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  background-color: color-mix(in srgb, var(--neutral-900) 30%, transparent);
  color: var(--neutral-100);
  transition:
    border-color 0.25s ease,
    background-color 0.25s ease,
    box-shadow 0.25s ease;
}

.form-group select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 40px;
}

.form-group select option {
  background: var(--bg-surface);
  color: var(--neutral-100);
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
  min-height: 130px;
  line-height: 1.6;
}

/* ── Submit button ───────────────────────────────────────── */
.submit-btn {
  margin-top: 8px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Success state ───────────────────────────────────────── */
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0 8px;
  text-align: center;
}

.success-icon {
  font-size: 52px;
  line-height: 1;
}

.success-state h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--neutral-100);
  letter-spacing: -0.02em;
}

.success-state p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 380px;
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 600px) {
  .feedback-card {
    padding: 28px 22px;
  }

  h1 {
    font-size: 22px;
  }
}
</style>
