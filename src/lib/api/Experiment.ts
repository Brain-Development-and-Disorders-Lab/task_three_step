// Imports
import { Configuration } from "../../Configuration";
import { clear, scale } from "../Functions";
import { Manipulations, StimuliCollection } from "../API";
import { PLATFORMS } from "../Constants";

// Import and Configurationure seedrandom for random number generation
import seedrandom from "seedrandom";
window.Math.random = seedrandom(Configuration.seed);

// Import jsPsych & plugins to ensure everything is bundled when compiled
import "jspsych/jspsych";
import "jspsych/plugins/jspsych-instructions";
import "jspsych/plugins/jspsych-fullscreen";
import "jspsych/plugins/jspsych-preload";
import "jspsych-attention-check/src/jspsych-attention-check";
declare const jsPsych: any;

// Import jQuery for Gorilla use only
import $ from "jquery";

// Logging library
import consola from "consola";

/**
 * Experiment class to start and manage connection to jsPsych
 * or Gorilla if required
 */
export class Experiment {
  private platform: string;
  private hooks: {
    gorilla: any;
    jsPsych: any;
  };
  private stimuliCollection: StimuliCollection;

  /**
   * Default constructor
   */
  constructor() {
    // Assign the experiment to the window
    window["Experiment"] = this;

    // Detect and update the target in the Configurationuration
    this.setPlatform(this.detectPlatforms());

    // Load all the stimuli
    this.loadStimuli();

    // Configure the manipulations in the Configurationuration file
    if (this.platform === PLATFORMS.GORILLA) {
      new Manipulations(
        Configuration.manipulations,
        Object.keys(Configuration.manipulations)
      );
    }
  }

  /**
   * Update and set the target
   * @param {string} _target updated target
   */
  private setPlatform(_target: string) {
    if (_target !== this.platform) {
      consola.warn(`Target updated to '${_target}'`);
    }
    this.platform = _target;
  }

  /**
   * Get the current platform the Experiment is running on
   * @return {string}
   */
  public getPlatform(): string {
    return this.platform;
  }

  /**
   * Detect the platform that the experiment is running on
   * @return {string} platform name
   */
  private detectPlatforms(): string {
    // Instantiate hook storage
    this.hooks = {
      gorilla: null,
      jsPsych: null,
    };

    // Check for Gorilla
    if (PLATFORMS.GORILLA in window) {
      consola.info(`Gorilla instance found`);

      // Store the platform
      this.hooks.gorilla = window[PLATFORMS.GORILLA];
    }

    // Check for jsPsych
    if (PLATFORMS.JSPSYCH in window) {
      consola.info(`jsPsych instance found`);

      // Store the platform
      this.hooks.jsPsych = window[PLATFORMS.JSPSYCH];
    }

    // Return the correct platform
    if (this.hooks.gorilla) {
      // Gorilla was found
      return PLATFORMS.GORILLA;
    } else if (this.hooks.jsPsych) {
      // jsPsych found but not Gorilla
      return PLATFORMS.JSPSYCH;
    } else {
      // Big issue if we are here
      throw new Error("No valid platforms detected");
    }
  }

