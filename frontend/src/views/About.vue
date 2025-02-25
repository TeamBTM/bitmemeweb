<script setup>
import { ref } from 'vue'

const sections = ref({
  aboutUs: {
    title: "🌟 Welcome to BitMeme ($BTM)",
    subtitle: "Where Memes Meet Blockchain Magic ✨",
    concept: "BitMeme is not just another crypto project - it's a revolution in the meme economy. We're building a platform where memes aren't just funny pictures; they're valuable digital assets.",
    mission: "To make crypto fun again!",
    missionDesc: "We believe blockchain technology should be accessible, enjoyable, and maybe a little bit silly.",
    vision: "Creating the world's first truly decentralized meme economy, where creativity meets value, and laughter meets innovation."
  },
  ecosystem: {
    title: "🚀 Roadmap: From Zero to Meme Hero (No Cape Needed)",
    phases: [
      {
        title: "Phase 1: Birth of a Legendary Meme 🍼🚀",
        items: [
          "Launch $BTM on Cosmos (and pray for no bugs)",
          "First official meme: A dog in a spacesuit 🐕🧑🚀"
        ]
      },
      {
        title: "Phase 2: Hello, World! 🌍✨",
        items: [
          "Click game goes live (Surprise! Venezuelan bots are already clicking)",
          "First airdrop: 100 $BTM to anyone who swaps their profile pic for a meme 🪂"
        ]
      },
      {
        title: "Phase 3: The Viral Era 📱🔥",
        items: [
          "Collabs with influencers like \"Meme Elon Musk\" and \"Crypto Kitty\" 😼",
          "Mega Contest: \"Create a meme so good we'll NFT it and worship you\" 🏆"
        ]
      },
      {
        title: "Phase 4: Galactic Domination 🌌👽",
        items: [
          "Launch BitMeme Academy (courses like \"How to Survive a Bear Market with Memes\") 🐻🎓",
          "Integrate with Solana: Because even memes deserve speed ⚡"
        ]
      }
    ]
  }
})
</script>

<template>
  <div class="about-page">
    <div class="about-container">
      <!-- About Us Section -->
      <section class="about-section">
        <h1 class="main-title">{{ sections.aboutUs.title }}</h1>
        <h2 class="subtitle">{{ sections.aboutUs.subtitle }}</h2>
        
        <div class="content-card concept-card">
          <h3>Concept</h3>
          <p>{{ sections.aboutUs.concept }}</p>
        </div>

        <div class="mission-vision-grid">
          <div class="content-card mission-card">
            <h3>Mission</h3>
            <p class="highlight">{{ sections.aboutUs.mission }}</p>
            <p>{{ sections.aboutUs.missionDesc }}</p>
          </div>

          <div class="content-card vision-card">
            <h3>Vision</h3>
            <p>{{ sections.aboutUs.vision }}</p>
          </div>
        </div>
      </section>

      <!-- Ecosystem Section -->
      <section class="ecosystem-section">
        <h2 class="section-title">{{ sections.ecosystem.title }}</h2>
        <div class="ecosystem-grid">
          <div v-for="(phase, index) in sections.ecosystem.phases"
               :key="index"
               class="ecosystem-card">
            <h3>{{ phase.title }}</h3>
            <ul>
              <li v-for="(item, itemIndex) in phase.items"
                  :key="itemIndex">
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.about-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.main-title {
  font-size: 2.5rem;
  background: linear-gradient(to right, #4CAF50, #2196F3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
}

.content-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 1.5rem;
}

.mission-vision-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.highlight {
  font-size: 1.2rem;
  color: #4CAF50;
  margin-bottom: 1rem;
}

.ecosystem-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.ecosystem-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
}

.ecosystem-card:hover {
  transform: translateY(-5px);
}

.supply-card {
  text-align: center;
  margin-bottom: 2rem;
}

.supply-value {
  font-size: 2rem;
  color: #4CAF50;
  font-weight: bold;
}

.distribution-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.distribution-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.value {
  font-size: 1.5rem;
  color: #2196F3;
  font-weight: bold;
  margin: 0.5rem 0;
}

.roadmap-timeline {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.roadmap-phase {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.roadmap-phase h3 {
  color: #4CAF50;
  margin-bottom: 1rem;
}

.roadmap-phase ul {
  list-style-type: none;
  padding: 0;
}

.roadmap-phase li {
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.roadmap-phase li::before {
  content: "🚀";
  position: absolute;
  left: 0;
  top: 0;
}
</style>