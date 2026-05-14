<script setup>
import { onMounted, onUnmounted } from 'vue';

const detectDevTools = () => {
  const widthDiff = window.outerWidth - window.innerWidth > 160;
  const heightDiff = window.outerHeight - window.innerHeight > 160;

  if (widthDiff || heightDiff) {
    window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  }
};

onMounted(() => {
  window.addEventListener('resize', detectDevTools);

  detectDevTools();
});

onUnmounted(() => {
  window.removeEventListener('resize', detectDevTools);
});
</script>

<template>
  <Header />
  <main>
    <NuxtPage />
  </main>
</template>