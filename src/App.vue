<script setup>
import { ref, onMounted } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faTelegram } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { getUserLocation } from './services/geolocation'

library.add(faXTwitter, faTelegram)

import { clicksService } from './services/supabase'

const count = ref(0)
const isOpen = ref(false)
const totalPops = ref(0)
const userCountryCode = ref('GH')
const userFlag = ref('🇬🇭')
const leaderboardData = ref([])



onMounted(async () => {
  // Get user location
  const location = await getUserLocation()
  if (location) {
    userCountryCode.value = location.countryCode
    userFlag.value = location.flag
  }

  // Load initial leaderboard data
  const top10 = await clicksService.getTop10()
  leaderboardData.value = top10

  // Subscribe to real-time updates
  clicksService.onUpdate(async (payload) => {
    const top10 = await clicksService.getTop10()
    leaderboardData.value = top10
    updateLeaderboard()
  })
})

const updateLeaderboard = () => {
  leaderboardData.value.sort((a, b) => b.score - a.score)
  leaderboardData.value.forEach((item, index) => {
    if (item.position !== index + 1) {
      item.highlight = true
      setTimeout(() => {
        item.highlight = false
      }, 1000)
    }
    item.position = index + 1
  })

}

const clickQueue = [];
const batchSize = 100;
let processingQueue = false;

const processClickQueue = async () => {
  if (processingQueue || clickQueue.length === 0) return;
  
  processingQueue = true;
  const batchCount = Math.min(clickQueue.length, batchSize);
  const batch = clickQueue.splice(0, batchCount);
  
  count.value += batchCount;
  totalPops.value += batchCount;
  
  try {
    const result = await clicksService.increment(userCountryCode.value, userFlag.value);
    if (!result.success) {
      console.error('Failed to update clicks:', result.error);
    }
  } catch (error) {
    console.error('Error processing clicks:', error);
  }
  
  processingQueue = false;
  if (clickQueue.length > 0) {
    setTimeout(processClickQueue, 50);
  }
};

const handleClick = () => {
  clickQueue.push(1);
  isOpen.value = !isOpen.value;
  
  if (!processingQueue) {
    processClickQueue();
  }
  isOpen.value = true
  playPopSound()

  // Optimistic update for user's country in leaderboard
  const userCountry = leaderboardData.value.find(item => item.code === userCountryCode.value)
  if (userCountry) {
    userCountry.score += 1
    updateLeaderboard()
  } else {
    // If user's country is not in leaderboard, add it
    leaderboardData.value.push({
      position: leaderboardData.value.length + 1,
      code: userCountryCode.value,
      flag: userFlag.value,
      score: 1,
      highlight: false
    })
    updateLeaderboard()
  }

  // Close cat mouth after animation
  setTimeout(() => {
    isOpen.value = false
  }, 100)

  // Update Supabase in background
  clicksService.increment(userCountryCode.value, userFlag.value)
}

const playPopSound = () => {
  const sounds = ['pop1.mp3', 'pop2.mp3', 'pop3.mp3', 'pop4.mp3']
  const randomSound = sounds[Math.floor(Math.random() * sounds.length)]
  const audio = new Audio(randomSound)
  audio.play()
}
</script>

