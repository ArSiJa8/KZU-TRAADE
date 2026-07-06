<script setup lang="ts">
// About page component
</script>

<template>
  <div class="about-container" id="about">
    <div class="about-hero">
      <h1>Über KZU-TRAADE</h1>
      <p class="subtitle">Die Tauschplattform von Schülern für Schüler an der Kantonsschule Zürcher Unterland.</p>
    </div>

    <div class="about-content">
      <div class="about-card">
        <div class="card-icon">🌍</div>
        <h2>Nachhaltigkeit leben</h2>
        <p>Warum neu kaufen, wenn man tauschen kann? KZU-TRAADE hilft dabei, Büchern, Stiften und Sportmaterialien ein zweites Leben zu geben und so unseren ökologischen Fußabdruck zu verringern.</p>
      </div>

      <div class="about-card">
        <div class="card-icon">🤝</div>
        <h2>Gemeinschaft stärken</h2>
        <p>Tauschen verbindet. Lerne neue Mitschüler kennen und profitiere von der starken KZU-Community. Ein Ort, an dem sich Schüler gegenseitig unterstützen.</p>
      </div>

      <div class="about-card">
        <div class="card-icon">💡</div>
        <h2>Einfach & Lokal</h2>
        <p>Kein Postversand, keine komplizierten Zahlungen. Der Tausch findet direkt auf dem Campus statt. Von Schülern für Schüler – unkompliziert und direkt.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 2rem;
  font-family: 'Inter', sans-serif;
  animation: fadeIn 0.8s ease-out;
}

.about-hero {
  text-align: center;
  margin-bottom: 4rem;
}

.about-hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e293b, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1.25rem;
  color: #64748b;
  max-width: 650px;
  margin: 0 auto;
  line-height: 1.6;
}

.about-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.5rem;
}

.about-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  text-align: center;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.04);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
}

.about-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.8);
}

.card-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  display: inline-block;
  transition: transform 0.3s ease;
}

.about-card:hover .card-icon {
  transform: scale(1.1);
}

.about-card h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.25rem;
  letter-spacing: -0.01em;
}

.about-card p {
  color: #475569;
  line-height: 1.7;
  font-size: 1.05rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .about-container {
    padding: 4rem 1.5rem;
  }
  
  .about-hero h1 {
    font-size: 2.5rem;
  }
  
  .about-card {
    padding: 2.5rem 1.5rem;
  }
}
</style>