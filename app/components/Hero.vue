<script setup lang="ts"></script>

<template>
    <div class="hero">
        <h1>KZU Trade</h1>
        <p class="hero-subtitle">Tauschen anstatt wegwerfen</p>
    </div>
</template>

<style scoped>
.hero {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 90vh;
    background-image: url("~/assets/imgs/Hero-BG.png");
    background-size: cover;
    background-position: center;
    color: var(--text-main);
    position: relative;
    z-index: 1;
}

.hero h1 {
    margin: 0;
    font-family: "Roboto", sans-serif;
    font-size: clamp(3rem, 12vw, 15rem);
    line-height: 1.2;
    font-weight: 700;
    background: linear-gradient(
        180deg,
        rgba(7, 7, 7, 1) 0%,
        rgba(7, 7, 7, 1) 66%,
        rgb(255 255 255) 100%
    );
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
}

.hero-subtitle {
    font-size: clamp(1.2rem, 3vw, 2rem);
    font-weight: 500;
    margin-top: 1rem;
    color: var(--neutral-300);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    animation: fadeIn 1.5s ease-out;
    color: #1a1a1a;
}

.transition {
    height: clamp(100px, 14vw, 220px);
    background: linear-gradient(to bottom, #0073ff, var(--background));
}
</style>
