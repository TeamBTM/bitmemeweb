<script setup>
import { ref, onMounted } from 'vue'
import junoService from '@/services/blockchain/junoService'

const clickCount = ref(0)
const burnPoolBalance = ref('900000000000')
const isProcessing = ref(false)
const lastClickTime = ref(Date.now())
const clickBuffer = ref([])

const CLICK_THRESHOLD = 100 // Clicks needed for burn
const MIN_CLICK_INTERVAL = 100 // Minimum ms between clicks

const handleClick = async () => {
  const now = Date.now()
  if (now - lastClickTime.value < MIN_CLICK_INTERVAL) {
    return // Prevent too rapid clicking
  }
  
  lastClickTime.value = now
  clickCount.value++
  clickBuffer.value.push(now)

  // Process burns when threshold reached
  if (clickCount.value >= CLICK_THRESHOLD && !isProcessing.value) {
    try {
      isProcessing.value = true
      await processBurn()
      clickCount.value = 0
      clickBuffer.value = []
    } catch (error) {
      console.error('Error processing burn:', error)
    } finally {
      isProcessing.value = false
    }
  }
}

const processBurn = async () => {
  try {
    const tx = await junoService.burnTokens(CLICK_THRESHOLD)
    if (tx) {
      burnPoolBalance.value = (Number(burnPoolBalance.value) - 1).toString()
    }
  } catch (error) {
    console.error('Burn transaction failed:', error)
    throw error
  }
}

onMounted(async () => {
  try {
    const balance = await junoService.getBurnPoolBalance()
    burnPoolBalance.value = balance
  } catch (error) {
    console.error('Error fetching burn pool balance:', error)
  }
})
</script>

<template>
  <div class="burn-container">
    <button 
      @click="handleClick" 
      :disabled="isProcessing"
      class="burn-button"
    >
      🔥 BURN BTM 🔥
    </button>
    
    <div class="stats">
      <p>Clicks: {{ clickCount }}/{{ CLICK_THRESHOLD }}</p>
      <p>Remaining Supply: {{ burnPoolBalance }} BTM</p>
    </div>
  </div>
</template>

<style scoped>
.burn-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.burn-button {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff4e50, #f9d423);
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-shadow: 0 4px 15px rgba(255, 78, 80, 0.3);
}

.burn-button:hover {
  transform: scale(1.05);
}

.burn-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.stats {
  text-align: center;
  font-size: 1.2rem;
  color: white;
}
</style>