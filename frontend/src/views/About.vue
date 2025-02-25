<script setup>
import { ref } from 'vue'

const sections = ref({
  aboutUs: {
    title: "WTF is BitMeme? 🤔🚀",
    subtitle: "(Spoiler: It's Like Bitcoin, but with Memes and More 🐕✨)",
    concept: "BitMeme is the first memeable crypto project that combines laughs, chaotic clicking, and absurd rewards. Imagine Shiba Inu and Dogecoin at a party with a clicker game and meme NFTs. 🎮🐸 That's BitMeme! No joke: here, memes earn tokens, clicks conquer countries, and your cat could become rich (or at least viral).",
    mission: "#MMGA (Make Memes Great Again) 🇺🇸🍔",
    missionDesc: "We're giving power back to meme lords, gamers, and professional procrastinators. Because memes aren't just for laughs… they're for profit! 💸🚀",
    vision: "To become the TikTok of crypto: a place where creativity (and your lightning-fast clicking finger) fills your wallet with $BTM. The dream? Let your meme pay for your pizza 🍕… or your Lambo. 🚗💨"
  },
  ecosystem: {
    title: "🌍 The BitMeme Ecosystem: Where Clicks and Memes Rule 🕹️🤯",
    features: [
      {
        title: "🖱️ Global Click Game",
        description: "\"Click or get clicked!\" Battle to make your country #1. Top 10 countries win $BTM… and last place gets eternal meme shame. 🏆👀"
      },
      {
        title: "🎨 Meme Factory (v.2.0)",
        description: "Create memes in 30 seconds with templates. If your meme goes viral, we'll mint it as an NFT… and you'll become a legend. 🔥"
      },
      {
        title: "💰 Meme Marketplace",
        description: "Buy/sell meme NFTs like \"Grumpy Cat 2.0\" or \"Elon Musk Dancing Reggaeton.\" 💃📈"
      },
      {
        title: "🎮 Epic Quests",
        description: "Complete challenges like \"Click 1,000 times\" or \"Get your grandma to make a meme\" for $BTM rewards! 👵📱"
      }
    ]
  },
  tokenomics: {
    title: "💰 $BTM Tokenomics: Memes That Print $$$ 🤑🥧",
    supply: "1,000,000,000,000 BTM",
    distribution: [
      { title: "Community", value: "50%", description: "For the click gods and meme kings/queens 👑" },
      { title: "Team", value: "20%", description: "Locked for 2 years (we promise not to flee to the Bahamas... yet) 🏝️🔒" },
      { title: "Partners", value: "15%", description: "Includes your uncle's crypto YouTube channel 📱🤝" },
      { title: "Public Sale", value: "10%", description: "For you, the legend reading this! 🎟️" },
      { title: "Charity", value: "5%", description: "Donations to causes like \"Save the Forgotten 2012 Memes\" 🐸❤️" }
    ]
  },
  roadmap: {
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
          <div v-for="(feature, index) in sections.ecosystem.features"
               :key="index"
               class="ecosystem-card">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </section>

      <!-- Tokenomics Section -->
      <section class="tokenomics-section">
        <h2 class="section-title">{{ sections.tokenomics.title }}</h2>
        <div class="supply-card">
          <h3>Total Supply</h3>
          <p class="supply-value">{{ sections.tokenomics.supply }}</p>
        </div>

        <div class="distribution-grid">
          <div v-for="(item, index) in sections.tokenomics.distribution"
               :key="index"
               class="distribution-card">
            <h4>{{ item.title }}</h4>
            <p class="value">{{ item.value }}</p>
            <p class="description">{{ item.description }}</p>
          </div>
        </div>
      </section>

      <!-- Roadmap Section -->
      <section class="roadmap-section">
        <h2 class="section-title">{{ sections.roadmap.title }}</h2>
        <div class="roadmap-timeline">
          <div v-for="(phase, index) in sections.roadmap.phases"
               :key="index"
               class="roadmap-phase">
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