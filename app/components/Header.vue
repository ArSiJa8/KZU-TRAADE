<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

type ApiResult = {
  success?: boolean
  error?: string
}

type LoginResult = ApiResult & {
  token?: string
  role?: 'admin' | 'user'
  login?: string
}

const token = useState<string | null>('authToken', () => null)
const role = useState<'admin' | 'user' | null>('authRole', () => null)
const loginName = useState<string | null>('authLogin', () => null)
const newPostOpen = useState('newPostOpen', () => false)

const menuOpen = ref(false)
const authOpen = ref(false)
const authMode = ref<'login' | 'register'>('login')

const loginValue = ref('')
const email = ref('')
const password = ref('')

const authError = ref('')
const errorShake = ref(false)

const isLoggedIn = computed(() => Boolean(token.value))

onMounted(() => {
  token.value = localStorage.getItem('token')
  role.value = localStorage.getItem('role') as 'admin' | 'user' | null
  loginName.value = localStorage.getItem('login')
})

function closeMenus() {
  menuOpen.value = false
  authOpen.value = false
  clearAuthError()
}

function clearAuthError() {
  authError.value = ''
  errorShake.value = false
}

function showAuthError(message: string) {
  authError.value = message
  errorShake.value = false

  requestAnimationFrame(() => {
    errorShake.value = true
  })
}

async function register() {
  clearAuthError()

  const res = await $fetch<ApiResult>('/api/register', {
    method: 'POST',
    body: {
      email: email.value,
      password: password.value
    }
  })

  if (res.error) {
    showAuthError(res.error)
    return
  }

  alert('Registrierung erfolgreich. Du kannst dich jetzt einloggen.')

  loginValue.value = email.value
  email.value = ''
  password.value = ''
  authMode.value = 'login'
}

async function login() {
  clearAuthError()

  const res = await $fetch<LoginResult>('/api/login', {
    method: 'POST',
    body: {
      login: loginValue.value,
      password: password.value
    }
  })

  if (res.error) {
    showAuthError(res.error)
    return
  }

  if (!res.token || !res.role || !res.login) {
    showAuthError('Keine vollständigen Login-Daten erhalten')
    return
  }

  token.value = res.token
  role.value = res.role
  loginName.value = res.login

  localStorage.setItem('token', res.token)
  localStorage.setItem('role', res.role)
  localStorage.setItem('login', res.login)

  loginValue.value = ''
  password.value = ''
  authOpen.value = false
  menuOpen.value = false
}

function openNewPost() {
  newPostOpen.value = true
  menuOpen.value = false
  authOpen.value = false
}

function logout() {
  token.value = null
  role.value = null
  loginName.value = null
  newPostOpen.value = false

  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('login')

  closeMenus()
}
</script>

<template>
  <header class="site-header">
    <NuxtLink to="/" class="logo" @click="closeMenus">
      KZU Trade
    </NuxtLink>

    <button
        class="hamburger"
        type="button"
        aria-label="Menü öffnen"
        @click="menuOpen = !menuOpen"
    >
      <span />
      <span />
      <span />
    </button>

    <div :class="['header-content', { open: menuOpen }]">
      <nav class="nav">
        <NuxtLink to="/" @click="closeMenus">
          Home
        </NuxtLink>



        <a href="#gallery" @click="closeMenus">
          Galerie
        </a>

        <a href="#about" @click="closeMenus">
          Über uns
        </a>

        <button class="nav-button" type="button" @click="openNewPost">
          Neuer Post
        </button>
      </nav>

      <div class="auth-area">
        <template v-if="isLoggedIn">
          <span class="user-badge">
            {{ role === 'admin' ? 'Admin' : 'User' }}
          </span>

          <button class="logout-btn" type="button" @click="logout">
            Logout
          </button>
        </template>

        <template v-else>
          <button
              class="login-toggle"
              type="button"
              @click="authOpen = !authOpen"
          >
            Login
          </button>

          <div v-if="authOpen" class="auth-panel">
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
                  placeholder="admin oder E-Mail@kzu.ch"
                  @input="clearAuthError"
                  @keyup.enter="login"
              >

              <input
                  v-model="password"
                  type="password"
                  placeholder="Passwort"
                  @input="clearAuthError"
                  @keyup.enter="login"
              >

              <button type="button" @click="login">
                Einloggen
              </button>
            </template>

            <template v-else>
              <input
                  v-model="email"
                  type="email"
                  placeholder="E-Mail@kzu.ch"
                  @input="clearAuthError"
                  @keyup.enter="register"
              >

              <input
                  v-model="password"
                  type="password"
                  placeholder="Passwort"
                  @input="clearAuthError"
                  @keyup.enter="register"
              >

              <button type="button" @click="register">
                Account erstellen
              </button>
            </template>

            <p
                v-if="authError"
                :class="['auth-error', { shake: errorShake }]"
            >
              {{ authError }}
            </p>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  height: 40px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 14px clamp(18px, 4vw, 56px);
  background: color-mix(in srgb, var(--background) 82%, transparent);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(25px) saturate(180%);
}

