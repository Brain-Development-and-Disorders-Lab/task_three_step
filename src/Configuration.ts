/**
 * @summary Configuration for Keramati et al. model-based model-free
 * decision-making task.
 *
 * @description Contains specific parameters used in the Keramati et al.
 * model-based model-free decision-making task, contains the number of
 * trials and different key layouts.
 *
 * @link   https://github.com/henry-burgess/ccddm2020/blob/master/tasks/threestep/src/config.js
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */

import { LogLevel } from "consola";
import { CONTROLLERS } from "./lib/Constants";

export const Configuration = {
  // -------------------- Information --------------------
  name: "Maze",
  studyName: "three_step_game",
  contact: "henry.burgess@wustl.edu",
  allowParticipantContact: false,
  localisation: "en-AU",

  // -------------------- URL embeds --------------------
  embeds: {
    startVideo: "https://www.youtube.com/embed/_kFkBjvrBDM?&autoplay=1",
    midVideo: "https://www.youtube.com/embed/5fs5UNG1F28?&autoplay=1",
  },

  // -------------------- Manipulations --------------------
  manipulations: {
    // Trial parameters
    interTrialCountdown: 15, // Duration of countdown between trials
    probability: 0.7, // Probability of common transition
    resources: "high", // high -> 3000ms, low -> 1000ms

    // Trial counts
    levelOnePracticeTrials: 5, // Level one practice trials
    levelTwoPracticeTrials: 10, // Level two practice trials
    levelThreePracticeTrials: 20, // Level three practice trials
    levelOneMainTrials: 5, // Level one main trials
    levelTwoMainTrials: 10, // Level two main trials
    levelThreeMainTrials: 250, // Level three main trials

    // Timeout monitoring
    timeoutCount: 10, // Number of trials to timeout before the message changes
    timeoutRestrictions: false, // Kick out participants after timeouts
    timeoutProportion: 0.3, // Proportion of acceptable timeouts

    // Breaks during the main trials
    enableBreaks: true, // Enable and disable breaks during the main trials
    breakFrequency: 50, // Number of trials before a break screen is shown
  },

  // -------------------- Stimuli --------------------
  stimuli: {
    // Stimuli - main
    "1.png": "img/main/1.png",
    "2.png": "img/main/2.png",
    "3.png": "img/main/3.png",
    "4.png": "img/main/4.png",
    "5.png": "img/main/5.png",
    "6.png": "img/main/6.png",
    "7.png": "img/main/7.png",
    "8.png": "img/main/8.png",
    "9.png": "img/main/9.png",
    "10.png": "img/main/10.png",
    "blank.png": "img/main/blank.png",

    // Stimuli - practice
    "1_p.png": "img/practice/1_p.png",
    "2_p.png": "img/practice/2_p.png",
    "3_p.png": "img/practice/3_p.png",
    "4_p.png": "img/practice/4_p.png",
    "5_p.png": "img/practice/5_p.png",
    "6_p.png": "img/practice/6_p.png",
    "7_p.png": "img/practice/7_p.png",
    "8_p.png": "img/practice/8_p.png",
    "9_p.png": "img/practice/9_p.png",
    "10_p.png": "img/practice/10_p.png",
    "blank_p.png": "img/practice/blank_p.png",

    // Stimuli - other
    "focus.png": "img/other_stimuli/focus.png",
    "no_reward.png": "img/other_stimuli/no_reward.png",
    "timeout.png": "img/other_stimuli/timeout.png",
    "treasure_chest.gif": "img/other_stimuli/treasure_chest.gif",

    // Instructions
    "Instructions1.png": "img/instructions/Instructions1.png",
    "Instructions2.png": "img/instructions/Instructions2.png",
    "Instructions3.png": "img/instructions/Instructions3.png",
    "Instructions4.png": "img/instructions/Instructions4.png",
    "Instructions5.png": "img/instructions/Instructions5.png",
    "Instructions6.png": "img/instructions/Instructions6.png",
    "Instructions7.png": "img/instructions/Instructions7.png",
    "Instructions8.png": "img/instructions/Instructions8.png",
    "Instructions9.png": "img/instructions/Instructions9.png",
    "Instructions10.png": "img/instructions/Instructions10.png",
    "Instructions11.png": "img/instructions/Instructions11.png",
    "Instructions12.png": "img/instructions/Instructions12.png",
    "Instructions13.png": "img/instructions/Instructions13.png",
    "Instructions14.png": "img/instructions/Instructions14.png",
    "Instructions15.png": "img/instructions/Instructions15.png",
    "Instructions16.png": "img/instructions/Instructions16.png",
    "Instructions17.png": "img/instructions/Instructions17.png",
    "InstructionsDecision.png": "img/instructions/InstructionsDecision.png",
    "InstructionsRewardDecision.png":
      "img/instructions/InstructionsRewardDecision.png",

    // Controls - Spectrometer
    "ControlsQuestionSpectrometer.png":
      "img/controls/ControlsQuestionSpectrometer.png",
    "ControlsNavigationSpectrometer.png":
      "img/controls/ControlsNavigationSpectrometer.png",

    // Buttons - Spectrometer
    "btn_1.png": "img/buttons/btn_1.png",
    "btn_2.png": "img/buttons/btn_2.png",
    "btn_3.png": "img/buttons/btn_3.png",
    "btn_4.png": "img/buttons/btn_4.png",
  },

  // -------------------- Style constants --------------------
  style: {
    image: `max-height: 40vh; ` + `max-width: 60vw; `,
    controlImage: `width: 40vw;`,
    keyboard:
      `vertical-align:middle; ` +
      `height: 5.5rem; ` +
      `width: auto; ` +
      `margin: 0.5rem;`,
  },

  // Timing configuration, times specified in milliseconds
  timings: {
    fixation: 1000, // Fixation dot
    decisionOne: {
      high: 3000,
      low: 1000,
    },
    selectionOne: 500, // Time while outlined
    decisionTwo: {
      high: 3000,
      low: 1000,
    },
    selectionTwo: 400, // Time while outlined
    forcedWaiting: 500, // Time before white outline
    decisionThree: {
      high: 3000,
      low: 1000,
    },
    reward: 3000, // Time while reward shown
    timeout: 5000, // Time while timeout shown
  },

  // -------------------- Keybindings --------------------
  controller: CONTROLLERS.KEYBOARD, // Specify the layout to use
  keymaps: {
    keyboard: {
      name: CONTROLLERS.KEYBOARD,
      next: "j",
      previous: "f",
      alt: "d",
      submit: " ",
      showButtons: false,
    },
    spectrometer: {
      name: CONTROLLERS.SPECTROMETER,
      next: "3",
      previous: "2",
      alt: "1",
      submit: "4",
      trigger: "5",
      showButtons: false,
    },
  },

  // -------------------- Instructions --------------------
  showInstructions: false,
  showVideo: true,

  // -------------------- Other features --------------------
  fullscreen: true, // Enable fullscreen mode
  debugMode: false, // Toggle attention-checks and countdowns
  seed: "threestep", // Seed for any random numbers generated
  logLevel: LogLevel.Log,

  // -------------------- Cheats --------------------
  cheats: {
    showReward: false, // Final build should leave this 'false'
    increasePracticeRewards: true,
    practiceRewardDelta: 5, // Number of trials before placing treasure
    practiceFirstReward: 2, // Number of trials before delta starts
  },
};
