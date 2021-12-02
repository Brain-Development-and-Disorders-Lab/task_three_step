/**
 * @summary Class to store and generate instructions for the jsPsych timeline
 * used in the Keramati et al. model-based model-free decision-making task.
 *
 * @link   https://github.com/henry-burgess/ccddm2020/blob/master/tasks/threestep/src/trials/instructions.ts
 * @author Henry Burgess <henry.burgess@wustl.edu>
 */

// Imports
import { Configuration } from "../../Configuration";
import { Experiment } from "../API";
import { CONTROLLERS } from "../Constants";

// Button styling
import "../../css/buttons.css";

// Logging library
import consola from "consola";

/**
 * Instructions class used to generate and manage sets of instruction
 * HTML and text.
 */
export class Instructions {
  private _generated: boolean;
  private _choiceTimeText: string;
  private _instructions: {
    overview: string[];
    introduction: string[];
    practice: string[];
    main: string[];
    spectrometer: string[];
    break: string[];
  };
  private _imageCollection: { [x: string]: any };
  private _duration: number;
  private _controlReminderText: string;
  private _preGameInstructions: string;
  private _breakInstructions: string;
  private _experiment: Experiment;

  /**
   * Default constructor.
   */
  constructor() {
    this._generated = false;

    // Get the Experiment instance
    this._experiment = window["Experiment"] as Experiment;

    // Get the images using the ImageCollection class
    this._imageCollection = this._experiment.getStimuli();
  }