.logo {
  color: var(--neutral-100);
  text-decoration: none;
  font-size: clamp(1.25rem, 2vw, 1.8rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  mix-blend-mode: difference;
  isolation: isolate;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 28px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 18px;
}

.nav a,
.nav-button {
  color: var(--neutral-200);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.nav-button {
  padding: 8px 14px;
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: 1px solid var(--blue-500);
  border-radius: 15px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.nav a:hover {
  color: var(--neutral-100);
}

.nav-button:hover {
  color: var(--btn-primary-text);
  background: var(--btn-primary-hover);
  border-color: var(--blue-400);
  transform: translateY(-1px);
}

.auth-area {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-badge {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--neutral-100);
  background: var(--bg-surface);
  font-size: 0.9rem;
  font-weight: 700;
}

.login-toggle,
.logout-btn {
  white-space: nowrap;
}

.logout-btn {
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--border);
}

.auth-panel {
  position: absolute;
  top: calc(100% + 14px);
  right: 0;
  width: min(320px, calc(100vw - 32px));
  display: grid;
  gap: 12px;
  padding: 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: 0 20px 50px color-mix(in srgb, var(--neutral-900) 70%, transparent);
}

.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.auth-tabs button {
  background: var(--neutral-700);
  color: var(--blue-400);
  border: 1px solid var(--border);
}

.auth-tabs button.active {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border-color: var(--blue-500);
}

.auth-panel input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 11px 13px;
  background: var(--bg-input);
  color: var(--neutral-700);
  font-size: 0.95rem;
}

.auth-error {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--red-600);
  border-radius: 10px;
  background: color-mix(in srgb, var(--red-800) 28%, transparent);
  color: var(--red-300);
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.35;
}

.auth-error.shake {
  animation: shake-error 360ms ease;
}

@keyframes shake-error {
  0% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-7px);
  }

  40% {
    transform: translateX(7px);
  }

  60% {
    transform: translateX(-5px);
  }

  80% {
    transform: translateX(5px);
  }

  100% {
    transform: translateX(0);
  }
}

.hamburger {
  display: none;
  width: 44px;
  height: 44px;
  padding: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  margin: 4px auto;
  background: var(--neutral-100);
  border-radius: 999px;
}

@media (max-width: 820px) {
  .hamburger {
    display: block;
  }

  .header-content {
    position: absolute;
    top: calc(100% + 1px);
    left: 0;
    right: 0;
    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: 18px;
    padding: 18px;
    background: var(--background);
    border-bottom: 1px solid var(--border);
  }

  .header-content.open {
    display: flex;
  }

  .nav {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .nav a,
  .nav-button {
    padding: 12px;
    border-radius: 12px;
    background: var(--bg-surface);
    text-align: left;
  }

  .nav-button {
    background: var(--btn-primary-bg);
    color: var(--btn-primary-text);
    border: 1px solid var(--blue-500);
    text-align: center;
  }

  .auth-area {
    align-items: stretch;
    flex-direction: column;
  }

  .auth-panel {
    position: static;
    width: 100%;
  }
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  place-items: center;
  border: 0;
  background: var(--danger);
  color: var(--danger-text);
  border-radius: 999px;
  width: 34px;
  height: 34px;
  padding: 0;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
}
</style>