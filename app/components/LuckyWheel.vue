<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface WheelSegment {
  id: number
  label: string
  color: string
  multiplier: number
}

const token = useState<string | null>('authToken', () => null)

const isSpinning = ref(false)
const rotation = ref(0)
const selectedSegment = ref<WheelSegment | null>(null)
const userPoints = ref(0)
const resultPoints = ref(0)
const showResult = ref(false)
const isOpen = ref(false)

const segments: WheelSegment[] = [
  { id: 1, label: '✓ 2x Münzen', color: '#4CAF50', multiplier: 2 },
  { id: 2, label: '= Gleich', color: '#2196F3', multiplier: 1 },
  { id: 3, label: '✗ Verloren', color: '#f44336', multiplier: 0 }
]

const segmentAngle = computed(() => 360 / segments.length)
const wheelRadius = computed(() => 150)

async function openWheel(points: number) {
  if (!token.value) return
  
  userPoints.value = points
  isOpen.value = true
  selectedSegment.value = null
  showResult.value = false
  resultPoints.value = 0
}

function getSegmentRotation(index: number): number {
  return index * segmentAngle.value
}

function spinWheel() {
  if (isSpinning.value) return
  
  isSpinning.value = true
  showResult.value = false
  
  // Wähle ein zufälliges Segment
  const randomIndex = Math.floor(Math.random() * segments.length)
  const selectedSeg = segments[randomIndex]
  selectedSegment.value = selectedSeg
  
  // Berechne die Rotation
  // Mindestens 5 Umdrehungen + zielgerichtete Rotation
  const fullSpins = 5
  const targetRotation = getSegmentRotation(randomIndex)
  const totalRotation = 360 * fullSpins + targetRotation
  
  // Animiere die Rotation
  const startRotation = rotation.value
  const startTime = Date.now()
  const duration = 4000 // 4 Sekunden Animation
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Easing function: easeOutCubic
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    
    rotation.value = startRotation + (totalRotation * easeProgress)
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isSpinning.value = false
      showResult.value = true
      calculateResult(selectedSeg)
    }
  }
  
  animate()
}

function calculateResult(segment: WheelSegment) {
  const result = Math.floor(userPoints.value * segment.multiplier)
  resultPoints.value = result
  
  // Speichere das Ergebnis
  saveSpinResult(segment.multiplier, result)
}

async function saveSpinResult(multiplier: number, resultAmount: number) {
  try {
    await $fetch('/api/trades/spin-result', {
      method: 'POST',
      body: {
        multiplier,
        pointsBefore: userPoints.value,
        pointsAfter: resultAmount
      },
      headers: { Authorization: `Bearer ${token.value}` }
    })
  } catch (e: any) {
    console.error('Fehler beim Speichern des Spin-Ergebnisses:', e)
  }
}

function getResultMessage(segment: WheelSegment): string {
  switch (segment.multiplier) {
    case 2:
      return `🎉 Glückwunsch! Deine Münzen wurden verdoppelt!`
    case 1:
      return `⚖️ Deine Münzen bleiben gleich.`
    case 0:
      return `😢 Leider hast du diesen Spin verloren.`
    default:
      return 'Ergebnis berechnet...'
  }
}

function closeWheel() {
  isOpen.value = false
  selectedSegment.value = null
  showResult.value = false
}

defineExpose({
  openWheel
})
</script>

