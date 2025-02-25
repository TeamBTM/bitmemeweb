<script setup>
import { ref, onMounted } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faTelegram } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { getUserLocation } from '../services/geolocation'
import openCatImg from '../assets/images/open-cat.png'
import closeCatImg from '../assets/images/close-cat.png'

library.add(faXTwitter, faTelegram)

import { clicksService } from '../services/supabase'

const count = ref(parseInt(localStorage.getItem('localClicks') || '0'))
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

  // Load initial leaderboard data and total clicks
  const [top10, total] = await Promise.all([
    clicksService.getTop10(),
    clicksService.getTotalClicks()
  ])
  leaderboardData.value = top10
  totalPops.value = total

  // Subscribe to real-time updates
  clicksService.onUpdate(async (payload) => {
    const [top10, total] = await Promise.all([
      clicksService.getTop10(),
      clicksService.getTotalClicks()
    ])
    leaderboardData.value = top10
    totalPops.value = total
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

const clickQueue = []
const batchSize = 100
let processingQueue = false

const processClickQueue = async () => {
  if (processingQueue || clickQueue.length === 0) return
  
  processingQueue = true
  const batchCount = Math.min(clickQueue.length, batchSize)
  const batch = clickQueue.splice(0, batchCount)
  
  count.value += batchCount
  localStorage.setItem('localClicks', count.value.toString())
  totalPops.value += batchCount
  
  try {
    const result = await clicksService.increment(userCountryCode.value, userFlag.value)
    if (!result.success) {
      console.error('Failed to update clicks:', result.error)
    }
  } catch (error) {
    console.error('Error processing clicks:', error)
  }
  
  processingQueue = false
  if (clickQueue.length > 0) {
    setTimeout(processClickQueue, 50)
  }
}

const handleClick = () => {
  clickQueue.push(1)
  isOpen.value = !isOpen.value
  
  if (!processingQueue) {
    processClickQueue()
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
  const sounds = [
    new URL('../assets/sounds/pop1.mp3', import.meta.url).href,
    new URL('../assets/sounds/pop2.mp3', import.meta.url).href,
    new URL('../assets/sounds/pop3.mp3', import.meta.url).href,
    new URL('../assets/sounds/pop4.mp3', import.meta.url).href
  ]
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
        <div class="nav-item about">ABOUT $BTM</div>
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
        <img :src="isOpen ? openCatImg : closeCatImg" alt="PopCat" class="cat-image" />
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

<style>
/* Component styles moved to style.css */
</style>