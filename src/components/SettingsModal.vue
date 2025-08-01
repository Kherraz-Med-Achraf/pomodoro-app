<template>
  <div class="settings-component">
    <!-- Bouton engrenage -->
    <button
      class="gear-btn"
      @click="openModal"
      aria-label="Ouvrir les paramètres"
    >
      <GearIcon />
    </button>

    <!-- Overlay & modal -->
    <transition name="fade">
      <div v-if="isOpen" class="overlay" @click.self="closeModal">
        <transition name="zoom">
          <div class="modal" @click.stop>
            <div class="top-bar">
              <h2>Settings</h2>
              <CloseIcon class="close-icon" @click="closeModal" />
            </div>
            <hr class="divider" />
            <form @submit.prevent="applySettings">
              <div class="time-settings">
                <h4>TIME (MINUTES)</h4>
                <div class="time-settings-container">
                  <div class="field-group">
                    <label>pomodoro</label>
                    <input
                      type="number"
                      v-model.number="pomodoro"
                      min="1"
                      step="1"
                      required
                    />
                    <div class="arrows">
                      <button
                        type="button"
                        class="arrow up"
                        @click="pomodoro++"
                      >
                        <ArrowUpIcon />
                      </button>
                      <button
                        type="button"
                        class="arrow down"
                        @click="pomodoro > 1 && pomodoro--"
                      >
                        <ArrowDownIcon />
                      </button>
                    </div>
                  </div>
                  <div class="field-group">
                    <label>short break</label>
                    <input
                      type="number"
                      v-model.number="shortBreak"
                      min="1"
                      step="1"
                      required
                    />
                    <div class="arrows">
                      <button
                        type="button"
                        class="arrow up"
                        @click="shortBreak++"
                      >
                        <ArrowUpIcon />
                      </button>
                      <button
                        type="button"
                        class="arrow down"
                        @click="shortBreak > 1 && shortBreak--"
                      >
                        <ArrowDownIcon />
                      </button>
                    </div>
                  </div>
                  <div class="field-group">
                    <label>long break</label>
                    <input
                      type="number"
                      v-model.number="longBreak"
                      min="1"
                      step="1"
                      required
                    />
                    <div class="arrows">
                      <button
                        type="button"
                        class="arrow up"
                        @click="longBreak++"
                      >
                        <ArrowUpIcon />
                      </button>
                      <button
                        type="button"
                        class="arrow down"
                        @click="longBreak--"
                      >
                        <ArrowDownIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <hr class="form-divider" />
              <div class="choice-group">
                <h4>FONT</h4>
                <div class="font-options">
                  <label
                    v-for="f in fonts"
                    :key="f.value"
                    :style="{ fontFamily: f.family }"
                    class="font-label"
                  >
                    <input
                      type="radio"
                      v-model="font"
                      :value="f.value"
                      name="font-selection"
                      class="font-radio"
                    />
                    <span class="font-bubble">Aa</span>
                  </label>
                </div>
              </div>
              <hr class="form-divider" />
              <div class="choice-group">
                <h4>COLOR</h4>
                <div class="color-options">
                  <label
                    v-for="c in colors"
                    :key="c.value"
                    class="color-option"
                  >
                    <input type="radio" v-model="color" :value="c.hex" />
                    <span class="swatch" :style="{ backgroundColor: c.hex }">
                      <CheckIcon
                        class="check-icon"
                        :class="{ visible: color === c.hex }"
                      />
                    </span>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                class="apply-btn"
                @click="applySettings"
                :style="{ backgroundColor: color }"
              >
                Apply
              </button>
            </form>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { usePomodoroStore } from "@/stores/pomodoro";
import GearIcon from "@/assets/icons/Gear.svg";
import CloseIcon from "@/assets/icons/Close.svg";
import ArrowUpIcon from "@/assets/icons/ArrowUp.svg";
import ArrowDownIcon from "@/assets/icons/ArrowDown.svg";
import CheckIcon from "@/assets/icons/checked.svg";
const store = usePomodoroStore();

const isOpen = ref(false);

function openModal() {
  // Synchronise les valeurs locales avec l'état actuel du store
  pomodoro.value = store.pomodoroDuration;
  shortBreak.value = store.shortBreakDuration;
  longBreak.value = store.longBreakDuration;
  font.value = store.selectedFont;
  color.value = store.selectedColor;
  isOpen.value = true;
}

function closeModal() {
  isOpen.value = false;
}

// Valeurs locales initialisées depuis le store
const pomodoro = ref(store.pomodoroDuration);
const shortBreak = ref(store.shortBreakDuration);
const longBreak = ref(store.longBreakDuration);

const font = ref(store.selectedFont);
const color = ref(store.selectedColor);

const fonts = [
  { value: "primary", text: "Kumbh Sans", family: '"Kumbh Sans", sans-serif' },
  { value: "secondary", text: "Roboto Slab", family: '"Roboto Slab", serif' },
  { value: "mono", text: "Space Mono", family: '"Space Mono", monospace' },
];

