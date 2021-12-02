/**
 * @summary Additional utility classes used in the Keramati et al. model-based
 * model-free decision-making task.
 *
 * @link   https://github.com/henry-burgess/ccddm2020/blob/master/tasks/threestep/src/core/lib.ts
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */

import { Configuration } from "../Configuration";

// Logging library
import consola from "consola";

// Make compiler happy by declaring jsPsych
declare const jsPsych: any;

// Read the JSON file contents of the generated trial Configurationurations
import * as Trials from "./trials/generate/trials.json";

/**
 * Retrieve the trials from the JSON file and return them
 * for use in the timeline generation. Logs some trial
 * statistics as a sanity-check.
 * @return {any} the collection of trials
 */
export function loadTrialCollection(): any {
  const _trials = Trials.trials;
  Object.keys(_trials).forEach((_type) => {
    consola.info(`[JSON] ${_trials[_type].length} '${_type}' trials`);
  });
  return _trials;
}

/**
 * https://stackoverflow.com/a/3291856
 * Capitalise the first letter of a word.
 * @param {string} _str input string
 * @return {string} capitalised string
 */
export function capitalise(_str: string): string {
  return _str.charAt(0).toUpperCase() + _str.slice(1);
}

/**
 * Toggle the visibility of an element.
 * @param {HTMLElement} _el element to flash
 * @param {boolean} _hold leave the color on the element
 * @param {number} _interval the interval of flashing in milliseconds
 */
export function flash(_el: HTMLElement, _hold = false, _interval = 500): void {
  // Create a counter
  let c = 0;

  // Set the colour to green instantly
  _el.classList.add("control-button-success");
  const flashInterval = window.setInterval(() => {
    if (_el.classList.contains("control-button-success")) {
      // Reset the background color
      _el.classList.remove("control-button-success");

      // Increment the counter
      c = c + 1;

      if (c === 1) {
        // Clear the interval (ending the flashing) after
        // a fixed number of flashes.
        window.clearInterval(flashInterval);

        if (_hold === true) {
          selected(_el);
        }
      }
    } else {
      // Change the background colour
      _el.classList.add("control-button-success");
    }
  }, _interval);
}

/**
 * Set a HTML element to it's selected appearance
 * @param {HTMLElement} _el HTML element to change the colour of
 * @param {string} _classname CSS class with specific behaviour
 */
export function selected(
  _el: HTMLElement,
  _classname = "control-button-success"
): void {
  _el.classList.add(_classname);
}

/**
 * Countdown function used between trials. Sets the background colour to black
 * @param {number} duration countdown duration in seconds
 */
export function countdown(duration = 15): void {
  // Set the wait time to be fixed at 15000ms.
  const waitTime = duration * 1000;
  const startTime = performance.now();

  const previousBackground = document.body.style.background;
  const previousColor = document.body.style.color;

  // Create a window interval
  const countdownInterval = window.setInterval(function () {
    const timeLeft = waitTime - (performance.now() - startTime);
    const minutes = Math.floor(timeLeft / 1000 / 60);
    const seconds = Math.floor((timeLeft - minutes * 1000 * 60) / 1000);
    const secondsFormatted = seconds.toString().padStart(2, "0");
    document.querySelector(
      "#countdown"
    ).innerHTML = `${minutes}:${secondsFormatted}`;
    if (timeLeft <= 0) {
      document.querySelector("#countdown").innerHTML = "0:00";
      clearInterval(countdownInterval);

      // Reset the page styling
      document.body.style.background = previousBackground;
      document.body.style.color = previousColor;

      jsPsych.finishTrial();
    }
  }, 250);

  // Update the style of the page
  document.body.style.background = "black";
  document.body.style.color = "white";
}

/**
 * Check the number of timeouts that have occurred
 * in a given segment of the game
 * @param {string} stage the stage of the game to
 * check the timeouts
 * @return {boolean} whether the number of timeouts is
 * valid or not
 */
export function checkTimeouts(stage: string): boolean {
  let canContinue = true;

  // Count the number of matching trials
  const trialCount = jsPsych.data.get().filter({ trialStage: stage }).count();

  consola.info(`Trial count: ${trialCount}`);

  if (trialCount > 0) {
    // Count the number of timed out trials
    const timeoutTrials = jsPsych.data
      .get()
      .filter({
        trialStage: stage,
        timeout: 1,
      })
      .count();

    consola.info(`Timeout trials: ${timeoutTrials}`);

    // Calculate and store the proportion of timed out trials
    const timeoutProportion = timeoutTrials / trialCount;
    canContinue =
      timeoutProportion < Configuration.manipulations.timeoutProportion;

    consola.info(`Timeout proportion: ${timeoutProportion}`);
  }

  consola.info(`Continue: ${canContinue}`);

  return canContinue;
}

/**
 * Scaling function to automatically resize and scale content
 */
export function scale(): void {
  const wrapper = document.querySelector(
    ".jspsych-content-wrapper"
  ) as HTMLElement;
  const content = document.querySelector(".jspsych-content") as HTMLElement;

  if (content) {
    // Apply the CSS transform using the scale() function
    content.style.width = `${Math.max(
      content.clientWidth,
      wrapper.clientWidth
    )}px`;
  }
}

/**
 * Clear the HTML contents of an element without
 * editing innerHTML.
 * @param {HTMLElement} _target element to clear contents
 */
export function clear(_target: HTMLElement): void {
  // Clear existing HTML nodes
  while (_target.firstChild) {
    _target.removeChild(_target.lastChild);
  }
}
