// Imports
import { Configuration } from "../../Configuration";
import { Controller, State } from "../Runtime";
import { StimuliCollection } from "../API";
import { StimuliData } from "../types/threestep";
import { STIMULUS, CONTROLLERS } from "../Constants";

// Make compiler happy by declaring jsPsych
declare const jsPsych: any;

// Logging library
import consola from "consola";

// Constant to avoid magic numbers
const STIMULUS_POSITIONS = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2,
};

/**
 * Stimuli abstraction
 */
export class Stimuli {
  // Public members
  public onFinish: () => void;
  private target: HTMLElement;
  private timer: number;

  // Private members
  private name: string;
  private stage: string;
  private data: StimuliData;
  private stimuli: string[];
  private canInteract: boolean;
  private timing: { pre: number; run: number; post: number };
  private preTime: number;
  private runTime: number;
  private postTime: number;
  private state: State;
  private highlightWidth: number;
  private bindings: {
    [x: number]: {
      choice: string;
      handler: (event: any) => void;
    };
  };
  private controller: Controller;
  private depth: number;
  private column: number;
  private selected: string;
  private stimuliCollection: { [x: string]: any };

  /**
   * Default constructor for Stimuli
   * @param {StimuliData} data trial data
   * @param {State} state trial state
   */
  constructor(data: StimuliData, state: State) {
    this.name = data.name;
    this.data = data;
    this.stage = data.stage;
    this.stimuli = data.stimuli;
    this.canInteract = data.isInteractive;
    this.target = data.target;

    // Timing
    this.timing = data.timing;
    this.preTime = this.timing.pre;
    this.runTime = this.timing.run;
    this.postTime = this.timing.post;

    // State
    this.state = state;

    // Appearance
    this.highlightWidth = 6;

    // Controls
    this.bindings = data.bindings;
    this.controller = new Controller(data.bindings);
    this.onFinish = data.onFinish;

    // Get the images using the StimuliCollection class
    const stimuliCollection = new StimuliCollection();
    stimuliCollection.load();
    this.stimuliCollection = stimuliCollection.getCollection();
  }

  /**
   * Get the name of the stimuli
   * @return {string}
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Set the collection of stimuli shown
   * @param {string[]} stimuli components
   */
  public setStimuli(stimuli: string[]): void {
    this.stimuli = stimuli;
  }

  /**
   * Get the stimuli components
   * @return {string[]} stimuli components
   */
  public getStimuli(): string[] {
    return this.stimuli;
  }

  /**
   * Get the state of the stimuli
   * @return {State}
   */
  public getState(): State {
    return this.state;
  }

  /**
   * Update the state
   * @param {State} state updated state
   */
  public setState(state: State): void {
    this.state = state;
  }

  /**
   * Get the pre-run time of the stimuli
   * @return {number}
   */
  public getPreTime(): number {
    return this.preTime;
  }

  /**
   * Get the run time of the stimuli
   * @return {number}
   */
  public getRunTime(): number {
    return this.runTime;
  }

  /**
   * Get the post-run time of the stimuli
   * @return {number}
   */
  public getPostTime(): number {
    return this.postTime;
  }

  /**
   * Get the depth the state
   * @return {number}
   */
  public getDepth(): number {
    return this.depth;
  }

  /**
   * Get the column of the state
   * @return {number}
   */
  public getColumn(): number {
    return this.column;
  }

  /**
   * Get the data associated with the stimuli
   * @return {any}
   */
  public getData(): StimuliData {
    return this.data;
  }

  /**
   * Determine if the stimuli can be interacted with or not
   * @return {boolean}
   */
  public isInteractive(): boolean {
    return this.canInteract;
  }

  /**
   * Create the keybindings
   */
  public createKeybindings(): void {
    if (this.canInteract) {
      this.controller.bind();
    }
  }

  /**
   * Remove the keybindings
   */
  public removeKeybindings(): void {
    this.controller.unbind();
  }

