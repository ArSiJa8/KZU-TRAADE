<script setup lang="ts">

</script>

<template>
  <div class="hero">
    <p>KZU Trade</p>
  </div>
  <div class="transition"></div>
</template>

<style scoped>
.hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-image: url("~/assets/imgs/Hero-BG.png");
  background-size: cover;
  background-position: center;
  color: var(--text-main);
}

.hero p {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: clamp(3rem, 12vw, 15rem);
  line-height: 1.2;
  font-weight: 700;
  background: linear-gradient(180deg, rgba(7, 7, 7, 1) 0%, rgba(7, 7, 7, 1) 66%, rgb(255 255 255) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.transition {
  height: clamp(100px, 14vw, 220px);
  background: linear-gradient(to bottom, #0073FF, var(--background));
}
</style>