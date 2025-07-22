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
            :stroke="pomodoroStore.selectedColor"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :animate="{ strokeDashoffset: circOffset }"
            :transition="{ duration: 0.3, easing: 'spring' }"
            :transform="`rotate(-90 ${center} ${center})`"
          />
        </svg>
        <div class="timer-text" @click="pomodoroStore.handleClickOnTimer">
          <h1>{{ pomodoroStore.formattedTime }}</h1>
          <h3>{{ pomodoroStore.status }}</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { motion } from "motion-v";
import { usePomodoroStore } from '@/stores/pomodoro'

const pomodoroStore = usePomodoroStore()

const size = 248.05;
const strokeWidth = 10;

const center = computed(() => size / 2);
const radius = computed(() => (size - strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const circOffset = computed(
  () => circumference.value * (1 - pomodoroStore.remainingTime / pomodoroStore.totalSeconds)
);

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
