import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const usePomodoroStore = defineStore("pomodoro", () => {
  // ################################## Stats #######################################

  // Durées en minutes
  const pomodoroDuration = ref(0.15);
  const shortBreakDuration = ref(5);
  const longBreakDuration = ref(15);

  // Temps restant en secondes pour la session en cours
  const remainingTime = ref(pomodoroDuration.value * 60);

  // Statut du timer
  const isRunning = ref(false);

  // Type de session en cours : 'pomodoro', 'short-break' ou 'long-break'
  const currentSession = ref("pomodoro");

  // Variable to store the interval ID
  let timerInterval = null;

  // ################################## Getters #######################################

  //total de seconds pour la session en cours
  const totalSeconds = computed(() => {
    if (currentSession.value === "pomodoro") {
      return pomodoroDuration.value * 60;
    } else if (currentSession.value === "short-break") {
      return shortBreakDuration.value * 60;
    } else if (currentSession.value === "long-break") {
      return longBreakDuration.value * 60;
    }
  });

  // Formater le temps restant au format mm:ss
  const formattedTime = computed(() => {
    const m = String(Math.floor(remainingTime.value / 60)).padStart(2, "0");
    const s = String(remainingTime.value % 60).padStart(2, "0");
    return `${m}:${s}`;
  });

  // Libellé du bouton de démarrage/arrêt
  const status = computed(() => {
    if (isRunning.value) return "Pause";
    return "Start";
  });

  // Libellé de la session actuelle
  const sessionLabel = computed(() => {
    if (currentSession.value === "pomodoro") return "Pomodoro";
    if (currentSession.value === "short-break") return "Courte pause";
    if (currentSession.value === "long-break") return "Longue pause";
  });

  // ################################## Actions #######################################

  // Démarrer le timer
  function handleClickOnTimer() {
    isRunning.value = !isRunning.value;
    if (isRunning.value) {
      // Si le timer est démarré
      timerInterval = setInterval(() => {
        tick();
      }, 1000);
    } else {
      // Si le timer est arrêté
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // Décrémente le timer chaque seconde (à appeler via un setInterval)
  function tick() {
    if (remainingTime.value > 0) {
      remainingTime.value--;
    } else {
      // Quand le temps est écoulé, passe à la session suivante
      nextSession();
    }
  }

  // Passer à la session suivante
  function nextSession() {
    if (currentSession.value === "pomodoro") {
      currentSession.value = "short-break";
      remainingTime.value = shortBreakDuration.value * 60;
    } else if (currentSession.value === "short-break") {
      currentSession.value = "pomodoro";
      remainingTime.value = pomodoroDuration.value * 60;
    } else {
      // Pour 'long-break'
      currentSession.value = "pomodoro";
      remainingTime.value = pomodoroDuration.value * 60;
    }
  }

  // Réinitialiser le timer selon la session actuelle
  function resetTimer() {
    isRunning.value = false;
    if (currentSession.value === "pomodoro") {
      remainingTime.value = pomodoroDuration.value * 60;
    } else if (currentSession.value === "short-break") {
      remainingTime.value = shortBreakDuration.value * 60;
    } else if (currentSession.value === "long-break") {
      remainingTime.value = longBreakDuration.value * 60;
    }
  }

  return {
    // états
    pomodoroDuration,
    shortBreakDuration,
    longBreakDuration,
    totalSeconds,
    remainingTime,
    isRunning,
    currentSession,

    // getter
    sessionLabel,
    formattedTime,
    status,

    // actions
    handleClickOnTimer,
    resetTimer,
    nextSession,
    tick,
  };
});