const colors = [
  { value: "red", hex: "#F87070" },
  { value: "teal", hex: "#70F3F8" },
  { value: "purple", hex: "#D881F8" },
];

function applySettings() {
  // Durées
  store.setDurations(pomodoro.value, shortBreak.value, longBreak.value);
  // Réinitialise le timer pour appliquer immédiatement les nouvelles valeurs
  store.resetTimer();

  // Police & couleur
  store.setFont(font.value);
  store.setColor(color.value);

  // Ferme la modal
  closeModal();
}
</script>

<style scoped lang="scss">
/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.zoom-enter-from,
.zoom-leave-to {
  transform: scale(0.8);
  opacity: 0;
}
.zoom-enter-to,
.zoom-leave-from {
  transform: scale(1);
  opacity: 1;
}
.settings-component {
  margin-top: 79px;
}

.gear-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.5s ease, color 0.3s ease;
  svg {
    color: $color-light-blue;
    transition: color 0.3s ease;
  }
  &:hover {
    transform: rotate(180deg) scale(1.3);
  }
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: $color-white;
  padding: 24px;
  border-radius: 15px;
  width: 100%;
  max-width: calc(100% - 48px);
  color: $color-near-black;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  align-items: center;
  .top-bar {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    h2 {
      @include heading(2, primary);
      & {
        text-align: center;
      }
    }
    .close-icon {
      cursor: pointer;
      transition: transform 0.3s ease, color 0.3s ease;
      &:hover {
        transform: scale(1.5);
        color: $color-red;
      }
    }
  }

  .divider {
    border: 1px solid $color-divider;
    width: calc(100% + 48px);
  }
  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    .form-divider {
      border: 1px solid $color-divider;
      width: 100%;
    }
    h4 {
      @include heading(4, primary);
      & {
        text-align: center;
      }
    }

    .time-settings {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 15px;
      .time-settings-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        .field-group {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          label {
            @include body(2);
            color: $color-light-gray;
          }
          input {
            @include body(1);
            color: $color-near-black;
            background: $color-off-white;
            border: none;
            border-radius: 10px;
            height: 40px;
            padding: 16px;
            max-width: 140px;
          }
          input[type="number"] {
            /* Chrome, Safari, Edge, Opera */
            &::-webkit-outer-spin-button,
            &::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
            /* Firefox */
            appearance: textfield;
            -moz-appearance: textfield;
          }
          .arrows {
            position: absolute;
            right: 16px;
            display: flex;
            flex-direction: column;
            button {
              background: transparent;
              border: none;
              cursor: pointer;
              transition: transform 0.3s ease;
              &:hover {
                transform: scale(1.5);
              }
              &:active {
                transform: scale(1.1);
              }
            }
          }
        }
      }
    }

    .choice-group {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 18px;
      .font-options {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        .font-label {
          position: relative;
          cursor: pointer;
          input[type="radio"].font-radio {
            // Cache l'input, mais le garde accessible !
            position: absolute;
            opacity: 0;
            // Pour accessibilité : focus visible
            &:focus-visible + .font-bubble {
              box-shadow: 0 0 0 3px #dde5ff;
            }
          }

          .font-bubble {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #f4f6fa;
            color: $color-near-black;
            font-size: 15px;
            font-weight: bold; // Force bold pour tous les aperçus
            border: 2px solid transparent;
            transition: all 0.2s;
            user-select: none;
            // Utilise la police héritée du label parent, pas la police centralisée
            font-family: inherit;
          }

          input[type="radio"].font-radio:checked + .font-bubble {
            background: #1b203a; // ta couleur d’accent
            color: #fff;
            border: 2px solid #233057;
          }
        }
      }
      .color-options {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        margin-bottom: 32px;
        .color-option {
          position: relative;
          cursor: pointer;
          input[type="radio"] {
            // Cache l'input, mais le garde accessible !
            position: absolute;
            opacity: 0;
            // Pour accessibilité : focus visible
            &:focus-visible + .font-bubble {
              box-shadow: 0 0 0 3px #dde5ff;
            }
          }
          .swatch {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid transparent;
            transition: all 0.2s;
            user-select: none;
            position: relative;
            .check-icon {
              position: absolute;
              opacity: 0;
              transform: scale(0.5);
              transition: opacity 0.2s ease, transform 0.2s ease;

              &.visible {
                opacity: 1;
                transform: scale(1);
              }
            }
          }
        }
      }
    }
    .btn-group {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      button {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        &.cancel {
          background: transparent;
        }
      }
    }

    .apply-btn {
      position: absolute;
      bottom: -26.5px;
      width: 140px;
      height: 53px;
      border-radius: 26.5px;
      color: $color-white;
      @include body(1);
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      &:hover {
        transform: scale(1.05);
      }
    }
  }

  @media (min-width: 768px) {
    max-width: 540px;
    padding: 40px;
    form {
      .time-settings {
        .time-settings-container {
          flex-direction: row;
          gap: 20px;
          .field-group {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            input {
              height: 48px;
            }
            .arrows {
              bottom: 10px;
            }
          }
        }
      }
      .choice-group {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        .color-options {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