  /**
   * Generate all instructions. Additionally load the images
   * using the ImageCollection class.
   */
  public generateInstructions(): void {
    // Duration
    this._duration = this._calculateDuration(
      Configuration.manipulations.resources
    );

    // Choice time text
    this._choiceTimeText = this._getDurationText(
      Configuration.timings["decisionOne"][
        Configuration.manipulations.resources
      ]
    );

    if (Configuration.controller === CONTROLLERS.SPECTROMETER) {
      this._controlReminderText =
        `<p>Remember, press ` +
        `<img ` +
        `src=${this._imageCollection["dark_btn_2.png"]} ` +
        `style="${Configuration.style.keyboard}"` +
        `>` +
        ` or ` +
        `<img ` +
        `src=${this._imageCollection["dark_btn_3.png"]} ` +
        `style="${Configuration.style.keyboard}"` +
        `>` +
        ` to select a room to enter, and ` +
        `<img ` +
        `src=${this._imageCollection["dark_btn_4.png"]} ` +
        `style="${Configuration.style.keyboard}"` +
        `>` +
        ` to enter the final room when you see the button ` +
        `enabled.` +
        `</p>`;
    } else {
      this._controlReminderText =
        `<p>Remember, press ` +
        `<button class="control-button"><b>F</b></button>` +
        ` or ` +
        `<button class="control-button"><b>J</b></button>` +
        ` to select a room to enter, and ` +
        `<button class="control-button"><b>K</b></button>` +
        ` to enter the final room when you see the key ` +
        `enabled.` +
        `</p>`;
    }

    // Pre-game instructions with appropriate button prompts
    this._preGameInstructions =
      `<p>` +
      `You have now viewed all the instructions.</p><p> ` +
      `If you wish, you can review the instructions again by pressing `;

    // Back (previous) button
    if (Configuration.controller === CONTROLLERS.SPECTROMETER) {
      this._preGameInstructions +=
        `<img ` +
        `src=${this._imageCollection["dark_btn_2.png"]} ` +
        `style="${Configuration.style.keyboard}"` +
        `>`;
    } else {
      this._preGameInstructions += `<button class="control-button"><b>F</b></button>`;
    }

    this._preGameInstructions += ` to go back.</p>` + `<p>Press `;

    // Next (continue) button
    if (Configuration.controller === CONTROLLERS.SPECTROMETER) {
      this._preGameInstructions +=
        `<img ` +
        `src=${this._imageCollection["dark_btn_3.png"]} ` +
        `style="${Configuration.style.keyboard}"` +
        `>`;
    } else {
      this._preGameInstructions += `<button class="control-button"><b>J</b></button>`;
    }

    this._preGameInstructions += ` to continue and begin the games!</p>`;

    // Break instructions text
    this._breakInstructions =
      `<h1>Ready to continue?</h1>` +
      `<p>Take a moment to have a quick break. </p>` +
      `<p>When you are ready to continue with the games, press `;

    // Next (continue) button
    if (Configuration.controller === CONTROLLERS.SPECTROMETER) {
      this._breakInstructions +=
        `<img ` +
        `src=${this._imageCollection["dark_btn_3.png"]} ` +
        `style="${Configuration.style.keyboard}"` +
        `>`;
    } else {
      this._breakInstructions += `<button class="control-button"><b>J</b></button>`;
    }

    this._breakInstructions += `</p>`;

    // Instructions collection
    this._instructions = {
      // Overview of the game
      overview: [
        // Page 1
        `<h1>${Configuration.name} game</h1>` +
          `<p><b>Approximate duration:</b> ${this._duration} minutes</p>` +
          `<h2>Game Overview</h2>` +
          `<img src="${this._imageCollection["Instructions1.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>There are four rooms in this game. ` +
          `Each room is marked with a different image, ` +
          `so that you will know in what room you are. ` +
          `You will play many games, and in each game, ` +
          `you will decide what room you want to move to. ` +
          `In each game, only one of these rooms contains the treasure, ` +
          `and you will collect a point if you reach this room. ` +
          `If you move to any of the other rooms, ` +
          `you with not gain a point in that particular game. ` +
          `You play a limited number of games in total, ` +
          `so you should try to find the treasure as many times ` +
          `as you can.</p>` +
          this.getNavigationControls(false, true),
      ],

      // Introduction to the game
      introduction: [
        // Page 1
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Instructions</h2>` +
          `<img src="${this._imageCollection["Instructions2.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>Let’s say that in a particular game, ` +
          `the treasure is in the 2nd room from the left. ` +
          `If the treasure is in that room, ` +
          `it will stay there for a few games, ` +
          `and then it will randomly relocate to another room. ` +
          `Obviously you should try to find its new location. ` +
          `Then, after a few more games, it will again randomly relocate.</p>` +
          this.getNavigationControls(true, true),

        // Page 2
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Instructions</h2>` +
          `<img src="${this._imageCollection["Instructions3.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>To get to different rooms, you must make a set of choices. ` +
          `At the beginning of every game, ` +
          `you will see two icons, one for each room you can enter.</p>` +
          this.getNavigationControls(true, true),

        // Page 3
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Instructions</h2>` +
          `<img src="${this._imageCollection["Instructions4.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>You can choose to enter rooms by pressing the ` +
          `${
            Configuration.controller === CONTROLLERS.SPECTROMETER
              ? `<img src="${this._imageCollection["btn_2.png"]}` +
                `style="${Configuration.style.keyboard}">`
              : '<button class="control-button"><b>F</b></button>'
          }` +
          ` key to select the left room or the ` +
          `${
            Configuration.controller === CONTROLLERS.SPECTROMETER
              ? `<img src="${this._imageCollection["btn_3.png"]}` +
                `style="${Configuration.style.keyboard}">`
              : '<button class="control-button"><b>J</b></button>'
          }` +
          ` key to select the right room.</p>` +
          `<p>When the images appear for the rooms, you have ` +
          `${this._choiceTimeText} ` +
          `to make enter a room; otherwise, you lose that game. ` +
          `If you don’t respond fast enough, ` +
          `you will have lost an opportunity to locate the treasure, ` +
          `and a red timer will briefly appear on your screen.</p>` +
          this.getNavigationControls(true, true),

        // Page 4
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Instructions</h2>` +
          `<img src="${this._imageCollection["Instructions5.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>After choosing to enter a room, ` +
          `you will enter one of two new locations, ` +
          `depending on your first choice. </p>` +
          `<p>The two possible locations are represented by the ` +
          `<i>middle rectangles</i> in the above diagram. ` +
          `The thickness of the arrows reaching from the ` +
          `<i>lower rectangle</i> shows your chance of ending ` +
          `up in either of the middle locations as a result of your ` +
          `choice.</p>` +
          `<p>For example, if you first choose the <i>right</i> room, ` +
          `most of the time you will move to the middle right location ` +
          `containing the diamond and triangle rooms. ` +
          `On rare occasions, you will move to the middle left location ` +
          `containing the star-like and circular rooms. ` +
          `Similarly, if you first choose the <i>left</i> room, ` +
          `most of the time you will move to the middle left location, ` +
          `but on some rare occasions you may move to the middle right ` +
          `location.</p>` +
          `<p>The diagrams you are being shown now do not appear exactly ` +
          `how the game appears. ` +
          `The arrows and locations are all included in the diagram ` +
          `to help you understand the game rules.` +
          this.getNavigationControls(true, true),

        // Page 5
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Instructions</h2>` +
          `<img src="${this._imageCollection["Instructions6.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>Let’s say that in a particular game, you choose the ` +
          `<i>right</i> star room and you move to the middle ` +
          `right location. ` +
          `You will see two rooms on the screen, the ` +
          `diamond room and the triangle room.</p>` +
          this.getNavigationControls(true, true),

        // Page 6
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Instructions</h2>` +
          `<img src="${this._imageCollection["Instructions7.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>You have ${this._choiceTimeText} to ` +
          `choose between these rooms, by pressing the ` +
          `${
            Configuration.controller === CONTROLLERS.SPECTROMETER
              ? `<img src="${this._imageCollection["btn_2.png"]}` +
                `style="${Configuration.style.keyboard}">`
              : '<button class="control-button"><b>F</b></button>'
          }` +
          ` or ` +
          `${
            Configuration.controller === CONTROLLERS.SPECTROMETER
              ? `<img src="${this._imageCollection["btn_3.png"]}` +
                `style="${Configuration.style.keyboard}">`
              : '<button class="control-button"><b>J</b></button>'
          }` +
          ` keys on the keyboard.` +
          `</p>` +
          this.getNavigationControls(true, true),

        // Page 7
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Instructions</h2>` +
          `<img src="${this._imageCollection["Instructions8.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>As a result of your choice, you will move to one of ` +
          `the final locations, a room potentially ` +
          `containing the treasure.</p>` +
          this.getNavigationControls(true, true),

        // Page 8
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Instructions</h2>` +
          `<img src="${this._imageCollection["Instructions9.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>For example, if you choose the gold triangle room in the middle ` +
          `right location, most of the time you will move to the ` +
          `4th room with the flame-like image. ` +
          `On rare occasions you will move to the 2nd room ` +
          `with the cloth-like image. ` +
          `Let’s say you enter the 4th room. At first, ` +
          `you will only see the flame-like image.</p>` +
          this.getNavigationControls(true, true),

        // Page 9
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Instructions</h2>` +
          `<img src="${this._imageCollection["Instructions10.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>You must wait half a second for a white outline to appear ` +
          `around the flame-like image, shown in the diagram above. ` +
          `After that, you have have ${this._choiceTimeText} to press the ` +
          `${
            Configuration.controller === CONTROLLERS.SPECTROMETER
              ? `<img src="${this._imageCollection["btn_4.png"]}` +
                `style="${Configuration.style.keyboard}">`
              : '<button class="control-button"><b>K</b></button>'
          }` +
          ` key.</p>` +
          `<p>When you do that, you will know if you located the treasure, ` +
          `you will see either a dollar sign (treasure) or a cross ` +
          `(no treasure). ` +
          `In this example, you would see a cross, since the treasure ` +
          `is not in the room you reached.` +
          `The next game will then start from the starting location ` +
          `in a few seconds.</p>` +
          this.getNavigationControls(true, true),

        // Page 10
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Instructions</h2>` +
          `<p>You will play this version of the game ` +
          `to practice playing the game and understanding ` +
          `how the game works.</p>` +
          this.getNavigationControls(true, true),
      ],

