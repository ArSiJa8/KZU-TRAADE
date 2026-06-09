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

const isAuthenticating = ref(false)

async function register() {
  clearAuthError()
  isAuthenticating.value = true

  try {
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
  } catch (err: any) {
    const message = err.data?.statusMessage || err.statusMessage || err.message || 'Registrierung fehlgeschlagen'
    showAuthError(message)
  } finally {
    isAuthenticating.value = false
  }
}

async function login() {
  clearAuthError()
  isAuthenticating.value = true

  try {
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
  } catch (err: any) {
    const message = err.data?.statusMessage || err.statusMessage || err.message || 'Login fehlgeschlagen'
    showAuthError(message)
  } finally {
    isAuthenticating.value = false
  }
}

async function openNewPost() {
  if (useRoute().path !== '/') {
    await navigateTo('/')
  }
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



        <NuxtLink to="/#gallery" @click="closeMenus">
          Galerie
        </NuxtLink>

        <NuxtLink to="/#about" @click="closeMenus">
          Über uns
        </NuxtLink>

        <NuxtLink v-if="role === 'admin'" to="/admin" @click="closeMenus">
          Admin
        </NuxtLink>

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
                  placeholder="KZU Email"
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

              <button
                  type="button"
                  :disabled="isAuthenticating"
                  @click="login"
              >
                {{ isAuthenticating ? 'Wird eingeloggt...' : 'Einloggen' }}
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

              <button
                  type="button"
                  :disabled="isAuthenticating"
                  @click="register"
              >
                {{ isAuthenticating ? 'Wird erstellt...' : 'Account erstellen' }}
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
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px clamp(16px, 4vw, 48px);
  background: color-mix(in srgb, var(--background) 85%, transparent);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(20px) saturate(180%);
}

.logo {
  color: var(--neutral-100);
  text-decoration: none;
  font-size: clamp(1.2rem, 2vw, 1.6rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  mix-blend-mode: difference;
  isolation: isolate;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav a,
.nav-button {
  color: var(--neutral-200);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.nav-button {
  padding: 7px 14px;
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: 1px solid var(--blue-500);
  border-radius: 12px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
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
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--neutral-100);
  background: var(--bg-surface);
  font-size: 0.85rem;
  font-weight: 700;
}

.login-toggle,
.logout-btn {
  white-space: nowrap;
  font-size: 0.95rem;
}

.logout-btn {
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--border);
  padding: 7px 14px;
}

.auth-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: min(320px, calc(100vw - 32px));
  display: grid;
  gap: 12px;
  padding: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 4px;
}

.auth-tabs button {
  background: var(--neutral-700);
  color: var(--neutral-300);
  border: 1px solid var(--border);
  padding: 8px;
  font-size: 0.9rem;
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
  padding: 12px;
  background: var(--bg-input);
  color: var(--neutral-900);
  font-size: 0.95rem;
}

.auth-error {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--red-600);
  border-radius: 10px;
  background: rgba(215, 36, 36, 0.15);
  color: var(--red-300);
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.4;
}

.auth-error.shake {
  animation: shake-error 360ms ease;
}

@keyframes shake-error {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

.hamburger {
  display: none;
  width: 40px;
  height: 40px;
  padding: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
}

.hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  margin: 4px auto;
  background: var(--neutral-100);
  border-radius: 999px;
  transition: 0.3s;
}

@media (max-width: 920px) {
  .hamburger {
    display: block;
  }

  .header-content {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
    padding: 24px;
    background: var(--background);
    border-bottom: 1px solid var(--border);
    max-height: calc(100vh - 70px);
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }

  .header-content.open {
    display: flex;
  }

  .nav {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .nav a,
  .nav-button {
    padding: 14px;
    border-radius: 12px;
    background: var(--bg-surface);
    text-align: left;
    border: 1px solid var(--border);
  }

  .nav-button {
    background: var(--btn-primary-bg);
    color: var(--btn-primary-text);
    border-color: var(--blue-500);
    text-align: center;
  }

  .auth-area {
    align-items: stretch;
    flex-direction: column;
    border-top: 1px solid var(--border);
    padding-top: 20px;
  }

  .auth-panel {
    position: static;
    width: 100%;
    box-shadow: none;
    padding: 0;
    margin-top: 12px;
    background: transparent;
    border: none;
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
  width: 32px;
  height: 32px;
  padding: 0;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}
</style>