<template>
  <div v-if="isOpen" class="lucky-wheel-backdrop" @click.self="closeWheel">
    <section class="lucky-wheel-container">
      <button class="close-btn" type="button" @click="closeWheel">
        ×
      </button>

      <h2>🎡 Glücksrad</h2>

      <div class="wheel-wrapper">
        <!-- Zeiger oben -->
        <div class="wheel-pointer"></div>

        <!-- Rad -->
        <svg
          class="lucky-wheel"
          :style="{ transform: `rotate(${rotation}deg)` }"
          viewBox="0 0 300 300"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Segmente -->
          <g v-for="(segment, index) in segments" :key="segment.id">
            <path
              :d="generateSegmentPath(index)"
              :fill="segment.color"
              stroke="white"
              stroke-width="3"
              class="segment"
            />
            <text
              :x="getTextX(index)"
              :y="getTextY(index)"
              text-anchor="middle"
              dominant-baseline="middle"
              class="segment-text"
            >
              {{ segment.label }}
            </text>
          </g>

          <!-- Mittelpunkt -->
          <circle cx="150" cy="150" r="20" fill="white" stroke="#333" stroke-width="2" />
        </svg>
      </div>

      <!-- Punkte Anzeige -->
      <div class="points-display">
        <p class="points-text">Deine Punkte: <strong>{{ userPoints }}</strong></p>
      </div>

      <!-- Ergebnis -->
      <div v-if="showResult && selectedSegment" class="result-section">
        <div :class="['result-box', `result-${selectedSegment.multiplier}`]">
          <p class="result-message">
            {{ getResultMessage(selectedSegment) }}
          </p>
          <p v-if="selectedSegment.multiplier > 0" class="result-points">
            <strong>{{ resultPoints }}</strong> Punkte
          </p>
        </div>
      </div>

      <!-- Spin Button -->
      <button
        class="spin-btn"
        @click="spinWheel"
        :disabled="isSpinning || showResult"
        type="button"
      >
        {{ isSpinning ? 'Wird gedreht...' : showResult ? 'Fertig!' : 'DREHEN!' }}
      </button>

      <!-- Close Button -->
      <button
        v-if="showResult"
        class="btn-close-wheel"
        @click="closeWheel"
        type="button"
      >
        Schließen
      </button>
    </section>
  </div>
</template>

<script lang="ts">
function generateSegmentPath(index: number): string {
  const cx = 150
  const cy = 150
  const radius = 140
  const angle = (360 / 3) * (Math.PI / 180)
  const startAngle = (index * 360) / 3 * (Math.PI / 180)
  const endAngle = startAngle + angle

  const x1 = cx + radius * Math.cos(startAngle)
  const y1 = cy + radius * Math.sin(startAngle)
  const x2 = cx + radius * Math.cos(endAngle)
  const y2 = cy + radius * Math.sin(endAngle)

  const largeArcFlag = angle > Math.PI ? 1 : 0

  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
}

function getTextX(index: number): number {
  const angle = ((index * 360) / 3 + 60) * (Math.PI / 180)
  return 150 + 95 * Math.cos(angle)
}

function getTextY(index: number): number {
  const angle = ((index * 360) / 3 + 60) * (Math.PI / 180)
  return 150 + 95 * Math.sin(angle)
}
</script>

<style scoped>
.lucky-wheel-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.lucky-wheel-container {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  max-width: 600px;
  width: 95%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #000;
}

h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: #333;
}

.wheel-wrapper {
  position: relative;
  width: 300px;
  height: 300px;
  margin-bottom: 1.5rem;
}

.wheel-pointer {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 15px solid #333;
  z-index: 10;
}

.lucky-wheel {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 15px rgba(0, 0, 0, 0.2));
  transition: transform 0.05s linear;
}

.segment {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.segment-text {
  font-size: 14px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.points-display {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
  text-align: center;
}

.points-text {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.points-text strong {
  color: #4CAF50;
  font-size: 1.3rem;
}

.result-section {
  width: 100%;
  margin-bottom: 1rem;
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-box {
  padding: 1.5rem;
  border-radius: 0.5rem;
  text-align: center;
}

.result-2 {
  background: #e8f5e9;
  border: 2px solid #4CAF50;
}

.result-1 {
  background: #e3f2fd;
  border: 2px solid #2196F3;
}

.result-0 {
  background: #ffebee;
  border: 2px solid #f44336;
}

.result-message {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.result-2 .result-message {
  color: #2e7d32;
}

.result-1 .result-message {
  color: #1565c0;
}

.result-0 .result-message {
  color: #c62828;
}

.result-points {
  margin: 0;
  font-size: 1.3rem;
}

.result-2 .result-points {
  color: #4CAF50;
}

.result-1 .result-points {
  color: #2196F3;
}

.result-0 .result-points {
  color: #f44336;
}

.spin-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #FF9800, #F57C00);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
  letter-spacing: 1px;
}

.spin-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
}

.spin-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-close-wheel {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-wheel:hover {
  background: #e0e0e0;
}
</style>