  /**
   * Set the timer for the stimulus
   * @param {number} timer timer
   */
  public setTimer(timer: number): void {
    this.timer = timer;
  }

  /**
   * Get the timer for the stimuli
   * @return {number}
   */
  public getTimer(): number {
    return this.timer;
  }

  /**
   * Set the selection made for the stimuli
   * @param {string} selected selection made
   */
  public setSelected(selected: string): void {
    this.selected = selected;
  }

  /**
   * Get the selection made in the stimuli
   * @return {string}
   */
  public getSelected(): string {
    return this.selected;
  }

  /**
   * Highlight a particular component of the stimuli
   * @param {string} side the side of the stimuli to highlight
   * @param {string} colour the colour of the highlight
   */
  public highlight(side: string, colour = "white"): void {
    consola.debug(`Highlighting '${side}'`);
    // Try and get the stimuli that are displayed
    const stimuli = this.state.getPositionalMappings();
    // Set default name to 'blank'
    let stimulusName = "blank";

    // Extra '_p' required for key if this is a practice trial
    // Practice trials have different stimuli
    const isPractice = side.endsWith("_p") ? "_p" : "";
    if (side.startsWith("left")) {
      stimulusName = stimuli[0] + isPractice;
    } else {
      stimulusName = stimuli[1] + isPractice;
    }

    if (document.getElementById(stimulusName) !== null) {
      const image = document.getElementById(stimulusName)
        .children[0] as HTMLImageElement;

      // Apply border
      image.style.borderStyle = "solid";
      image.style.borderWidth = `${this.highlightWidth}px`;
      image.style.borderColor = colour;
      image.style.borderRadius = "12px";
      image.style.boxSizing = "border-box";
    } else {
      consola.warn(`Element with ID '${side}' is null.`);
    }
  }

  /**
   * Get the DOM target element
   * @return {HTMLElement}
   */
  public getTarget(): HTMLElement {
    return this.target;
  }

  /**
   * Retrieve the path to an image forming part of the stimulus
   * @param {string} name the name of the stimulus element
   * @return {string}
   */
  public getSource(name: string): string {
    let filename: string;
    if (name === "reward") {
      filename = "treasure_chest.gif";
    } else {
      filename = `${name}.png`;
    }
    return `${this.stimuliCollection[filename]}`;
  }

  /**
   * Generate and display header information
   * @param {HTMLElement} _target HTML element to receive the nodes
   */
  private generateHeader(_target: HTMLElement): void {
    // Adaptive content of header text field
    // Loss or reward text depending on the stage
    const headerText = document.createElement("h3");

    // Placeholder text so styling takes effect
    headerText.innerHTML = "&nbsp;";
    if (this.stimuli[STIMULUS_POSITIONS.MIDDLE] === STIMULUS.REWARD) {
      // Reward
      headerText.textContent = "You found the treasure!";
      headerText.style.color = "#46CB2C";
    } else if (this.stimuli[STIMULUS_POSITIONS.MIDDLE] === STIMULUS.NO_REWARD) {
      // No reward stimulus
      headerText.textContent = "You didn't find any treasure.";
      headerText.style.color = "red";
    } else if (this.stimuli[STIMULUS_POSITIONS.MIDDLE] === STIMULUS.TIMEOUT) {
      // Timeout stimulus
      // Count the number of trials that have timed out
      const timedOutTrialCount = jsPsych.data.get().select("timeout").sum();

      // Change the timeout text displayed
      headerText.style.color = "red";
      if (timedOutTrialCount > Configuration.manipulations.timeoutCount) {
        headerText.textContent =
          "You have been too slow to respond in many games. " +
          "Please pay attention to the games.";
      } else {
        headerText.textContent = "You were too slow in responding.";
      }
    } else if (this.name === "fixation") {
      headerText.textContent = "Next game starting...";
      headerText.style.color = "white";
    }

    // Append the header to the target
    _target.appendChild(headerText);
  }

