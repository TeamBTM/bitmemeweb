<script setup>
import { library } from '@fortawesome/fontawesome-svg-core'
import { faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faTelegram } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faXTwitter, faTelegram)

defineProps({
  userFlag: {
    type: String,
    default: '🏳️'
  }
})
</script>

<template>
  <header>
    <div class="nav-items">
      <div class="nav-links">
        <router-link to="/wallet" class="nav-item wallet-btn">Connect Wallet</router-link>
        <router-link to="/" class="nav-item home">HOME</router-link>
        <router-link to="/about" class="nav-item about">ABOUT $BTM</router-link>
        <div class="nav-item country" v-if="userFlag">{{ userFlag }}</div>
      </div>
      <div class="social-icons">
        <a href="https://twitter.com/BTMCoin" target="_blank" class="twitter">
          <font-awesome-icon :icon="['fab', 'x-twitter']" />
        </a>
        <a href="https://t.me/BTMCoin" target="_blank" class="telegram">
          <font-awesome-icon :icon="['fab', 'telegram']" />
        </a>
      </div>
    </div>
  </header>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  margin-bottom: 2rem;
}

.nav-items {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-item {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.wallet-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s ease;
}

.wallet-btn:hover {
  transform: scale(1.05);
  background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
}

.social-icons {
  display: flex;
  gap: 1rem;
}

.social-icons a {
  color: white;
  font-size: 1.2rem;
  transition: transform 0.2s ease;
}

.social-icons a:hover {
  transform: scale(1.1);
}
</style>