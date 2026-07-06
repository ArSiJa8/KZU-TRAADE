
<script setup lang="ts">
useSeoMeta({
  title: 'KZU - Tausche dinge ohne Geld!',
  ogTitle: 'KZU TRAADE - Tauschbörse für die Kantonsschule Zürcher Unterland in Bülach',
  description: 'KZU TRADE ist eine moderne, digitale Tauschbörse für die KZU. - Ohne Geld!',
  ogDescription: 'Tauschen sie alte Schulbücher oder andere Dinge die sie nicht mehr brauchen gegen neue!',
  ogImage: 'https://kzu-trade.ch/og-image.jpeg',
  keywords: 'KZU, KZU TRADE, Kantonsschule Zürcher Unterland, Bülach, Tauschen, Trading, Tauschbörse'
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