  /**
   * Generate and return a stimulus image
   * @param {string} _key stimulus key
   * @return {HTMLElement}
   */
  private generateStimulus(_key: string): HTMLElement {
    // Create container
    const singleStimulusContainer = document.createElement("div");

    // Create the link element
    const stimulusLink = document.createElement("a");
    stimulusLink.id = _key;

    // Create the image element
    const stimulusImage = document.createElement("img");
    stimulusImage.classList.add("stimulus");
    stimulusImage.src = this.getSource(_key);

    stimulusImage.style.borderStyle = "solid";
    stimulusImage.style.borderWidth = `${this.highlightWidth}px`;
    stimulusImage.style.borderColor = "black";
    stimulusImage.style.borderRadius = "12px";
    stimulusImage.style.boxSizing = "border-box";

    // Join the two
    stimulusLink.appendChild(stimulusImage);
    singleStimulusContainer.appendChild(stimulusLink);

    return singleStimulusContainer;
  }

  /**
   * Generate and display stimuli
   * @param {HTMLElement} _target HTML element to place the content
   */
  private generateStimuli(_target: HTMLElement): void {
    let stimulusCounter = 0;
    for (const stimulus of this.stimuli) {
      // Default stimulus is 'blank'
      let stimulusKey = "blank";

      if (stimulus.startsWith("stimulus")) {
        // Get the current pair of stimuli being shown
        const positionStimuli = this.state.getPositionalMappings();

        // Determine if a practice game or not
        const practiceSuffix = stimulus.endsWith("_p") ? "_p" : "";

        // Two layouts to consider here:
        //    1) left, blank, right       (first & second decision)
        //    2) blank, stimulus, blank   (third decision)
        if (stimulusCounter in [0, 1]) {
          stimulusKey = positionStimuli[0] + practiceSuffix;
        } else {
          stimulusKey = positionStimuli[1] + practiceSuffix;
        }
      } else {
        stimulusKey = stimulus;
      }

      // Create a container for the stimulus and add it
      _target.appendChild(this.generateStimulus(stimulusKey));

      // Increment the counter
      stimulusCounter++;
    }
  }