      // Practice games instructions
      practice: [
        // Page 1
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Practice games</h2>` +
          `<img src="${this._imageCollection["Instructions11.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>The practice games are composed of three types of games. ` +
          `First, you will play ` +
          `${Configuration.manipulations.levelOnePracticeTrials} games ` +
          `where you will only experience the first two locations, ` +
          `so that you can learn how to move to your desired ` +
          `second location.</p>` +
          this.getNavigationControls(false, true),

        // Page 2
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Practice games</h2>` +
          `<img src="${this._imageCollection["Instructions12.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>Then, you will play ` +
          `${Configuration.manipulations.levelTwoPracticeTrials} games ` +
          `where you can move all the way to the final rooms, ` +
          `but you will not see if you found the treasure or not. ` +
          `These practice games are for learning how to reach ` +
          `different final rooms.</p>` +
          this.getNavigationControls(true, true),

        // Page 3
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Practice games</h2>` +
          `<img src="${this._imageCollection["Instructions13.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>Finally, you will play ` +
          `${Configuration.manipulations.levelThreePracticeTrials} ` +
          `games where ` +
          `you will be shown if you found the treasure or not. ` +
          `Use these games to practice trying to locate the treasure ` +
          `as often as possible.</p>` +
          this.getNavigationControls(true, true),

        // Page 4
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Practice games</h2>` +
          `<p>In summary, all these practice games are only for ` +
          `getting an idea of how the game works. ` +
          `After that, the real games starts. ` +
          `Now let’s play the practice games and afterward, ` +
          `the real games will be explained before you start.` +
          `</p>` +
          `<p><b>Good luck!<b></p>` +
          this.getNavigationControls(true, true),
      ],

