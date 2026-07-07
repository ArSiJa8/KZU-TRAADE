<script setup lang="ts">
// About page component
</script>

<template>
    <div class="about-container" id="about">
        <div class="about-hero">
            <h1>Über KZU-TRAADE</h1>
            <h6>
                (Dies ist noch provisorisch und die Über Uns Texte sind KI, das
                wird durch eine anleitung ersetzt werden)
            </h6>
            <p class="subtitle">
                Die Tauschplattform von Schülern für Schüler an der
                Kantonsschule Zürcher Unterland.
            </p>
        </div>

        <div class="about-content">
            <div class="about-card glass-panel">
                <div class="card-icon">
                    <Icon name="ph:leaf-duotone" />
                </div>
                <h2>Nachhaltigkeit leben</h2>
                <p>
                    Warum neu kaufen, wenn man tauschen kann? KZU-TRAADE hilft
                    dabei, Büchern, Stiften und Sportmaterialien ein zweites
                    Leben zu geben und so unseren ökologischen Fußabdruck zu
                    verringern.
                </p>
            </div>

            <div class="about-card glass-panel">
                <div class="card-icon">
                    <Icon name="ph:users-three-duotone" />
                </div>
                <h2>Gemeinschaft stärken</h2>
                <p>
                    Tauschen verbindet. Lerne neue Mitschüler kennen und
                    profitiere von der starken KZU-Community. Ein Ort, an dem
                    sich Schüler gegenseitig unterstützen.
                </p>
            </div>

            <div class="about-card glass-panel">
                <div class="card-icon">
                    <Icon name="ph:map-pin-line-duotone" />
                </div>
                <h2>Einfach & Lokal</h2>
                <p>
                    Kein Postversand, keine komplizierten Zahlungen. Der Tausch
                    findet direkt auf dem Campus statt. Von Schülern für Schüler
                    – unkompliziert und direkt.
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.about-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 2rem 8rem;
    animation: fadeIn 0.8s ease-out;
}

.about-hero {
    text-align: center;
    margin-bottom: 4rem;
}

.about-hero h1 {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 800;
    margin-bottom: 1rem;
    letter-spacing: -0.02em;
    color: var(--h1-color);
}

.subtitle {
    font-size: 1.15rem;
    color: var(--text-muted);
    max-width: 600px;
    margin: 0 auto;
}

.about-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.about-card {
    padding: 2.5rem;
    text-align: center;
    transition:
        transform 0.3s ease,
        border-color 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.about-card:hover {
    transform: translateY(-5px);
    border-color: color-mix(in srgb, var(--accent) 50%, var(--border));
}

.card-icon {
    font-size: 3.5rem;
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
}

.about-card h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--neutral-100);
}

.about-card p {
    margin: 0;
    color: var(--text-main);
    font-size: 1rem;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .about-container {
        padding: 3rem 1.5rem 6rem;
    }
    .about-card {
        padding: 2rem;
    }
}
</style>