  /**
   * Generate and display control images
   * @param {HTMLElement} _target HTML element to place the content
   * @param {string} _stage the stage of the stimuli display
   */
  private generateControls(_target: HTMLElement, _stage: string): void {
    // Left control image
    const leftControlContainer = document.createElement("div");
    leftControlContainer.id = "left-control";

    // Left control status
    const leftDisabled = this.isInteractive() ? "" : " control-button-disabled";

    if (!this.stimuli[STIMULUS_POSITIONS.LEFT].startsWith("blank")) {
      if (Configuration.controller === CONTROLLERS.SPECTROMETER) {
        // Images for spectrometer
        const leftControlImage = document.createElement("img");
        leftControlImage.src =
          this.stimuliCollection[`btn_2${leftDisabled}.png`];
        leftControlImage.classList.add("controls");

        // Add to container
        leftControlContainer.appendChild(leftControlImage);
      } else {
        // Button for desktop
        const leftControlButton = document.createElement(
          "button"
        ) as HTMLButtonElement;
        leftControlButton.textContent =
          Configuration.keymaps[
            Configuration.controller
          ].previous.toUpperCase();

        // Button styling
        const buttonClass = `control-button${leftDisabled}`.split(" ");
        leftControlButton.classList.add(...buttonClass);

        // Add to container
        leftControlContainer.appendChild(leftControlButton);
      }
    } else {
      // Default blank image
      const leftControlDefault = document.createElement("img");
      leftControlDefault.src = this.stimuliCollection["blank.png"];
      leftControlDefault.style.height = "64px";
      leftControlDefault.classList.add("controls");

      // Add to container
      leftControlContainer.appendChild(leftControlDefault);
    }

    // Middle control image
    const middleControlContainer = document.createElement("div");
    middleControlContainer.id = "middle-control";

    if (this.name === "decisionThree") {
      if (Configuration.controller === CONTROLLERS.SPECTROMETER) {
        // Image for spectrometer
        const middleControlImageRun = document.createElement("img");
        middleControlImageRun.src = this.stimuliCollection["btn_4.png"];
        middleControlImageRun.classList.add("controls");

        // Add to container
        middleControlContainer.appendChild(middleControlImageRun);
      } else {
        const middleControlButtonRun = document.createElement("button");
        middleControlButtonRun.textContent =
          Configuration.keymaps[Configuration.controller].submit === " "
            ? "Space"
            : Configuration.keymaps[
                Configuration.controller
              ].submit.toUpperCase();

        // Button styling
        middleControlButtonRun.classList.add("control-button");

        // Add to container
        middleControlContainer.appendChild(middleControlButtonRun);
      }
    } else {
      // Default blank image
      const middleControlDefault = document.createElement("img");
      middleControlDefault.src = this.stimuliCollection["blank.png"];
      middleControlDefault.style.height = "64px";
      middleControlDefault.classList.add("controls");

      // Add to container
      middleControlContainer.appendChild(middleControlDefault);
    }

    // Right control image
    const rightControlContainer = document.createElement("div");
    rightControlContainer.id = "right-control";

    // Right control status
    const rightDisabled = this.isInteractive()
      ? ""
      : " control-button-disabled";

    if (!this.stimuli[STIMULUS_POSITIONS.RIGHT].startsWith("blank")) {
      if (Configuration.controller === CONTROLLERS.SPECTROMETER) {
        // Images for spectrometer
        const rightControlImage = document.createElement("img");
        rightControlImage.src =
          this.stimuliCollection[`btn_4${rightDisabled}.png`];
        rightControlImage.classList.add("controls");

        // Add to container
        rightControlContainer.appendChild(rightControlImage);
      } else {
        // Button for desktop
        const rightControlButton = document.createElement(
          "button"
        ) as HTMLButtonElement;
        rightControlButton.textContent =
          Configuration.keymaps[Configuration.controller].next.toUpperCase();

        // Button styling
        const buttonClass = `control-button${rightDisabled}`.split(" ");
        rightControlButton.classList.add(...buttonClass);

        // Add to container
        rightControlContainer.appendChild(rightControlButton);
      }
    } else {
      // Default blank image
      const rightControlDefault = document.createElement("img");
      rightControlDefault.src = this.stimuliCollection["blank.png"];
      rightControlDefault.style.height = "64px";
      rightControlDefault.classList.add("controls");

      // Add to container
      rightControlContainer.appendChild(rightControlDefault);
    }

    _target.appendChild(leftControlContainer);
    _target.appendChild(middleControlContainer);
    _target.appendChild(rightControlContainer);
  }

  /**
   * Generate the HTML description of the stimuli
   * @param {string} _stage one of three stages, "pre", "run", or "post"
   * @return {HTMLElement} HTML element containing all the stimuli
   * HTML components
   */
  public getHTML(_stage = "run"): HTMLElement {
    // Set the background color
    document.body.style.backgroundColor = "black";

    // Generate the overall layout, and populate when necessary
    // Step 1: parent or main container
    const mainContainer = document.createElement("div");
    mainContainer.style.display = "flex";
    mainContainer.style.flexDirection = "column";
    mainContainer.className = "graphics-container";

    // Step 2: add the header
    const headerContainer = document.createElement("div");
    headerContainer.style.display = "flex";
    headerContainer.style.flexDirection = "row";
    headerContainer.className = "header-container";
    this.generateHeader(headerContainer);

    // Step 3: add the stimuli
    const stimuliContainer = document.createElement("div");
    stimuliContainer.style.display = "flex";
    stimuliContainer.style.flexDirection = "row";
    stimuliContainer.className = "stimuli-container";
    this.generateStimuli(stimuliContainer);

    // Step 4: add the controls div
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "controls-container";
    this.generateControls(controlsContainer, _stage);

    // Step 5: Add all components
    mainContainer.appendChild(headerContainer);
    mainContainer.appendChild(stimuliContainer);
    mainContainer.appendChild(controlsContainer);

    return mainContainer;
  }
}
