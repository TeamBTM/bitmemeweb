<script setup>
import { ref, onMounted } from 'vue'
import { getUserLocation } from './services/geolocation'
import Header from './components/Header.vue'

const userFlag = ref('🏳️')
const userCountryCode = ref('')

onMounted(async () => {
  const location = await getUserLocation()
  if (location) {
    userCountryCode.value = location.countryCode
    userFlag.value = location.flag
  }
})
</script>

<template>
  <div class="app-container">
    <Header :userFlag="userFlag" :userCountryCode="userCountryCode" />
    <router-view />
  </div>
</template>

<style>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