<template>
  <div class="container">
    <header>
      
      <div class="nav-items">
        <div class="nav-item wallet-btn">Connect Wallet</div>
        <div class="nav-item country">{{ userFlag }}</div>
        <div class="nav-item about">ABOUT $bitmeme</div>
        <div class="social-icons">
          <a href="#" class="twitter">
            <font-awesome-icon :icon="['fab', 'x-twitter']" />
          </a>
          <a href="#" class="telegram">
            <font-awesome-icon :icon="['fab', 'telegram']" />
          </a>
        </div>
      </div>
    </header>

    <main>
      
      <div class="cat-container" @click="handleClick">
        <img :src="isOpen ? '/open-cat.png' : '/close-cat.png'" alt="PopCat" class="cat-image" />
      </div>
      
      <div class="counter">{{ count }}</div>

      <div class="leaderboard">
        <div class="leaderboard-header">
          <span class="trophy">🏆</span>
          <span>Leaderboard</span>
          <span class="arrow">▼</span>
        </div>

        <div class="total-pops">
          <div class="label">Global Clicks</div>
          <div class="value">{{ totalPops.toLocaleString() }}</div>
        </div>

        <div class="leaderboard-content">
          <div v-for="item in leaderboardData" :key="item.position" class="leaderboard-item" :class="{ 'highlight': item.highlight, 'user-country': item.code === userCountryCode }">
            <span class="position">{{ item.position }}</span>
            <span class="flag">{{ item.flag }}</span>
            <span class="country-code">{{ item.code }}</span>
            <span class="score">{{ item.score.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #6366f1;
  --secondary-color: #4f46e5;
  --accent-color: #818cf8;
  --background-start: #1e1b4b;
  --background-end: #312e81;
}

body {
  background: linear-gradient(135deg, var(--background-start), var(--background-end));
  min-height: 100vh;
  color: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
  animation: fadeIn 0.5s ease-out;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

header:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.header-logo {
  width: 48px;
  height: 48px;
  transition: transform 0.2s;
}

.header-logo:hover {
  transform: scale(1.1);
}

.nav-items {
  display: flex;
  gap: 4px;
  align-items: center;
}

.nav-item {
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  cursor: pointer;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  color: rgba(255, 255, 255, 0.95);
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.3);
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.leaderboard-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.position {
  font-weight: 700;
  opacity: 0.9;
  width: 20px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.country-code {
  font-weight: 600;
  opacity: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.score {
  margin-left: auto;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}



.wallet-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border: none;
  font-weight: 700;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.wallet-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: 0.5s;
}

.wallet-btn:hover::before {
  left: 100%;
}

.wallet-btn:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.social-icons {
  display: flex;
  gap: 6px;
}

.social-icons a {
  text-decoration: none;
  font-size: 14px;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.social-icons a:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 48px;
  margin-bottom: 20px;
  background: linear-gradient(to right, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: glow 2s ease-in-out infinite alternate;
}

.counter {
  font-size: 72px;
  margin-bottom: 40px;
  font-weight: 900;
  color: var(--accent-color);
  text-shadow: 0 0 15px rgba(129, 140, 248, 0.7), 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.counter:hover {
  transform: scale(1.1);
}

.cat-container {
  cursor: pointer;
  margin-bottom: 40px;
  position: relative;
  transition: transform 0.2s ease;
}

.cat-container:hover {
  transform: scale(1.02);
}

.cat-container:active {
  transform: scale(0.98);
}

.cat-image {
  width: 300px;
  height: 300px;
  user-select: none;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  transition: filter 0.3s ease;
}

.cat-container:hover .cat-image {
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
}

.leaderboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  max-width: 400px;
  margin: 0 auto;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: float 6s ease-in-out infinite;
}

.leaderboard-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

.trophy {
  font-size: 24px;
}

.arrow {
  font-size: 14px;
  opacity: 0.7;
}

.total-pops {
  text-align: center;
  margin-bottom: 24px;
}

.total-pops .label {
  font-size: 14px;
  opacity: 0.7;
  margin-bottom: 4px;
}

.total-pops .value {
  font-size: 32px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.leaderboard-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
  padding-right: 8px;
}

.leaderboard-content::-webkit-scrollbar {
  width: 6px;
}

.leaderboard-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.leaderboard-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.leaderboard-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.leaderboard-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.leaderboard-item.highlight {
  animation: highlight 1s ease;
}

.leaderboard-item.user-country {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
}

@keyframes highlight {
  0% { background: rgba(99, 102, 241, 0.4); }
  100% { background: rgba(255, 255, 255, 0.12); }
}

.position {
  font-weight: 600;
  opacity: 0.8;
  width: 20px;
}

.country-code {
  font-weight: 500;
  opacity: 0.9;
}

.score {
  margin-left: auto;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.pps {
  font-size: 12px;
  color: #4CAF50;
  font-weight: 500;
  text-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

@keyframes glow {
  from { text-shadow: 0 0 5px var(--primary-color), 0 0 10px var(--accent-color); }
  to { text-shadow: 0 0 20px var(--primary-color), 0 0 30px var(--accent-color); }
}
</style>