  /**
   * Setup and enable global error handler
   */
  private setupErrorHandler(): void {
    window.onerror = (_event: any) => {
      // Heading text
      const heading = document.createElement("h1");
      heading.textContent = "Oh no!";

      // Subheading
      const subheading = document.createElement("h2");
      subheading.textContent = "It looks like an error has occurred.";

      // Container for the error information
      const errorContainer = document.createElement("div");
      errorContainer.style.margin = "20px";

      // 'Error description:' text
      const textIntroduction = document.createElement("p");
      textIntroduction.textContent = "Error description:";

      // Error description
      const description = document.createElement("code");
      description.innerHTML = _event;
      description.style.gap = "20rem";
      errorContainer.append(textIntroduction, description);

      // Follow-up instructions
      const textInstructions = document.createElement("p");
      if (Configuration.allowParticipantContact === true) {
        textInstructions.innerHTML =
          `Please send an email to ` +
          `<a href="mailto:${Configuration.contact}?` +
          `subject=Error (${Configuration.studyName})` +
          `&body=Error text: ${_event}%0D%0A` +
          `Additional information:"` +
          `>${Configuration.contact}` +
          `</a> to share ` +
          `the details of this error.`;
        textInstructions.style.margin = "20px";
      }

      // Button to end the experiment
      const endButton = document.createElement("button");
      endButton.textContent = "End Experiment";
      endButton.classList.add("jspsych-btn");
      endButton.onclick = () => {
        jsPsych.endExperiment(
          "The experiment ended early due to an error occurring."
        );
      };

      // Clear and replace the content of the document.body
      const contentContainer = document.getElementById("jspsych-content");
      clear(contentContainer);
      contentContainer.append(
        heading,
        subheading,
        errorContainer,
        textInstructions,
        endButton
      );

      // Set background color
      contentContainer.style.background = "white";
    };
  }

  /**
   * Retrieve an instance of a platform to utilise
   * in integration
   * @param {string} _platform identifier of the platform
   * @return {any} platform instance
   */
  private getHook(_platform: string): any {
    if (this.hooks[_platform]) {
      return this.hooks[_platform];
    } else {
      consola.warn(`Hook '${_platform}' not found`);
      return null;
    }
  }

  /**
   * Load the stimuli and setup the ImageCollection
   * instance
   */
  private loadStimuli() {
    this.stimuliCollection = new StimuliCollection();
    this.stimuliCollection.load();
  }

  /**
   * Retrieve the collection of loaded images
   * @return {any}
   */
  public getStimuli(): any {
    return this.stimuliCollection.getCollection();
  }

  /**
   * Start the experiment
   * @param {any[]} _timeline collection of the jsPsych
   * timeline nodes to execute.
   */
  public start(_timeline: any[]): void {
    // Add the error handler
    this.setupErrorHandler();

    if (this.platform === PLATFORMS.GORILLA) {
      // Initialise jsPsych and Gorilla (if required)
      const _gorilla = this.getHook(PLATFORMS.GORILLA);
      const _jsPsych = this.getHook(PLATFORMS.JSPSYCH);

      // Populate the image collection for Gorilla
      Object.keys(Configuration.stimuli).forEach((_image) => {
        Configuration.stimuli[_image] = _gorilla.stimuliURL(_image);
      });

      // Create a new timeline node to preload the images
      _timeline.unshift({
        type: "preload",
        auto_preload: true,
        images: Object.values(Configuration.stimuli),
      });

      // Make sure Gorilla and jsPsych are loaded
      if (_gorilla && _jsPsych) {
        _gorilla.ready(function () {
          _jsPsych.init({
            display_element: $("#gorilla")[0],
            timeline: _timeline,
            on_data_update: function (data) {
              _gorilla.metric(data);
            },
            on_finish: function () {
              _gorilla.finish();
            },
            show_progress_bar: true,
            show_preload_progress_bar: true,
            preload_images: Object.values(Configuration.stimuli),
          });
        });
      } else {
        throw new Error(`Gorilla or jsPsych not loaded`);
      }
    } else {
      // Initialise jsPsych
      const _jsPsych = this.getHook(PLATFORMS.JSPSYCH);

      // Add a new timeline node to preload the images
      _timeline.unshift({
        type: "preload",
        auto_preload: true,
        images: Object.values(Configuration.stimuli),
      });

      // Make sure jsPsych is loaded
      if (_jsPsych) {
        _jsPsych.init({
          timeline: _timeline,
          on_finish: function () {
            _jsPsych.data
              .get()
              .localSave(`csv`, `threestep_complete_${Date.now()}.csv`);
          },
          show_progress_bar: true,
          show_preload_progress_bar: true,
          preload_images: Object.values(Configuration.stimuli),
        });
      } else {
        throw new Error(`jsPsych not loaded`);
      }
    }

    // Scale everything
    scale();
  }
}
