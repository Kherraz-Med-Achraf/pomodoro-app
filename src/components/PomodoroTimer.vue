<template>
  <div class="pomodoro-timer">
    <div class="oval">
      <div class="oval-two">
        <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
          <motion.circle
            :cx="center"
            :cy="center"
            :r="radius"
            fill="none"
            stroke="#70F3F8"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :animate="{ strokeDashoffset: circOffset }"
            :transition="{ duration: 0.3, easing: 'spring' }"
            :transform="`rotate(-90 ${center} ${center})`"
          />
        </svg>
        <div class="timer-text">
          <h1>{{ formattedTime }}</h1>
          <h3>Pause</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { motion } from "motion-v";

const size = 248.05;
const strokeWidth = 10;
const totalSeconds = 60;

const timeLeft = ref(totalSeconds);
let intervalId = null;

const center = computed(() => size / 2);
const radius = computed(() => (size - strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const circOffset = computed(
  () => circumference.value * (1 - timeLeft.value / totalSeconds)
);

const formattedTime = computed(() => {
    const m = String(Math.floor(timeLeft.value / 60)).padStart(2, "0");
    const s = String(timeLeft.value % 60).padStart(2, "0");
    return `${m}:${s}`;
});

onMounted(() => {
  intervalId = setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--;
    else clearInterval(intervalId);
  }, 1000);
});

onUnmounted(() => clearInterval(intervalId));
</script>

<style scoped lang="scss">
.pomodoro-timer {
  margin-top: 48px;
  width: 300px;
  height: 300px;

  .oval {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #0e112a 0%, #2e325a 100%);
    box-shadow: -50px -50px 100px #272c5a, 50px 50px 100px #121530;

    .oval-two {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 267.8px;
      height: 267.8px;
      border-radius: 50%;
      background-color: #161932;

      .timer-text {
        position: absolute;
        color: white;
        width: 170px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        h1 {
            @include heading(1,primary);
        }
        h3 {
            @include heading(3,primary);
        }
      }
    }
  }
}
</style>
