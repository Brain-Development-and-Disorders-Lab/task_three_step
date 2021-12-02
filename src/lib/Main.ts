/**
 * @summary Timeline configuration of Keramati et al. model-based model-free
 * decision-making task. Imports and loads trial configuration.
 *
 * @link   https://github.com/henry-burgess/ccddm2020/blob/master/tasks/threestep/src/main.ts
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */

// -------------------- Import and Setup --------------------
// Configuration and utilities
import { Configuration } from "../Configuration";
import { checkTimeouts, countdown, loadTrialCollection } from "./Functions";
import { Instructions } from "./classes/Instructions";
import { Experiment } from "./API";

// Import the plugin before adding it to the timeline
import "../Plugin";

// Make compiler happy by declaring jsPsych
declare const jsPsych: any;

// -------------------- Main --------------------
// The game is initialised once the window loads such that the jsPsych and
// Gorilla APIs are loaded entirely.
window.onload = () => {
  // Experiment and timeline setup
  const timeline = [];
  const experiment = new Experiment();

  // Set the experiment to run in fullscreen mode
  if (Configuration.fullscreen === true) {
    timeline.push({
      type: "fullscreen",
      message: `<p>Click 'Continue' to enter fullscreen mode.</p>`,
      fullscreen_mode: true,
    });
  }

  // Import JSON data for generating trials in timeline
  const trialCollection = loadTrialCollection();

  // Store the keybindings
  const keymap = Configuration.keymaps[Configuration.controller];

  // -------------------- Instructions --------------------
  // Obtain and generate the instructions
  const _instructions = new Instructions();
  _instructions.generateInstructions();
  const instructions = _instructions.get();

  // -------------------- Section 1: Introduction --------------------
  // These instructions are placed at the very start of the game,
  // before any trials are played. The instructions either contain the
  // video on YouTube, or the text-based instructions.
  const introductionPages = [];
  if (Configuration.showVideo === true) {
    introductionPages.push(
      `<h1>${Configuration.name} Game</h1>` +
        `<h2>Instructions</h2>` +
        `<div>` +
        `<iframe class="video-instructions" ` +
        `src="${Configuration.embeds.startVideo}" ` +
        `title="Instructions" ` +
        `disablekb="1" ` +
        `modestbranding="1" ` +
        `frameborder="0" ` +
        `allow="accelerometer; ` +
        `autoplay; clipboard-write; ` +
        `encrypted-media; gyroscope; ` +
        `picture-in-picture" allowfullscreen>` +
        `</iframe>` +
        `</div>` +
        _instructions.getSnippet("instructionNextOnly")
    );
  }

  if (Configuration.showInstructions === true) {
    // Add the overview pages
    for (let p = 0; p < instructions.overview.length; p++) {
      introductionPages.push(instructions.overview[p]);
    }

    // Add the introduction pages
    for (let p = 0; p < instructions.introduction.length; p++) {
      introductionPages.push(instructions.introduction[p]);
    }

    // Add the practice instructions pages
    for (let p = 0; p < instructions.practice.length; p++) {
      introductionPages.push(instructions.practice[p]);
    }
  }

  // Add the final page of the introductory instructions
  introductionPages.push(
    `<h1>${Configuration.name} Game</h1>` +
      `<h2>Instructions</h2>` +
      `${_instructions.getSnippet("preGameInstructions")}` +
      _instructions.getSnippet("instructionContinue")
  );

  // Create the timeline loop node for the introductory instructions
  // and the attention-check
  const introductionLoop = [
    // First node: instructions
    {
      type: "instructions",
      pages: introductionPages,
      allow_keys: !keymap.showButtons,
      key_forward: keymap.next,
      key_backward: keymap.previous,
      show_clickable_nav: keymap.showButtons,
    },
    // Second node: Attention-check
    {
      type: "attention-check",
      question: "What is the objective of each game?",
      options: [
        "To find which door I think looks the best",
        "To find the treasure in the maze",
        "To try and stop other people from finding the treasure",
      ],
      option_correct: 1,
      option_keys: [keymap.alt, keymap.previous, keymap.next],
      options_radio: true,
      input_timeout: 1500,
      submit_button_key: keymap.submit,
      submit_button_text: "Submit Answer",
      continue_button_message_correct: "Continue",
      continue_button_message_incorrect: "Review Instructions",
      confirmation: false,
      feedback_correct: "Correct! You may now continue.",
      feedback_incorrect: "Incorrect. Please review the instructions.",
      instructions: _instructions.getSnippet("controlInstructions"),
    },
  ];

  // Add the loop node to the main timeline
  if (Configuration.debugMode === false) {
    timeline.push({
      timeline: introductionLoop,
      loop_function: function (data) {
        if (jsPsych.data.getLastTrialData().values()[0].correct === false) {
          // If the attention-check was incorrect, loop the instructions
          return true;
        } else {
          // Allow the participant to continue
          return false;
        }
      },
    });
  }

  // Countdown after the attention check question
  if (Configuration.debugMode === false) {
    // Generate the text shown during the countdown
    const practiceOneText = document.createElement("div");
    practiceOneText.classList.add("header-stage");

    // Stage header
    const practiceOneHeaderValue = document.createElement("div");
    practiceOneHeaderValue.innerHTML = `<h3>Practice Games&nbsp;|&nbsp;Part 1 / 3</h3>`;

    // Stage description
    const practiceOneTextValue = document.createElement("div");
    practiceOneTextValue.innerHTML =
      `<h3>You can visit the first two rooms, ` +
      `you <span style='color: red;'>can't</span> ` +
      `see if you found treasure.</h3>`;

    practiceOneText.appendChild(practiceOneHeaderValue);
    practiceOneText.appendChild(practiceOneTextValue);

    timeline.push({
      type: "instructions",
      pages: [
        `${practiceOneText.outerHTML}` +
          `<h3>The games will start in <span id="countdown">0:15</span></h3>`,
      ],
      on_load: () => {
        countdown(Configuration.manipulations.interTrialCountdown);
      },
    });
  }

  // -------------------- Section 2: Practice Games --------------------
  // The following games are played by the participant to practice the game
  // mechanics and to adjust to navigating through the maze.
  // Generate a new practice trials timeline
  const practiceTimeline = [];

  // -------------------- Practice Games One --------------------
  // Define the stage
  let stage = "practice_one";
  for (let t = 0; t < Configuration.manipulations.levelOnePracticeTrials; t++) {
    // Retrieve the trial data
    const trialData = trialCollection[stage][t];

    // Unpack the trial data and add a new trial to the main timeline
    practiceTimeline.push({
      type: "threestep-task",
      data: {
        firstTransition: trialData["transitions"][0] === "C" ? 0 : 1,
        secondTransition: trialData["transitions"][1] === "C" ? 0 : 1,
        rewardPosition: trialData["reward_stimulus"] - 6,
        highlyRewardingState: trialData["high_rewarding"] - 6,
      },
      transition_probability: 0.8,
      mappings: trialData["mappings"],
      stage: stage,
    });
  }

  // Add break screen between the first and second stage of the
  // practice trials
  practiceTimeline.push({
    type: "instructions",
    pages: instructions.break,
    allow_keys: !keymap.showButtons,
    key_forward: keymap.next,
    key_backward: keymap.previous,
    show_clickable_nav: keymap.showButtons,
  });

  // Countdown after the break screen
  if (Configuration.debugMode === false) {
    // Generate the text shown during the countdown
    const practiceTwoText = document.createElement("div");
    practiceTwoText.classList.add("header-stage");

    const practiceTwoHeaderValue = document.createElement("div");
    practiceTwoHeaderValue.innerHTML = `<h3>Practice Games&nbsp;|&nbsp;Part 2 / 3</h3>`;

    const practiceTwoTextValue = document.createElement("div");
    practiceTwoTextValue.innerHTML =
      `<h3>You can visit all the rooms, ` +
      `you <span style='color: red;'>can't</span> ` +
      `see if you found treasure.</h3>`;

    practiceTwoText.appendChild(practiceTwoHeaderValue);
    practiceTwoText.appendChild(practiceTwoTextValue);

    practiceTimeline.push({
      type: "instructions",
      pages: [
        `${practiceTwoText.outerHTML}` +
          `<h3>The games will continue in <span id="countdown">0:15</span></h3>`,
      ],
      on_load: () => {
        countdown(Configuration.manipulations.interTrialCountdown);
      },
    });
  }

  // -------------------- Practice Games Two --------------------
  stage = "practice_two";
  for (let t = 0; t < Configuration.manipulations.levelTwoPracticeTrials; t++) {
    // Retrieve the trial data
    const trialData = trialCollection[stage][t];

    // Unpack the trial data and add a new trial to the main timeline
    practiceTimeline.push({
      type: "threestep-task",
      data: {
        firstTransition: trialData["transitions"][0] === "C" ? 0 : 1,
        secondTransition: trialData["transitions"][1] === "C" ? 0 : 1,
        rewardPosition: trialData["reward_stimulus"] - 6,
        highlyRewardingState: trialData["high_rewarding"] - 6,
      },
      transition_probability: 0.8,
      mappings: trialData["mappings"],
      stage: stage,
    });
  }

  // Add break screen between the second and third stage of the
  // practice games
  practiceTimeline.push({
    type: "instructions",
    pages: instructions.break,
    allow_keys: !keymap.showButtons,
    key_forward: keymap.next,
    key_backward: keymap.previous,
    show_clickable_nav: keymap.showButtons,
  });

  // Countdown after the break screen
  if (Configuration.debugMode === false) {
    // Generate the text shown during the countdown
    const practiceThreeText = document.createElement("div");
    practiceThreeText.classList.add("header-stage");

    const practiceThreeHeaderValue = document.createElement("div");
    practiceThreeHeaderValue.innerHTML = `<h3>Practice Games&nbsp;|&nbsp;Part 3 / 3</h3>`;

    const practiceThreeTextValue = document.createElement("div");
    practiceThreeTextValue.innerHTML =
      `<h3>You can visit all the rooms, ` +
      `you <span style='color: #46CB2C;'>can</span> ` +
      `see if you found treasure.</h3>`;

    practiceThreeText.appendChild(practiceThreeHeaderValue);
    practiceThreeText.appendChild(practiceThreeTextValue);

    practiceTimeline.push({
      type: "instructions",
      pages: [
        `${practiceThreeText.outerHTML}` +
          `<h3>The games will continue in <span id="countdown">0:15</span></h3>`,
      ],
      on_load: () => {
        countdown(Configuration.manipulations.interTrialCountdown);
      },
    });
  }

  // -------------------- Practice Games Three --------------------
  stage = "practice_three";
  for (
    let t = 0;
    t < Configuration.manipulations.levelThreePracticeTrials;
    t++
  ) {
    // Retrieve the trial data
    const trialData = trialCollection[stage][t];

    // Unpack the trial data and add a new trial to the main timeline
    practiceTimeline.push({
      type: "threestep-task",
      data: {
        firstTransition: trialData["transitions"][0] === "C" ? 0 : 1,
        secondTransition: trialData["transitions"][1] === "C" ? 0 : 1,
        rewardPosition: trialData["reward_stimulus"] - 6,
        highlyRewardingState: trialData["high_rewarding"] - 6,
      },
      transition_probability: 0.8,
      mappings: trialData["mappings"],
      stage: stage,
    });
  }

  // Add the collection of practice trials to the main timeline
  for (const practiceTrial of practiceTimeline) {
    timeline.push(practiceTrial);
  }

  // Add an extra timeline node that runs a check on the number
  // of timeout trials. Will end the experiment if too many
  // timeout trials have occurred.
  timeline.push({
    type: "instructions",
    pages: [``],
    on_load: () => {
      if (Configuration.manipulations.timeoutRestrictions == true) {
        // Check the proportion of timeouts if restrictions enabled
        if (checkTimeouts("practice_three") === true) {
          jsPsych.finishTrial();
        } else {
          jsPsych.endExperiment();
        }
      } else {
        // Default to return true, allowing participant to proceed
        jsPsych.finishTrial();
      }
    },
  });

  // -------------------- Section 3: Main Games --------------------
  // The following games are played by the participant to practice the game
  // mechanics and to adjust to navigating through the maze.

  // Generate a new main trials timeline
  const mainTimeline = [];

  // -------------------- Introduction: Main Games --------------------
  // If inside the spectrometer, wait until the signal key is pressed.
  // Else, use the standard pre-game screen.
  if (Configuration.controller === "spectrometer") {
    mainTimeline.push({
      type: "instructions",
      pages: instructions.spectrometer,
      allow_keys: !keymap.showButtons,
      key_forward: keymap.trigger,
      show_clickable_nav: keymap.showButtons,
    });
  } else {
    // Setup the instructions loop
    const mainIntroductionLoop = [];
    const mainIntroductionPages = [];

    // Add the text-based or video instructions
    if (Configuration.showVideo === true) {
      // Add video embed
      mainIntroductionPages.push(
        `<h1>${Configuration.name} Game</h1>` +
          `<h2>Instructions</h2>` +
          `<div>` +
          `<iframe class="video-instructions" ` +
          `src="${Configuration.embeds.midVideo}" ` +
          `title="Instructions" ` +
          `disablekb="1" ` +
          `modestbranding="1" ` +
          `frameborder="0" ` +
          `allow="accelerometer; ` +
          `autoplay; clipboard-write; ` +
          `encrypted-media; gyroscope; ` +
          `picture-in-picture" allowfullscreen>` +
          `</iframe>` +
          `</div>` +
          _instructions.getSnippet("instructionNextOnly")
      );
    } else {
      // Add text-based instructions
      for (const page of instructions.main) {
        mainIntroductionPages.push(page);
      }
    }

    // Add the pre-game instructions after viewing all the instructions
    mainIntroductionPages.push(
      `<h1>${Configuration.name} Game</h1>` +
        `<h2>Instructions</h2>` +
        `${_instructions.getSnippet("preGameInstructions")}` +
        _instructions.getSnippet("instructionContinue")
    );

    // Place the pre-game instructions after the text-based
    // or video instructions
    mainIntroductionLoop.push(
      {
        type: "instructions",
        pages: mainIntroductionPages,
        allow_keys: !keymap.showButtons,
        key_forward: keymap.next,
        key_backward: keymap.previous,
        show_clickable_nav: keymap.showButtons,
      },
      // Add the attention-check question
      {
        type: "attention-check",
        question:
          "Does the reward stay in the same room " +
          "throughout all of the games?",
        options: [
          "Yes, in the same room every games",
          "No, in a different room every game",
          "It stays in the same room for some games, " +
            "then it moves to a different room",
        ],
        option_correct: 2,
        option_keys: [keymap.alt, keymap.previous, keymap.next],
        options_radio: true,
        input_timeout: 1500,
        submit_button_key: keymap.submit,
        submit_button_text: "Submit Answer",
        continue_button_message_correct: "Continue",
        continue_button_message_incorrect: "Review Instructions",
        confirmation: false,
        feedback_correct: "Correct! You may now continue.",
        feedback_incorrect: "Incorrect. Please review the instructions.",
        instructions: _instructions.getSnippet("controlInstructions"),
      }
    );

    // Push loop node that includes any instructions and the attention check
    if (Configuration.debugMode === false) {
      mainTimeline.push({
        timeline: mainIntroductionLoop,
        loop_function: function (data) {
          if (jsPsych.data.getLastTrialData().values()[0].correct === false) {
            // If the attention-check was incorrect, loop the instructions
            return true;
          } else {
            // Allow the participant to continue
            return false;
          }
        },
      });
    }
  }

  // Countdown after the break screen
  if (Configuration.debugMode === false) {
    // Add description of the main games prior to starting
    const mainOneHeader = document.createElement("div");
    mainOneHeader.classList.add("header-stage");

    const mainOneHeaderValue = document.createElement("div");
    mainOneHeaderValue.innerHTML = `<h3>Main Games&nbsp;|&nbsp;Part 1 / 3</h3>`;

    const mainOneHeaderText = document.createElement("div");
    mainOneHeaderText.innerHTML =
      `<h3>You can visit the first two rooms, ` +
      `you <span style='color: red;'>can't</span> ` +
      `see if you found treasure.</h3>`;

    mainOneHeader.appendChild(mainOneHeaderValue);
    mainOneHeader.appendChild(mainOneHeaderText);

    mainTimeline.push({
      type: "instructions",
      pages: [
        `${mainOneHeader.outerHTML}` +
          `<h3>The games will continue in <span id="countdown">0:15</span></h3>`,
      ],
      on_load: () => {
        countdown(Configuration.manipulations.interTrialCountdown);
      },
    });
  }

  // -------------------- Main Games One --------------------
  stage = "main_one";
  for (let t = 0; t < Configuration.manipulations.levelOneMainTrials; t++) {
    const trialData = trialCollection[stage][t];
    mainTimeline.push({
      type: "threestep-task",
      data: {
        firstTransition: trialData["transitions"][0] === "C" ? 0 : 1,
        secondTransition: trialData["transitions"][1] === "C" ? 0 : 1,
        rewardPosition: trialData["reward_stimulus"] - 6,
        highlyRewardingState: trialData["high_rewarding"] - 6,
      },
      transition_probability: Configuration.manipulations.probability,
      mappings: trialData["mappings"],
      stage: stage,
    });
  }

  // Add break screen between stages
  mainTimeline.push({
    type: "instructions",
    pages: instructions.break,
    allow_keys: !keymap.showButtons,
    key_forward: keymap.next,
    key_backward: keymap.previous,
    show_clickable_nav: keymap.showButtons,
  });

  // Countdown after the break screen
  if (Configuration.debugMode === false) {
    // Add description of the main games prior to starting
    const mainTwoHeader = document.createElement("div");
    mainTwoHeader.classList.add("header-stage");

    const mainTwoHeaderValue = document.createElement("div");
    mainTwoHeaderValue.innerHTML = `<h3>Main Games&nbsp;|&nbsp;Part 2 / 3</h3>`;

    const mainTwoHeaderText = document.createElement("div");
    mainTwoHeaderText.innerHTML =
      `<h3>You can visit all the rooms, ` +
      `you <span style='color: red;'>can't</span> ` +
      `see if you found treasure.</h3>`;

    mainTwoHeader.appendChild(mainTwoHeaderValue);
    mainTwoHeader.appendChild(mainTwoHeaderText);

    mainTimeline.push({
      type: "instructions",
      pages: [
        `${mainTwoHeader.outerHTML}` +
          `<h3>The games will continue in <span id="countdown">0:15</span></h3>`,
      ],
      on_load: () => {
        countdown(Configuration.manipulations.interTrialCountdown);
      },
    });
  }

  // -------------------- Main Games Two --------------------
  stage = "main_two";
  for (let t = 0; t < Configuration.manipulations.levelTwoMainTrials; t++) {
    const trialData = trialCollection[stage][t];
    mainTimeline.push({
      type: "threestep-task",
      data: {
        firstTransition: trialData["transitions"][0] === "C" ? 0 : 1,
        secondTransition: trialData["transitions"][1] === "C" ? 0 : 1,
        rewardPosition: trialData["reward_stimulus"] - 6,
        highlyRewardingState: trialData["high_rewarding"] - 6,
      },
      transition_probability: Configuration.manipulations.probability,
      mappings: trialData["mappings"],
      stage: stage,
    });
  }

  // Add break screen between stages
  mainTimeline.push({
    type: "instructions",
    pages: instructions.break,
    allow_keys: !keymap.showButtons,
    key_forward: keymap.next,
    key_backward: keymap.previous,
    show_clickable_nav: keymap.showButtons,
  });

  // Countdown after the break screen
  if (Configuration.debugMode === false) {
    // Add description of the main games prior to starting
    const mainThreeHeader = document.createElement("div");
    mainThreeHeader.classList.add("header-stage");

    const mainThreeHeaderValue = document.createElement("div");
    mainThreeHeaderValue.innerHTML = `<h3>Main Games&nbsp;|&nbsp;Part 3 / 3</h3>`;

    const mainThreeHeaderText = document.createElement("div");
    mainThreeHeaderText.innerHTML =
      `<h3>You can visit all the rooms, ` +
      `you <span style='color: #46CB2C;'>can</span> ` +
      `see if you found treasure.</h3>`;

    mainThreeHeader.appendChild(mainThreeHeaderValue);
    mainThreeHeader.appendChild(mainThreeHeaderText);

    mainTimeline.push({
      type: "instructions",
      pages: [
        `${mainThreeHeader.outerHTML}` +
          `<h3>The games will continue in <span id="countdown">0:15</span></h3>`,
      ],
      on_load: () => {
        countdown(Configuration.manipulations.interTrialCountdown);
      },
    });
  }

  // -------------------- Main Games Three --------------------
  stage = "main_three";
  for (let t = 0; t < Configuration.manipulations.levelThreeMainTrials; t++) {
    const trialData = trialCollection[stage][t];
    mainTimeline.push({
      type: "threestep-task",
      data: {
        firstTransition: trialData["transitions"][0] === "C" ? 0 : 1,
        secondTransition: trialData["transitions"][1] === "C" ? 0 : 1,
        rewardPosition: trialData["reward_stimulus"] - 6,
        highlyRewardingState: trialData["high_rewarding"] - 6,
      },
      transition_probability: Configuration.manipulations.probability,
      mappings: trialData["mappings"],
      stage: stage,
    });

    // Check whether or not to place a break screen
    if (
      Configuration.manipulations.enableBreaks.toString() === 'true' &&
      t > 0 &&
      t % Configuration.manipulations.breakFrequency === 0 &&
      t < Configuration.manipulations.levelThreeMainTrials - 1
    ) {
      // Add break screen between stages
      mainTimeline.push({
        type: "instructions",
        pages: instructions.break,
        allow_keys: !keymap.showButtons,
        key_forward: keymap.next,
        key_backward: keymap.previous,
        show_clickable_nav: keymap.showButtons,
      });

      // Add a countdown screen
      mainTimeline.push({
        type: "instructions",
        pages: [
          `<h3>The games will continue in ` +
            `<span id="countdown">0:30</span>` +
          `</h3>`,
        ],
        on_load: () => {
          countdown(Configuration.manipulations.interTrialCountdown * 2);
        },
      });
    }
  }

  // Add all the main trials to the timeline
  for (const mainTrial of mainTimeline) {
    timeline.push(mainTrial);
  }

  // Start the experiment with the constructed timeline
  experiment.start(timeline);
};
