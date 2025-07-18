import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const usePomodoroStore = defineStore("pomodoro", () => {
  // ################################## Stats #######################################

  // Durées en minutes
  const pomodoroDuration = ref(0.0833);
  const shortBreakDuration = ref(0.5);
  const longBreakDuration = ref(0.1667);

  // Nouveau : nombre de courtes pauses avant une longue pause
  const shortBreaksBeforeLong = ref(4);
  // Nouveau : nombre de pomodoros déjà terminés depuis la dernière longue pause
  const completedPomodoros = ref(0);

  // Temps restant en secondes pour la session en cours (arrondi à la seconde la plus proche)
  const remainingTime = ref(Math.round(pomodoroDuration.value * 60));

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
      return Math.round(pomodoroDuration.value * 60);
    } else if (currentSession.value === "short-break") {
      return Math.round(shortBreakDuration.value * 60);
    } else if (currentSession.value === "long-break") {
      return Math.round(longBreakDuration.value * 60);
    }
  });

  // Formater le temps restant au format mm:ss
  const formattedTime = computed(() => {
    // Protection contre les valeurs négatives
    const time = Math.max(0, remainingTime.value);
    const m = String(Math.floor(time / 60)).padStart(2, "0");
    const s = String(Math.floor(time % 60)).padStart(2, "0");
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

  // pDur, sDur, lDur sont des DURÉES EN MINUTES. Par défaut on utilise des valeurs très courtes pour les tests :
  // 0.0833 min ≈ 5 s, 0.05 min ≈ 3 s, 0.1667 min ≈ 10 s
  function handleClickOnTimer(
    pDur = 0.0833,
    sDur = 0.05,
    lDur = 0.1667,
    shortBreakIterations = 4
  ) {
    // Si le premier argument est un événement (clic), on ignore les paramètres personnalisés
    if (typeof pDur === "object" && pDur !== null) {
      // Réaffecte les valeurs par défaut de test
      pDur = 0.0833;
      sDur = 0.05;
      lDur = 0.1667;
      shortBreakIterations = 4;
    }
    // Si on est actuellement à l'arrêt, on initialise la configuration
    if (!isRunning.value) {
      pomodoroDuration.value = pDur;
      shortBreakDuration.value = sDur;
      longBreakDuration.value = lDur;
      shortBreaksBeforeLong.value = shortBreakIterations;

      // On réinitialise le contexte de session
      currentSession.value = "pomodoro";
      remainingTime.value = Math.round(pomodoroDuration.value * 60);
      completedPomodoros.value = 0;
    }

    // Bascule l'état de fonctionnement (play/pause)
    isRunning.value = !isRunning.value;

    if (isRunning.value) {
      // Si le timer démarre, on lance le setInterval
      timerInterval = setInterval(() => {
        tick();
      }, 1000);
    } else {
      // Si le timer est mis en pause, on arrête l'intervalle
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

  function nextSession() {
    if (currentSession.value === "pomodoro") {
      // On vient de terminer un pomodoro
      completedPomodoros.value++;

      if (completedPomodoros.value % shortBreaksBeforeLong.value === 0) {
        // Après X pomodoros, longue pause
        currentSession.value = "long-break";
        remainingTime.value = Math.round(longBreakDuration.value * 60);
        // On peut remettre le compteur à 0 pour repartir sur un nouveau cycle
        completedPomodoros.value = 0;
      } else {
        // Sinon, courte pause
        currentSession.value = "short-break";
        remainingTime.value = Math.round(shortBreakDuration.value * 60);
      }
    } else if (
      currentSession.value === "short-break" ||
      currentSession.value === "long-break"
    ) {
      // Retour à un pomodoro après une pause
      currentSession.value = "pomodoro";
      // Si on sort d'une longue pause, on arrête automatiquement le timer
      if (currentSession.value === "long-break") {
        isRunning.value = false;
        clearInterval(timerInterval);
        timerInterval = null;
      }
      remainingTime.value = Math.round(pomodoroDuration.value * 60);
    }
  }

  // Réinitialiser le timer selon la session actuelle
  function resetTimer() {
    isRunning.value = false;
    if (currentSession.value === "pomodoro") {
      remainingTime.value = Math.round(pomodoroDuration.value * 60);
    } else if (currentSession.value === "short-break") {
      remainingTime.value = Math.round(shortBreakDuration.value * 60);
    } else if (currentSession.value === "long-break") {
      remainingTime.value = Math.round(longBreakDuration.value * 60);
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
    // expose les nouvelles refs pour un éventuel besoin futur
    shortBreaksBeforeLong,
    completedPomodoros,
  };
});
