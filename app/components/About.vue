<script setup lang="ts">
// About page component
</script>

<template>
    <div class="about-container" id="about">
        <div class="about-hero">
            <h1>Über KZU-TRAADE</h1>
            <p class="subtitle">
                Die digitale Tauschbörse für Schülerinnen und Schüler der
                Kantonsschule Zürcher Unterland in Bülach – tauschen statt
                wegwerfen, ganz ohne Geld.
            </p>
        </div>

        <div class="about-content">
            <div class="about-item">
                <span class="item-num">01</span>
                <div class="item-body">
                    <h2>Nachhaltig</h2>
                    <p>
                        Dinge bekommen ein zweites Leben statt im Müll zu
                        landen. Schulbücher, Stifte, Hefte, Sportmaterialien –
                        alles was du nicht mehr brauchst, kann jemand anderen
                        glücklich machen.
                    </p>
                </div>
            </div>

            <div class="about-item">
                <span class="item-num">02</span>
                <div class="item-body">
                    <h2>Von Schülern für Schüler</h2>
                    <p>
                        KZU-TRAADE richtet sich ausschliesslich an Schülerinnen
                        und Schüler der KZU. Die Plattform wurde von Schülern
                        gebaut und lebt durch die Community.
                    </p>
                </div>
            </div>

            <div class="about-item">
                <span class="item-num">03</span>
                <div class="item-body">
                    <h2>Einfach & Lokal</h2>
                    <p>
                        Kein Versand, kein Geld, keine Komplikationen. Der
                        Tausch findet direkt auf dem KZU-Campus statt –
                        persönlich und unkompliziert.
                    </p>
                </div>
            </div>
        </div>

        <div class="about-how glass-panel">
            <h2>So funktioniert es</h2>
            <ol>
                <li>Registrieren und einloggen</li>
                <li>
                    Post erstellen: Gegenstand beschreiben und Foto hochladen
                </li>
                <li>
                    Mit einer anderen Person über die Nachrichtenfunktion in
                    Kontakt treten
                </li>
                <li>Tausch direkt auf dem Campus abwickeln – fertig</li>
            </ol>
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

.about-lead {
    font-size: 1.1rem;
    color: var(--text-muted);
    line-height: 1.75;
    max-width: 640px;
    margin: 0 0 1rem;
}

.about-how {
    margin-top: 2rem;
    padding: 2.5rem;
}

.about-how h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--neutral-100);
    margin: 0 0 1.25rem;
}

.about-how ol {
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    color: var(--text-main);
    font-size: 1rem;
    line-height: 1.6;
}

.about-content {
    display: flex;
    flex-direction: column;
    margin: 2rem 0;
}

.about-item {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    padding: 2rem 0;
    border-bottom: 1px solid var(--border);
}

.about-item:first-child {
    border-top: 1px solid var(--border);
}

.item-num {
    font-size: 3rem;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
    letter-spacing: -0.04em;
    min-width: 4rem;
    opacity: 0.5;
}

.item-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 0.25rem;
}

.item-body h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--neutral-100);
}

.item-body p {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.95rem;
    line-height: 1.6;
    max-width: 520px;
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

    .about-item {
        gap: 1.25rem;
    }

    .item-num {
        font-size: 2rem;
        min-width: 2.5rem;
    }
}
</style>
