import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";

export const usePomodoroStore = defineStore("pomodoro", () => {
  // ################################## Stats #######################################

  // Durées en minutes - Récupération depuis localStorage avec des valeurs par défaut réalistes
  const pomodoroDuration = ref(
    parseFloat(localStorage.getItem("pomodoroDuration")) || 25
  );
  const shortBreakDuration = ref(
    parseFloat(localStorage.getItem("shortBreakDuration")) || 5
  );
  const longBreakDuration = ref(
    parseFloat(localStorage.getItem("longBreakDuration")) || 15
  );

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

  // Détermine si l'on enchaîne automatiquement les sessions (cycle complet) ou si l'on exécute une session manuelle unique
  const autoCycle = ref(true);

  // ########################### Préférences utilisateur ###########################

  // Couleur accentuée (par défaut: teal)
  const selectedColor = ref(localStorage.getItem("selectedColor") || "#70F3F8");

  // Police active (primary | secondary | mono)
  const selectedFont = ref(localStorage.getItem("selectedFont") || "primary");

  // Applique immédiatement la couleur et la police stockées
  watch(
    selectedColor,
    (val) => {
      document.documentElement.style.setProperty("--accent-color", val);
    },
    { immediate: true }
  );

  watch(
    selectedFont,
    (val) => {
      const fontMap = {
        primary: '"Kumbh Sans", sans-serif',
        secondary: '"Roboto Slab", serif',
        mono: '"Space Mono", monospace',
      };
      
      const weightMap = {
        primary: 'bold',
        secondary: 'bold', 
        mono: 'normal', // Space Mono en regular
      };
      
      document.documentElement.style.setProperty("--font-family", fontMap[val] || fontMap.primary);
      document.documentElement.style.setProperty("--font-weight", weightMap[val] || weightMap.primary);
    },
    { immediate: true }
  );

  // Setters exposés
  function setColor(color) {
    selectedColor.value = color;
    localStorage.setItem("selectedColor", color);
  }

  function setFont(font) {
    selectedFont.value = font;
    localStorage.setItem("selectedFont", font);
  }

  function setDurations(p, s, l) {
    pomodoroDuration.value = p;
    shortBreakDuration.value = s;
    longBreakDuration.value = l;
    localStorage.setItem("pomodoroDuration", p);
    localStorage.setItem("shortBreakDuration", s);
    localStorage.setItem("longBreakDuration", l);
  }

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

  // Fonction pour démarrer/arrêter le timer
  function handleClickOnTimer() {
    // Si on est actuellement à l'arrêt, on initialise la configuration
    if (!isRunning.value) {
      // Détermine si l'on doit lancer un cycle automatique ou une session manuelle
      autoCycle.value = currentSession.value === "pomodoro";

      // Réinitialise remainingTime en fonction de la session actuelle
      if (currentSession.value === "pomodoro") {
        remainingTime.value = Math.round(pomodoroDuration.value * 60);
        completedPomodoros.value = 0;
      } else if (currentSession.value === "short-break") {
        remainingTime.value = Math.round(shortBreakDuration.value * 60);
      } else if (currentSession.value === "long-break") {
        remainingTime.value = Math.round(longBreakDuration.value * 60);
      }
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
      // Lorsque le temps est écoulé
      if (autoCycle.value) {
        // Cycle classique Pomodoro → pauses
        nextSession();
      } else {
        // Session manuelle (short-break ou long-break) : on arrête simplement le timer
        isRunning.value = false;
        clearInterval(timerInterval);
        timerInterval = null;
      }
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
    
    // Arrêter l'intervalle s'il est en cours
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    
    // Réinitialiser le temps selon la session actuelle
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
    autoCycle,
    // expose les nouvelles refs pour un éventuel besoin futur
    shortBreaksBeforeLong,
    completedPomodoros,

    // Preferences
    selectedColor,
    selectedFont,
    setColor,
    setFont,
    setDurations,
  };
});
