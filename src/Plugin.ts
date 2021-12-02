/**
 * @summary Main jsPsych plugin file for Keramati et al. model-based model-free
 * decision-making task.
 *
 * @link   https://github.com/henry-burgess/ccddm2020/blob/master/tasks/threestep/src/core/plugin.ts
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */
// Experiment Configurationuration
import { Configuration } from "./Configuration";

// Core modules
import { State, Stimuli, Runner } from "./lib/Runtime";
import { STIMULUS } from "./lib/Constants";
import { flash } from "./lib/Functions";

// Stylesheets
import "jspsych/css/jspsych.css";
import "./css/styles.css";

// Make compiler happy by declaring jsPsych
declare const jsPsych: any;

// Logging library
import consola from "consola";

jsPsych.plugins["threestep-task"] = (function () {
  const plugin = {
    info: {},
    trial: function (displayElement: HTMLElement, trial): void {
      throw new Error("Not implemented!");
    },
  };

  // -------------------- Plugin Info --------------------
  plugin.info = {
    name: "threestep-task",
    parameters: {
      transition_probability: {
        type: jsPsych.plugins.parameterType.FLOAT,
        default: undefined,
      },
      mappings: {
        type: jsPsych.plugins.parameterType.OBJECT,
        default: undefined,
      },
      stage: {
        type: jsPsych.plugins.parameterType.STRING,
        default: undefined,
      },
    },
  };

  // -------------------- Plugin Trial --------------------
  plugin.trial = function (displayElement, trial): void {
    // Set the log level
    consola.level = Configuration.logLevel;

    // Display the reward location if enabled
    if (Configuration.cheats.showReward === true) {
      consola.info(`[Cheats] Reward stimulus: ${trial.trialRewardStimulus}`);
    }

    // Hide the cursor for the whole document
    document.body.style.cursor = "none";

    // -------------------- Trial Setup --------------------
    // Instantiate the data storage object
    const records = {
      // Trial count
      trial:
        jsPsych.data.get().filter({ trial_type: "threestep-task" }).count() + 1,

      // States
      firstState: 0,
      secondState: 0,
      thirdState: 0,

      // Stimuli
      firstStimulus: 0,
      secondStimulus: 0,
      thirdStimulus: 0,

      // Actions
      firstAction: 0,
      firstActionRaw: 0,
      secondAction: 0,
      secondActionRaw: 0,

      // Reaction times
      firstReactionTime: 0,
      secondReactionTime: 0,
      thirdReactionTime: 0,

      // Record timeouts
      slowFirstAction: 0,
      slowSecondAction: 0,
      slowThirdAction: 0,

      // Transitions
      firstTransition: trial.data.firstTransition,
      secondTransition: trial.data.secondTransition,

      // Reward
      highlyRewardingState: trial.data.highlyRewardingState,
      rewardPosition: trial.data.rewardPosition,
      rewarded: 0,
      totalReward: 0,
    };

    // Interaction data from the participant
    // Organised separately
    const interactions = {
      selections: [],
      path: [],
      keypresses: [],
    };

    // Interaction start times
    // Used to calculate RTs
    const starts = {
      trial: 0,
      firstReactionTime: 0,
      secondReactionTime: 0,
      thirdReactionTime: 0,
    };

    // State setup
    const state = new State(jsPsych.currentTimelineNodeID(), trial.mappings);
    // Set the reward stimulus (adjust for location)
    state.setRewardStimulus(records.rewardPosition + 6);

    // Flag if the participant received a reward or not
    let wasRewarded = false;

    // Set stimuli currently being displayed to the participant
    let currentStimuli: Stimuli = null;

    // Get the keymap being used
    const keymap = Configuration.keymaps[Configuration.controller];
    consola.info(`Experiment using '${Configuration.controller}' keymap`);

    // -------------------- Stimuli --------------------
    const STIMULI = {
      GENERAL: {
        FIXATION: {
          name: "fixation",
          stage: trial.stage,
          description: "Fixation cross placed in the centre of the aperture",
          stimuli: [STIMULUS.BLANK, STIMULUS.FOCUS, STIMULUS.BLANK],
          isInteractive: false,
          response: undefined,
          bindings: {},
          target: displayElement,
          timing: {
            pre: 0,
            run: Configuration.timings.fixation,
            post: 0,
          },
          onFinish: nextStimuli,
        },
        REWARD: {
          name: "reward",
          stage: trial.stage,
          description: "Reward stimulus",
          stimuli: [STIMULUS.BLANK, STIMULUS.REWARD, STIMULUS.BLANK],
          isInteractive: false,
          response: undefined,
          bindings: {},
          target: displayElement,
          timing: {
            pre: 0,
            run: Configuration.timings.reward,
            post: 0,
          },
          onFinish: nextStimuli,
        },
        TIMEOUT: {
          name: "timeout",
          stage: trial.stage,
          description: "Timeout stimulus",
          stimuli: [STIMULUS.BLANK, STIMULUS.TIMEOUT, STIMULUS.BLANK],
          isInteractive: false,
          response: undefined,
          bindings: {},
          target: displayElement,
          timing: {
            pre: 0,
            run: Configuration.timings.timeout,
            post: 0,
          },
          onFinish: endTrial,
        },
      },
      PRACTICE: {
        // -------------------- Practice Stimuli --------------------
        // Stimuli shown during the practice games
        ONE: {
          name: "decisionOne",
          stage: trial.stage,
          description:
            "First decision made by the participant in the " + "practice games",
          stimuli: ["stimulus_p", "focus", "stimulus_p"],
          isInteractive: true,
          response: undefined,
          bindings: {
            [keymap.previous]: {
              choice: "left",
              handler: onKeypress,
            },
            [keymap.next]: {
              choice: "right",
              handler: onKeypress,
            },
          },
          target: displayElement,
          timing: {
            pre: 0,
            run: Configuration.timings.decisionOne[
              Configuration.manipulations.resources
            ],
            post: Configuration.timings.selectionOne,
          },
          onFinish: nextStimuli,
        },
        TWO: {
          name: "decisionTwo",
          stage: trial.stage,
          description:
            "Second decision made by the participant in the " +
            "practice games",
          stimuli: [STIMULUS.PRACTICE, STIMULUS.FOCUS, STIMULUS.PRACTICE],
          isInteractive: true,
          response: undefined,
          bindings: {
            [keymap.previous]: {
              choice: "left",
              handler: onKeypress,
            },
            [keymap.next]: {
              choice: "right",
              handler: onKeypress,
            },
          },
          target: displayElement,
          timing: {
            pre: 0,
            run: Configuration.timings.decisionTwo[
              Configuration.manipulations.resources
            ],
            post: Configuration.timings.selectionTwo,
          },
          onFinish: nextStimuli,
        },
        THREE: {
          name: "decisionThree",
          stage: trial.stage,
          description: "Third practice decision",
          stimuli: ["blank_p", "stimulus_p", "blank_p"],
          isInteractive: true,
          response: undefined,
          bindings: {
            [keymap.submit]: {
              choice: "left",
              handler: onKeypress,
            },
          },
          target: displayElement,
          timing: {
            pre: 0,
            run: Configuration.timings.decisionThree[
              Configuration.manipulations.resources
            ],
            post: 0,
          },
          onFinish: nextStimuli,
        },
        NON_INTERACTIVE: {
          // -------------------- Non-Interactive Stimuli --------------------
          TWO: {
            name: "decisionTwo",
            stage: trial.stage,
            description: "Second practice decision, non-interactive",
            stimuli: ["stimulus_p", "focus", "stimulus_p"],
            isInteractive: false,
            response: undefined,
            bindings: {},
            target: displayElement,
            timing: {
              pre: 0,
              run: Configuration.timings.decisionTwo[
                Configuration.manipulations.resources
              ],
              post: Configuration.timings.selectionTwo,
            },
            onFinish: nextStimuli,
          },
          THREE: {
            name: "decisionThree",
            stage: trial.stage,
            description: "Third practice decision, non-interactive",
            stimuli: ["blank_p", "stimulus_p", "blank_p"],
            isInteractive: false,
            response: undefined,
            bindings: {},
            target: displayElement,
            timing: {
              pre: 0,
              run: Configuration.timings.decisionThree[
                Configuration.manipulations.resources
              ],
              post: 0,
            },
            onFinish: nextStimuli,
          },
        },
      },
      MAIN: {
        // -------------------- Main Stimuli --------------------
        // Stimuli shown during the main games
        ONE: {
          name: "decisionOne",
          stage: trial.stage,
          description:
            "First real decision made by the participant during " +
            "the main games",
          stimuli: ["stimulus", "focus", "stimulus"],
          isInteractive: true,
          response: undefined,
          bindings: {
            [keymap.previous]: {
              choice: "left",
              handler: onKeypress,
            },
            [keymap.next]: {
              choice: "right",
              handler: onKeypress,
            },
          },
          target: displayElement,
          timing: {
            pre: 0,
            run: Configuration.timings.decisionOne[
              Configuration.manipulations.resources
            ],
            post: Configuration.timings.selectionOne,
          },
          onFinish: nextStimuli,
        },
        TWO: {
          name: "decisionTwo",
          stage: trial.stage,
          description:
            "Second real decision made by the participant in " +
            "the main games",
          stimuli: ["stimulus", "focus", "stimulus"],
          isInteractive: true,
          response: undefined,
          bindings: {
            [keymap.previous]: {
              choice: "left",
              handler: onKeypress,
            },
            [keymap.next]: {
              choice: "right",
              handler: onKeypress,
            },
          },
          target: displayElement,
          timing: {
            pre: 0,
            run: Configuration.timings.decisionTwo[
              Configuration.manipulations.resources
            ],
            post: Configuration.timings.selectionTwo,
          },
          onFinish: nextStimuli,
        },
        THREE: {
          name: "decisionThree",
          stage: trial.stage,
          description:
            "Third real decision made by the participant in " +
            "the main games",
          stimuli: ["blank", "stimulus", "blank"],
          isInteractive: true,
          response: undefined,
          bindings: {
            [keymap.submit]: {
              choice: "left",
              handler: onKeypress,
            },
          },
          target: displayElement,
          timing: {
            pre: 0,
            run: Configuration.timings.decisionThree[
              Configuration.manipulations.resources
            ],
            post: 0,
          },
          onFinish: nextStimuli,
        },
        NON_INTERACTIVE: {
          // -------------------- Non-Interactive Stimuli --------------------
          TWO: {
            name: "decisionTwo",
            stage: trial.stage,
            description: "Second main decision, non-interactive",
            stimuli: ["stimulus", "focus", "stimulus"],
            isInteractive: false,
            response: undefined,
            bindings: {},
            target: displayElement,
            timing: {
              pre: 0,
              run: Configuration.timings.decisionTwo[
                Configuration.manipulations.resources
              ],
              post: Configuration.timings.selectionTwo,
            },
            onFinish: nextStimuli,
          },
          THREE: {
            name: "decisionThree",
            stage: trial.stage,
            description: "Third main decision, non-interactive",
            stimuli: ["blank", "stimulus", "blank"],
            isInteractive: false,
            response: undefined,
            bindings: {},
            target: displayElement,
            timing: {
              pre: 0,
              run: Configuration.timings.decisionThree[
                Configuration.manipulations.resources
              ],
              post: 0,
            },
            onFinish: nextStimuli,
          },
        },
        PRACTICE: {
          ONE: {
            name: "decisionOne",
            stage: trial.stage,
            description:
              "First practice decision made by the " +
              "participant in the main games",
            stimuli: ["stimulus", "focus", "stimulus"],
            isInteractive: true,
            response: undefined,
            bindings: {
              [keymap.previous]: {
                choice: "left",
                handler: onKeypress,
              },
              [keymap.next]: {
                choice: "right",
                handler: onKeypress,
              },
            },
            target: displayElement,
            timing: {
              pre: 0,
              run: Configuration.timings.decisionOne[
                Configuration.manipulations.resources
              ],
              post: Configuration.timings.selectionOne,
            },
            onFinish: nextStimuli,
          },
          TWO: {
            name: "decisionTwo",
            stage: trial.stage,
            description:
              "Second practice decision made by the " +
              "participant in the main games",
            stimuli: ["stimulus", "focus", "stimulus"],
            isInteractive: true,
            response: undefined,
            bindings: {
              [keymap.previous]: {
                choice: "left",
                handler: onKeypress,
              },
              [keymap.next]: {
                choice: "right",
                handler: onKeypress,
              },
            },
            target: displayElement,
            timing: {
              pre: 0,
              run: Configuration.timings.decisionTwo[
                Configuration.manipulations.resources
              ],
              post: Configuration.timings.selectionTwo,
            },
            onFinish: nextStimuli,
          },
          THREE: {
            name: "decisionThree",
            stage: trial.stage,
            description:
              "Third practice decision made by the " +
              "participant in the main games",
            stimuli: ["blank", "stimulus", "blank"],
            isInteractive: true,
            response: undefined,
            bindings: {
              [keymap.submit]: {
                choice: "left",
                handler: onKeypress,
              },
            },
            target: displayElement,
            timing: {
              pre: 0,
              run: Configuration.timings.decisionThree[
                Configuration.manipulations.resources
              ],
              post: 0,
            },
            onFinish: nextStimuli,
          },
        },
      },
    };

    // Construct the trial, consisting of stimuli.
    let stimuli = [];

    if (trial.stage === "practice_one") {
      // Practice part 1, only the first decision is interactive.
      stimuli.push(
        new Stimuli(STIMULI.GENERAL.FIXATION, state),
        new Stimuli(STIMULI.PRACTICE.ONE, state),
        new Stimuli(STIMULI.PRACTICE.TWO, state)
      );
    } else if (trial.stage === "main_one") {
      // Main part 1, only the first decision is interactive.
      stimuli.push(
        new Stimuli(STIMULI.GENERAL.FIXATION, state),
        new Stimuli(STIMULI.MAIN.PRACTICE.ONE, state),
        new Stimuli(STIMULI.MAIN.PRACTICE.TWO, state)
      );
    } else if (trial.stage === "practice_two") {
      // Practice part 2, the first and second decisions are interactive.
      stimuli.push(
        new Stimuli(STIMULI.GENERAL.FIXATION, state),
        new Stimuli(STIMULI.PRACTICE.ONE, state),
        new Stimuli(STIMULI.PRACTICE.TWO, state),
        new Stimuli(STIMULI.PRACTICE.THREE, state)
      );
    } else if (trial.stage === "main_two") {
      // Main part 2, the first and second decisions are interactive.
      stimuli.push(
        new Stimuli(STIMULI.GENERAL.FIXATION, state),
        new Stimuli(STIMULI.MAIN.PRACTICE.ONE, state),
        new Stimuli(STIMULI.MAIN.PRACTICE.TWO, state),
        new Stimuli(STIMULI.MAIN.THREE, state)
      );
    } else if (trial.stage === "practice_three") {
      // Practice part 3, all decisions are interactive.
      stimuli.push(
        new Stimuli(STIMULI.GENERAL.FIXATION, state),
        new Stimuli(STIMULI.PRACTICE.ONE, state),
        new Stimuli(STIMULI.PRACTICE.TWO, state),
        new Stimuli(STIMULI.PRACTICE.THREE, state),
        new Stimuli(STIMULI.GENERAL.REWARD, state)
      );
    } else if (trial.stage === "main_three") {
      // Practice has been completed, use all stimuli.
      stimuli.push(
        new Stimuli(STIMULI.GENERAL.FIXATION, state),
        new Stimuli(STIMULI.MAIN.ONE, state),
        new Stimuli(STIMULI.MAIN.TWO, state),
        new Stimuli(STIMULI.MAIN.THREE, state),
        new Stimuli(STIMULI.GENERAL.REWARD, state)
      );
    }

    // Begin displaying the first stimulus.
    nextStimuli();

    // -------------------- Functions --------------------
    /**
     * Handle event of a keypress
     * @param {KeyboardEvent} event keypress event
     */
    function onKeypress(event: KeyboardEvent) {
      // Check that a valid key has been pressed.
      if (currentStimuli.getData().bindings[event.key] !== undefined) {
        let actionDirection =
          currentStimuli.getData().bindings[event.key].choice;
        currentStimuli.setSelected(actionDirection);

        // Determine the position of the stimulus the participant selected
        // 0 = left, 1 = right
        const action = actionDirection === "left" ? 0 : 1;

        // Get the corresponding stimulus
        const stimulus = currentStimuli.getState().getPositionalMappings()[
          action
        ];
        consola.info(`Stimulus '${stimulus}' selected`);

        // Store state and actions dependent on depth
        switch (state.getDepth()) {
          case 0:
            // Record the stimulus
            records.firstStimulus = parseInt(stimulus);
            // Record and correct the action
            records.firstActionRaw = action;
            if (action === 0 && records.firstStimulus === 2) {
              // Participant pressed 'left' to select a stimulus that is ordinarily on the right
              records.firstAction = 1;
            } else if (action === 1 && records.firstStimulus === 1) {
              // Participant pressed 'right' to select a stimulus that is ordinarily on the left
              records.firstAction = 0;
            } else {
              // Standard behaviour
              records.firstAction = action;
            }
            // First state
            records.firstState = 0;
            break;
          case 1:
            // Record the stimulus
            records.secondStimulus = parseInt(stimulus);
            // Record and correct the action
            records.secondActionRaw = action;
            if (action === 0 && (records.secondStimulus === 4 || records.secondStimulus === 6)) {
              // Participant pressed 'left' to select a stimulus that is ordinarily on the right
              records.secondAction = 1;
            } else if (action === 1 && (records.secondStimulus === 3 || records.secondStimulus === 5)) {
              // Participant pressed 'right' to select a stimulus that is ordinarily on the left
              records.secondAction = 0;
            } else {
              // Standard behaviour
              records.secondAction = action;
            }
            // Second state, adjust to {1, 2}
            if ([3, 4].includes(parseInt(stimulus))) {
              records.secondState = 1;
            } else {
              records.secondState = 2;
            }
            break;
          case 2:
            // Record the stimulus
            records.thirdStimulus = parseInt(stimulus);
            // Third state, adjust to {1, 2, 3, 4}
            records.thirdState = parseInt(stimulus) - 6;
            break;
          default:
            consola.error(`Unknown depth: '${state.getDepth()}'`);
            break;
        }

        // Calculate and store reaction times for all trials
        switch (currentStimuli.getName()) {
          case "decisionOne":
            records.firstReactionTime =
              performance.now() - starts.firstReactionTime;
            break;
          case "decisionTwo":
            records.secondReactionTime =
              performance.now() - starts.secondReactionTime;
            break;
          case "decisionThree":
            records.thirdReactionTime =
              performance.now() -
              starts.thirdReactionTime -
              currentStimuli.getPreTime();
            break;
        }

        // Highlight the selected stimulus
        if (!trial.stage.startsWith("main")) {
          // Update choice string only for practice games
          actionDirection += "_p";
        }
        currentStimuli.highlight(actionDirection);

        // Flash the button below the selected stimulus
        if (action === 0) {
          // Left side - the final stage also registers as left, so we need
          // to check that first
          if (currentStimuli.getName() === "decisionThree") {
            // Final decision, flash the middle control
            const middleControl = document.getElementById("middle-control")
              .firstElementChild as HTMLElement;
            flash(middleControl, true, 150);
          } else {
            // Flash the left control
            const leftControl = document.getElementById("left-control")
              .firstElementChild as HTMLElement;
            flash(leftControl, true, 150);
          }
        } else {
          // Flash the right control
          const rightControl = document.getElementById("right-control")
            .firstElementChild as HTMLElement;
          flash(rightControl, true, 150);
        }

        // Progress to the next state, store data first
        interactions.selections.push(`(${stimulus}` + `:${performance.now()})`);
        interactions.path.push(`(${state.getDepth()},${state.getColumn()})`);

        // Continue the game
        state.next(actionDirection);
        currentStimuli.removeKeybindings();
      }
    }

    /**
     * Handle event of any keypress
     * @param {KeyboardEvent} event keypress event
     */
    function globalKeyboardEventListener(event: KeyboardEvent) {
      const keypressTime = performance.now() - starts.trial;
      interactions.keypresses.push(`${event.key}:${keypressTime}`);
    }

    /**
     * Move to the next stimuli
     */
    function nextStimuli(): void {
      consola.debug(`Function 'nextStimuli' called`);

      // Sanity check on selection?
      if (currentStimuli !== null && currentStimuli.isInteractive()) {
        if (currentStimuli.getSelected() === undefined) {
          // Clear all remaining stimuli and replace with timeout.
          stimuli = [new Stimuli(STIMULI.GENERAL.TIMEOUT, state)];

          // Store the timeout for the specific stimuli
          switch (currentStimuli.getName()) {
            case "decisionOne":
              records.slowFirstAction = 1;
              break;
            case "decisionTwo":
              records.slowSecondAction = 1;
              break;
            case "decisionThree":
              records.slowThirdAction = 1;
              break;
          }
          consola.warn(`Timeout on '${currentStimuli.getName()}'`);
        }
      }

      if (stimuli.length === 0) {
        // No more stimuli to present, store additional data
        endTrial();
      } else {
        // Present the next stimulus.
        currentStimuli = stimuli.shift();
        currentStimuli.setState(state);

        if (currentStimuli.getName() === "reward") {
          // Calculate the number of 'practice_three' trials that have elapsed
          const numberPracticeThree = jsPsych.data
            .get()
            .filter({ stage: "practice_three" })
            .count();

          // Calculate the number of rewards received in the last
          // number of trials defined as the interval in the configuration
          const rewardFrequencies = jsPsych.data
            .get()
            .filter({ stage: "practice_three" })
            .last(Configuration.cheats.practiceRewardDelta)
            .select("trialReachedReward")
            .frequencies();

          // Increasing the reward frequency during the practice trials
          if (
            numberPracticeThree ===
            Configuration.cheats.practiceFirstReward - 1
          ) {
            // Check if there were any rewards received in the prior trials
            if (rewardFrequencies["true"] === 0) {
              // No rewards received so far, inject the first reward
              wasRewarded = true;
              currentStimuli.setStimuli([
                STIMULUS.BLANK,
                STIMULUS.REWARD,
                STIMULUS.BLANK,
              ]);
            }
          } else {
            // Check if the participant has been wasRewarded in the
            // third stage of the practice trials
            if (
              Configuration.cheats.increasePracticeRewards &&
              trial.stage === "practice_three" &&
              rewardFrequencies["false"] ===
                Configuration.cheats.practiceRewardDelta
            ) {
              // Place a reward anyway, regardless of whether it
              // was truly reached
              wasRewarded = true;
              currentStimuli.setStimuli([
                STIMULUS.BLANK,
                STIMULUS.REWARD,
                STIMULUS.BLANK,
              ]);
            } else {
              // Normal behaviour for all other trials
              if (
                currentStimuli
                  .getState()
                  .isRewardStimulus(parseInt(state.getCurrentLocation()))
              ) {
                // Reward reached
                wasRewarded = true;
                currentStimuli.setStimuli([
                  STIMULUS.BLANK,
                  STIMULUS.REWARD,
                  STIMULUS.BLANK,
                ]);
              } else {
                // Reward not reached
                currentStimuli.setStimuli([
                  STIMULUS.BLANK,
                  STIMULUS.NO_REWARD,
                  STIMULUS.BLANK,
                ]);
              }
            }
          }
        }

        // Begin timing the decision.
        switch (currentStimuli.getName()) {
          case "decisionOne":
            starts.firstReactionTime = performance.now();
            break;
          case "decisionTwo":
            starts.secondReactionTime = performance.now();
            break;
          case "decisionThree":
            starts.thirdReactionTime = performance.now();
            break;
        }

        // Establish global key listener.
        document.addEventListener("keypress", globalKeyboardEventListener);

        // Start presenting the stimulus.
        Runner.start(currentStimuli);
      }
    }

    /**
     * End the trial
     */
    function endTrial(): void {
      // Reset the background colour of the page in case it is followed
      // by instructions
      document.body.style.backgroundColor = "white";

      // Restore the cursor
      document.body.style.cursor = "auto";

      for (let s = 0; s < stimuli.length; s++) {
        if (stimuli[s].getTimer() !== null) {
          window.clearTimeout(stimuli[s].getTimer());
        }
      }

      // Construct and store the data.
      records.rewarded = wasRewarded ? 1 : 0;

      // Save the data every five trials
      if (records.trial > 0 && records.trial % 5 === 0) {
        if (
          Configuration.controller === "desktop" ||
          Configuration.controller === "spectrometer"
        ) {
          jsPsych.data
            .get()
            .localSave(`csv`, `threestep_partial_${Date.now()}.csv`);
        }
      }

      // Remove global keypress listener
      document.removeEventListener("keypress", globalKeyboardEventListener);

      // Count and store the total number of rewards
      records.totalReward =
        jsPsych.data.get().select("rewarded").sum() + records.rewarded;
      consola.debug(`Total rewards:`, records.totalReward);

      // End the trial
      consola.debug("Trial data:", records);
      jsPsych.finishTrial(records);
    }
  };

  return plugin;
})();
