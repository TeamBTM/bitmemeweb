<script setup>
import { ref } from 'vue'

const sections = ref({
  joinFire: {
    title: "Join the Fire! 🔥",
    buttonText: "CLICK HERE TO BURN TOKENS (and your productivity)",
    domain: "www.bitmeme.club",
    domainNote: "(Yes, the domain ends in .club… we're fancy)"
  },
  aboutUs: {
    title: "WTF is BitMeme? 🐶🔥",
    subtitle: "A meme coin for burning tokens, laughing, and asking: \"Where did I spend my time?\"",
    concept: {
      emoji: "🚀 Clicks + 🔥 Burns + 😂 Memes = BitMeme",
      what: "A ridiculous game where your boredom turns into digital fire.",
      how: "Every 100 clicks on a giant button burns 1 $BTM forever.",
      why: "Because burning tokens is the new crypto self-care."
    },
    mission: "#MMGA (Make Memes Great Again)",
    missionDesc: "We want memes to be useful… even if it's just for burning imaginary money."
  },
  howItWorks: {
    title: "How It Works (For Normal Humans)",
    steps: [
      {
        title: "Step 1: Click Like a Hamster 🐹",
        items: [
          "1 click = 0.01 $BTM burned",
          "100 clicks? Burn 1 BTM and get a sore finger!",
          "Live Counter: Watch the 1,000,000,000,000 $BTM supply shrink in real time."
        ]
      },
      {
        title: "Step 2: Buy at the Fair Launch (Or Don't) 💸",
        items: [
          "1 ATOM = 1,000,000 $BTM (yes, a million… we're generous!)",
          "No whales allowed: Max 100 ATOM per person (sorry, Elon)"
        ]
      },
      {
        title: "Step 3: Watch the Chaos 🔥",
        items: [
          "Unsold tokens from the launch get burned (more drama!)",
          "The team can't touch their 5% until 2025 (if they do, they'll get memed to death)"
        ]
      }
    ]
  },
  tokenomics: {
    title: "Tokenomics (For Math Nerds)",
    supply: "Total Supply: 1,000,000,000,000 $BTM",
    distribution: [
      { title: "90% Burn Pool", desc: "Burned by clicks" },
      { title: "5% Team", desc: "Locked until 2025 (we're \"responsible\"… for now)" },
      { title: "5% Fair Launch", desc: "For you, the crypto miracle believer" }
    ]
  },
  whyClick: {
    title: "Why Click?",
    reasons: [
      "Watching big numbers turn small is therapeutic",
      "Brag on Twitter: \"I burned 69,420 $BTM\"",
      "What else will you do? Work? 😒"
    ]
  },
  fairLaunch: {
    title: "Fair Launch",
    date: "\"Soon™\" (announced with a meme of a dog in a rocket)",
    fundsUsage: [
      { title: "50% Liquidity", desc: "So the price isn't a sad joke" },
      { title: "50% Marketing", desc: "Billboards with memes like \"BitMeme: The Best Investment Since Tulips\"" }
    ]
  },
  transparency: {
    title: "Transparency (Kinda)",
    items: [
      "Live Burns: Track transactions on Mintscan",
      "Open Source: Check the code yourself (spoiler: no tricks)"
    ]
  },
  endGame: {
    title: "What Happens When Everything Burns?",
    items: [
      "The website shows a phoenix meme and a \"Game Over\" screen",
      "We'll all say: \"Worth it… I think\""
    ]
  },
  finalNote: {
    title: "Final Note 🎭",
    mainText: "A launch so simple even your dog could join (if it had ATOM). If it flops, we'll burn the leftovers and call it \"conceptual art\".",
    subText: "(The real prize? Saying, \"I was there when we burned trillions for fun\".)",
    antiWhaleRule: "🚫🐳 Anti-Whale Rule: 100 ATOM max per person!",
    features: ["No Whales", "No NFTs", "No Leaders", "Just clicks, burns, and memes"]
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
          <h3>Concept (In 3 Emojis!)</h3>
          <p class="emoji-concept">{{ sections.aboutUs.concept.emoji }}</p>
          <div class="concept-details">
            <p><strong>What?</strong> {{ sections.aboutUs.concept.what }}</p>
            <p><strong>How?</strong> {{ sections.aboutUs.concept.how }}</p>
            <p><strong>Why?</strong> {{ sections.aboutUs.concept.why }}</p>
          </div>
        </div>

        <div class="content-card mission-card">
          <h3>Mission</h3>
          <p class="highlight">{{ sections.aboutUs.mission }}</p>
          <p>{{ sections.aboutUs.missionDesc }}</p>
        </div>

        <!-- How It Works Section -->
        <div class="content-card how-it-works-card">
          <h3>{{ sections.howItWorks.title }}</h3>
          <div class="steps-container">
            <div v-for="(step, index) in sections.howItWorks.steps" 
                 :key="index" 
                 class="step-card">
              <h4>{{ step.title }}</h4>
              <ul>
                <li v-for="(item, itemIndex) in step.items" 
                    :key="itemIndex">{{ item }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Tokenomics Section -->
        <div class="content-card tokenomics-card">
          <h3>{{ sections.tokenomics.title }}</h3>
          <p class="supply-text">{{ sections.tokenomics.supply }}</p>
          <div class="distribution-grid">
            <div v-for="(item, index) in sections.tokenomics.distribution" 
                 :key="index" 
                 class="distribution-card">
              <h4>{{ item.title }}</h4>
              <p>{{ item.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Why Click Section -->
        <div class="content-card why-click-card">
          <h3>{{ sections.whyClick.title }}</h3>
          <ul class="reasons-list">
            <li v-for="(reason, index) in sections.whyClick.reasons" 
                :key="index">{{ reason }}</li>
          </ul>
        </div>

        <!-- Fair Launch Section -->
        <div class="content-card fair-launch-card">
          <h3>{{ sections.fairLaunch.title }}</h3>
          <p class="launch-date">{{ sections.fairLaunch.date }}</p>
          <div class="funds-usage-grid">
            <div v-for="(fund, index) in sections.fairLaunch.fundsUsage" 
                 :key="index" 
                 class="fund-card">
              <h4>{{ fund.title }}</h4>
              <p>{{ fund.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Transparency Section -->
        <div class="content-card transparency-card">
          <h3>{{ sections.transparency.title }}</h3>
          <ul>
            <li v-for="(item, index) in sections.transparency.items" 
                :key="index">{{ item }}</li>
          </ul>
        </div>

        <!-- End Game Section -->
        <div class="content-card end-game-card">
          <h3>{{ sections.endGame.title }}</h3>
          <ul>
            <li v-for="(item, index) in sections.endGame.items" 
                :key="index">{{ item }}</li>
          </ul>
        </div>

        <!-- Final Note Section -->
        <div class="content-card final-note-card">
          <h3 class="final-note-title">{{ sections.finalNote.title }}</h3>
          <p class="final-note-text">{{ sections.finalNote.mainText }} 🎨🔥</p>
          <p class="final-note-subtext">{{ sections.finalNote.subText }} 😎</p>
          <div class="anti-whale-rule">
            <p>{{ sections.finalNote.antiWhaleRule }}</p>
          </div>
          <div class="features-container">
            <div v-for="(feature, index) in sections.finalNote.features"
                 :key="index"
                 class="feature-item"
                 :class="{ 'animate-feature': true }">
              {{ feature }}
            </div>
          </div>
        </div>

        <!-- Join the Fire Section -->
        <div class="content-card join-fire-card">
          <h3>{{ sections.joinFire.title }}</h3>
          <div class="join-fire-content">
            <a href="https://www.bitmeme.club" target="_blank" class="giant-button">
              {{ sections.joinFire.buttonText }} 🔥
            </a>
            <div class="domain-info">
              <p class="domain">{{ sections.joinFire.domain }}</p>
              <p class="domain-note">{{ sections.joinFire.domainNote }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.join-fire-card {
  text-align: center;
  padding: 2rem;
}

.join-fire-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.giant-button {
  display: inline-block;
  padding: 2rem 4rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #ff4e50, #f9d423);
  border-radius: 16px;
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 8px 32px rgba(255, 78, 80, 0.3);
}

.giant-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 48px rgba(255, 78, 80, 0.4);
}

.domain-info {
  text-align: center;
}

.domain {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--accent-color);
  margin-bottom: 0.5rem;
}

.domain-note {
  font-style: italic;
  color: rgba(255, 255, 255, 0.8);
}

.about-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.final-note-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 2px solid rgba(255, 255, 255, 0.1);
  transform-style: preserve-3d;
  transition: all 0.3s ease;
}

.final-note-card:hover {
  transform: translateY(-5px) rotateX(5deg);
  border-color: var(--accent-color);
}

.final-note-title {
  font-size: 2rem;
  color: var(--accent-color);
  margin-bottom: 1.5rem;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.final-note-text {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.final-note-subtext {
  font-style: italic;
  color: var(--accent-color);
  margin-bottom: 1.5rem;
}

.anti-whale-rule {
  background: rgba(255, 0, 0, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid rgba(255, 0, 0, 0.2);
  animation: pulse 2s infinite;
}

.features-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.feature-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.8rem;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s ease;
}

.animate-feature {
  animation: float 3s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.2s);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
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
  transition: transform 0.3s ease;
}

.content-card:hover {
  transform: translateY(-5px);
}

.emoji-concept {
  font-size: 1.5rem;
  text-align: center;
  margin: 1rem 0;
}

.concept-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.highlight {
  font-size: 1.2rem;
  color: #4CAF50;
  margin-bottom: 1rem;
}

.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.step-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
}

.distribution-grid,
.funds-usage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.distribution-card,
.fund-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}

.supply-text {
  font-size: 1.2rem;
  color: #4CAF50;
  text-align: center;
  margin-bottom: 1rem;
}

.reasons-list li {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.reasons-list li::before {
  content: '🎯';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
}

.launch-date {
  font-size: 1.2rem;
  color: #2196F3;
  text-align: center;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .content-card {
    padding: 1rem;
  }
  
  .distribution-grid,
  .funds-usage-grid {
    grid-template-columns: 1fr;
  }
}
</style>