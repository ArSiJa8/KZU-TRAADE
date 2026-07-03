
<script setup lang="ts">
useSeoMeta({
  title: 'KZU - Cryptocurrency Trading Plattform',
  ogTitle: 'KZU TRAADE - Sichere Krypto Trading Plattform',
  description: 'KZU TRAADE ist die moderne Plattform für Kryptowährungshandel. Traden Sie Bitcoin, Ethereum und 1000+ Kryptowährungen mit KZU.',
  ogDescription: 'Traden Sie Kryptowährungen sicher auf KZU TRAADE',
  ogImage: 'https://kzu-trade.ch/og-image.jpg',
  keywords: 'KZU, KZU TRAADE, Kryptohandel, Bitcoin, Ethereum, Trading, Kryptowährung'
})
</script>

<template>
  <div style="min-height: 200vh;">
  <Hero />
  <Transition1 />
<AboutUs id="about" />
  <Upload />
  </div>
</template>
