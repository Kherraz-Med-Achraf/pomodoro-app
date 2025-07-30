<template>
  <div class="pomodoro-app">
    <h1 class="title">Pomodoro</h1>
    <SelectMode />
    <PomodoroTimer />
    <SettingsModal />
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.pomodoro-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh;
  .title {
    margin-top: 32px;
    @include title;
    & {
      font-family: "Kumbh Sans", sans-serif;
    }
  }
  span {
    color: white;
  }
}
</style>