      // Main games instructions
      main: [
        // Page 1
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Main games</h2>` +
          `<p>Now you are going to play the main games. ` +
          `All the rules and choices for these games are the same. ` +
          `The only difference is that all the rooms have ` +
          `different images.</p>` +
          this.getNavigationControls(false, true),

        // Page 2
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Main games</h2>` +
          `<img src="${this._imageCollection["Instructions14.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>When you play the game, you will see and discover the ` +
          `images by yourself. ` +
          `At first, you will not know which image leads to ` +
          `which location; but you will gradually learn by trying ` +
          `multiple times.</p>` +
          this.getNavigationControls(true, true),

        // Page 3
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Main games</h2>` +
          `<img src="${this._imageCollection["Instructions14.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>Once you have learned which image leads to which, ` +
          `it will stay the same for the rest of the games, ` +
          `just like the practice games. ` +
          `So once you know, it doesn’t change.</p>` +
          this.getNavigationControls(true, true),

        // Page 4
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Main games</h2>` +
          `<img src="${this._imageCollection["Instructions14.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>The only thing that changes across the games ` +
          `is where the treasure is; also like the practice session. ` +
          `If you recall, the treasure relocates from one room to another ` +
          `after a few games.</p>` +
          this.getNavigationControls(true, true),

        // Page 5
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Main games - Diagrams</h2>` +
          `<img src="${this._imageCollection["Instructions15.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>In the main games, again, you will get to play ` +
          `${Configuration.manipulations.levelOneMainTrials} practice ` +
          `games at first, only visiting the first two locations.</p>` +
          this.getNavigationControls(true, true),

        // Page 6
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Main games - Diagrams</h2>` +
          `<img src="${this._imageCollection["Instructions16.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>Then, you will play ` +
          `${Configuration.manipulations.levelTwoMainTrials} ` +
          `practice games visiting all three locations, ` +
          `but you will not be shown if you found the treasure or not.</p>` +
          this.getNavigationControls(true, true),

        // Page 7
        `<h1>${Configuration.name} game</h1>` +
          `<h2>Main games - Diagrams</h2>` +
          `<img src="${this._imageCollection["Instructions17.png"]}" ` +
          `style="${Configuration.style.image}">` +
          `<p>Finally, you will play ` +
          `${Configuration.manipulations.levelThreeMainTrials} games. ` +
          `These are not practice games. ` +
          `It is during these games that you will see if you found ` +
          `the treasure or not, and all the games before this point ` +
          `were to prepare you for this phase.</p>` +
          `<p><b>Good luck!<b></p>` +
          this.getNavigationControls(true, true),

        // Page 8
        `${this.getSnippet("preGameInstructions")}` +
          this.getSnippet("instructionContinue"),
      ],

      // Spectrometer waiting screen
      spectrometer: [
        `<h1>${Configuration.name} Game</h1>` +
          `<h2>Please Wait...</h2>` +
          `<p>You have completed all the practice games.</p>` +
          `<p>Waiting for spectrometer to be ready.</p>` +
          `<p>When this page disappears, the games will commence.</p>` +
          `<p><b>Good luck!</b></p>`,
      ],

