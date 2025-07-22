<template>
  <div class="select-mode">
    <motion.div
      v-if="activeLayout"
      layoutId="pill"
      class="pill-bg"
      :style="{ left: `${activeLayout}px`, backgroundColor: pomodoroStore.selectedColor }"
    />

    <button
      v-for="(label, index) in modes"
      :key="label.value"
      :ref="(el) => (buttonRefs[index] = el)"
      :class="{ active: currentMode === label.value }"
      @click="() => setMode(label.value, index)"
    >
      {{ label.text }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from "vue";
import { motion } from "motion-v";
import { usePomodoroStore } from "@/stores/pomodoro";

// Map component modes to store sessions
const modes = [
  { value: "pomodoro", text: "Pomodoro" },
  { value: "short-break", text: "Short Break" },
  { value: "long-break", text: "Long Break" },
];

const pomodoroStore = usePomodoroStore();

// currentMode is directly tied to the store's currentSession
const currentMode = computed({
  get: () => pomodoroStore.currentSession,
  set: (val) => {
    pomodoroStore.currentSession = val;
  },
});

const activeIndex = ref(0);
const activeLayout = ref(0);
const buttonRefs = [];

const updateLayout = () => {
  const el = buttonRefs[activeIndex.value];
  if (el) {
    activeLayout.value = el.offsetLeft;
  }
};

const setMode = (mode, index) => {
  // Update store session and UI
  currentMode.value = mode;
  activeIndex.value = index;
  pomodoroStore.resetTimer(); // Reset timer when user manually changes mode
  nextTick(updateLayout);
};

// Keep activeIndex in sync when session changes automatically (e.g., timer ends)
watch(
  () => pomodoroStore.currentSession,
  (newSession) => {
    const idx = modes.findIndex((m) => m.value === newSession);
    if (idx !== -1) {
      activeIndex.value = idx;
      nextTick(updateLayout);
    }
  },
  { immediate: true }
);

onMounted(() => {
  updateLayout();
});

watch(activeIndex, () => nextTick(updateLayout));
</script>

<style lang="scss" scoped>
.select-mode {
  margin-top: 45px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 327px;
  height: 63px;
  background-color: $color-near-black;
  border-radius: 31.5px;
  padding: 0 5px;

  button {
    position: relative;
    z-index: 2;
    width: 100%;
    flex: 1;
    height: 48px;
    border-radius: 26.5px;
    background-color: transparent;
    border: none;
    color: $color-light-blue;
    cursor: pointer;
    font-weight: 600;
    transition: color 0.3s;
    &.active {
      color: $color-dark-blue;
    }
  }

  .pill-bg {
    position: absolute;
    top: 8px;
    width: 105px;
    height: 48px;
    border-radius: 26.5px;
    background-color: $color-teal;
    z-index: 1;
  }
}
</style>
