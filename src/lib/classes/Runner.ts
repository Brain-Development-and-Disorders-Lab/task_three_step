// Imports
import { clear, scale } from "../Functions";
import { Stimuli } from "../Runtime";

// Logging library
import consola from "consola";

/**
 * Driver class that operates trials, showing stimuli
 */
export class Runner {
  /**
   * Start the runner
   * @param {Stimuli} stimuli stimuli to display
   */
  static start(stimuli: Stimuli): void {
    Runner.setup(stimuli);
  }

  /**
   * First stage of the runner
   * @param {Stimuli} stimuli stimuli to display
   */
  static setup(stimuli: Stimuli): void {
    consola.debug(`Runner 'setup'... (${stimuli.getPreTime()}ms)`);

    clear(stimuli.getTarget());

    // Generate and set the HTML nodes of the stimlus
    stimuli.getTarget().appendChild(stimuli.getHTML("pre"));
    // Scaling?
    scale();

    stimuli.setTimer(
      window.setTimeout(function () {
        Runner.run(stimuli);
      }, stimuli.getPreTime())
    );
  }

  /**
   * Run stage of the runner
   * @param {Stimuli} stimuli stimuli to display
   */
  static run(stimuli: Stimuli): void {
    consola.debug(`Runner 'run'... (${stimuli.getRunTime()}ms)`);

    // Setup key bindings
    stimuli.createKeybindings();

    window.clearTimeout(stimuli.getTimer());
    stimuli.setTimer(
      window.setTimeout(function () {
        Runner.post(stimuli);
      }, stimuli.getRunTime())
    );
  }

  /**
   * Post stage of the runner
   * @param {Stimuli} stimuli stimuli to display
   */
  static post(stimuli: Stimuli): void {
    consola.debug(`Runner 'post'... (${stimuli.getPostTime()}ms)`);

    stimuli.removeKeybindings();
    window.clearTimeout(stimuli.getTimer());
    stimuli.setTimer(
      window.setTimeout(function () {
        Runner.finish(stimuli);
      }, stimuli.getData().timing.post)
    );
  }

  /**
   * Final stage of the runner
   * @param {Stimuli} stimuli stimuli to display
   */
  static finish(stimuli: Stimuli): void {
    window.clearTimeout(stimuli.getTimer());
    clear(stimuli.getTarget());

    // Execute the onFinish callback
    stimuli.onFinish();
  }
}