      // Break between games instructions
      break: [
        `${this._breakInstructions}` +
          `${this.getNavigationControls(false, true)}`,
      ],
    };

    // Mark the instructions as fully generated
    this._generated = true;
  }

  /**
   * Generate and return an HTML string showing the controls used
   * to navigate the instructions in the game.
   * @param {boolean} back show '<- Back'
   * @param {boolean} next show 'Next ->'
   * @return {string} HTML string
   */
  private getNavigationControls(back: boolean, next: boolean): string {
    // Instructions navigation graphics
    let _navigationHTML =
      `<br>` +
      `<hr>` +
      `<div style="display: flex; flex-direction: row; align-items: center;">`;

    if (back === true) {
      // Left (back) button
      _navigationHTML += `<p>&larr; Back &nbsp;</p>`;

      if (Configuration.controller === CONTROLLERS.SPECTROMETER) {
        _navigationHTML +=
          `<img ` +
          `src="${this._imageCollection["btn_2.png"]}" ` +
          `style="${Configuration.style.keyboard}"` +
          `>`;
      } else {
        _navigationHTML += `<button class="control-button"><b>F</b></button>`;
      }
    }

    if (next === true) {
      // Right (continue) button
      if (Configuration.controller === CONTROLLERS.SPECTROMETER) {
        _navigationHTML +=
          `<img ` +
          `src="${this._imageCollection["btn_3.png"]}" ` +
          `style="${Configuration.style.keyboard} margin-left: auto;"` +
          `>`;
      } else {
        _navigationHTML +=
          `<button class="control-button" ` +
          `style="margin-left: auto;"><b>J</b></button>`;
      }

      _navigationHTML += `<p>&nbsp; Next &rarr;</p>`;
    }

    _navigationHTML += `</div>`;

    return _navigationHTML;
  }

  /**
   * Generate and return an HTML string containing the controls
   * for the attention check questions.
   * @return {string} HTML string
   */
  private getAttentionCheckControls(): string {
    let _attentionCheckHTML = ``;
    // Control keys for the attention check questions
    if (Configuration.controller === CONTROLLERS.SPECTROMETER) {
      _attentionCheckHTML =
        `<div>` +
        `<img ` +
        `src="${this._imageCollection["ControlsQuestionSpectrometer.png"]}" ` +
        `style="${Configuration.style.controlImage}"` +
        `>` +
        `</div>`;
    } else {
      _attentionCheckHTML =
        `<div style="display: flex; flex-direction: row; ` +
        `align-items: center; justify-content: space-around;">` +
        `<button class="control-button" ` +
        `><b>D</b></button>` +
        `<button class="control-button" ` +
        `><b>F</b></button>` +
        `<button class="control-button" ` +
        `><b>J</b></button>` +
        `<button class="control-button" ` +
        `><b>K</b></button>` +
        `</div>` +
        `<div style="display: flex; flex-direction: row; ` +
        `align-items: center; justify-content: space-around;">` +
        `<p>Option 1</p>` +
        `<p>Option 2</p>` +
        `<p>Option 3</p>` +
        `<p>Submit</p>` +
        `</div>`;
    }

    return _attentionCheckHTML;
  }

  /**
   * Generate and return the instruction text.
   * @return {any} Instruction text
   */
  public get(): {
    overview: string[];
    introduction: string[];
    practice: string[];
    main: string[];
    spectrometer: string[];
    break: string[];
  } {
    if (!this._generated) {
      // Warn if the structions are not generated
      consola.warn("Instruction text not generated.");

      // Return an empty collection of instructions
      return {
        overview: [],
        introduction: [],
        practice: [],
        main: [],
        spectrometer: [],
        break: [],
      };
    } else {
      return this._instructions;
    }
  }

  /**
   * Retrieve a specific snippet of instructions
   * @param {string} _type Specific snippet to return
   * @return {any}
   */
  getSnippet(_type: string): string {
    if (_type === "controlInstructions") {
      return this.getAttentionCheckControls();
    } else if (_type === "controlReminder") {
      return this._controlReminderText;
    } else if (_type === "instructionContinue") {
      return this.getNavigationControls(true, true);
    } else if (_type === "instructionNextOnly") {
      return this.getNavigationControls(false, true);
    } else if (_type === "preGameInstructions") {
      return this._preGameInstructions;
    } else if (_type === "breakInstructions") {
      return this._breakInstructions;
    } else {
      consola.warn(`Unknown instructions snippet '${_type}'.`);
      return "";
    }
  }

  /**
   * Generate a phrase based on a duration.
   * @param {number} time Number of milliseconds
   * @return {string}
   */
  private _getDurationText(time: number): string {
    if (time === 500) {
      return `half a second`;
    } else if (time > 500 && time < 1000) {
      return `less than 1 second`;
    } else if (time > 1000) {
      const seconds = Math.floor(time / 1000).toFixed(0);
      return `about ${seconds} seconds`;
    }
  }

  /**
   * Estimate the number of minutes depending on the resource
   * level of the participant.
   * @param {string} resourceLevel 'high' or 'low' resource
   * @return {number}
   */
  private _calculateDuration(resourceLevel: string): number {
    const base = 0.4 + 0.4 + 0.4 + 0.5 + 0.7;

    const totalTrials =
      Configuration.manipulations.levelOnePracticeTrials +
      Configuration.manipulations.levelTwoPracticeTrials +
      Configuration.manipulations.levelThreePracticeTrials +
      Configuration.manipulations.levelOneMainTrials +
      Configuration.manipulations.levelTwoMainTrials +
      Configuration.manipulations.levelThreeMainTrials;

    // Total time in seconds
    let total = base;
    if (resourceLevel === "high") {
      total += 3 * 2;
    } else {
      total += 3 * 0.7;
    }
    total *= totalTrials;

    // Convert to minutes
    total /= 60;
    return Math.ceil(total);
  }
}
