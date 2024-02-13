# Three-Step Task

> Three-step decision-making task described by Keramati et al., 2016 "Adaptive integration of habits into depth-limited planning defines a habitual-goal–directed spectrum"

## Requirements

* jsPsych v6.0+

## Overview

`Plugin.ts` is the jsPsych plugin file that defines the experiment behaviour. `Configuration.ts` is used to specify parameters unique to the task such as timing and keymappings. It also allows features to be enabled or disabled.

To get started with development, run `yarn dev`. This will start a Webpack development server which can be accessed at [localhost:8080](http://localhost:8080).

To run the ESLint style-checker, run `yarn style`. Additionally, Prettier can be run using `yarn lint`.

## Repository Structure

* **/css**: Any styling used for the experiment is included here.
* **/img**: All stimuli are stored in this directory as `.png` or `.svg` files.
* **/lib**: Contains grouped exports and core runtime code, grouped by purpose and functionality:
  * `API.ts` exports various API classes that are used to interact with the Gorilla API.
  * `Assets.ts` exports classes used to manage assets such as images and videos used throughout the experiments.
  * `Functions.ts` contains a number of exported utility functions including scaling and trial management.
  * `Main.ts` configures the jsPsych timeline and starts the experiment.
  * `Runtime.ts` exports a number of runtime classes used in the experiment such as the `Runner`, `State`, and `Stimuli` classes.
* **/lib/classes**: The `classes` sub-directory contains a file for each class specified.
* **/lib/trials**: Contains various scripts used to generate the trials prior to running the experiment. The script output `trials.json` is imported and used by `Main.ts` prior to running the trials in the browser.

## License

<!-- CC BY-NC-SA 4.0 License -->
<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">
  <img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" />
</a>
<br />
This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.

## Issues and Feedback

Please contact **Henry Burgess** <[henry.burgess@wustl.edu](mailto:henry.burgess@wustl.edu)> for all code-related issues and feedback.
