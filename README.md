# Three-step task

## Overview

The best place to start is the `Plugin.ts` file in the `/src` directory. This is the jsPsych plugin file that defines the experiment behaviour.

`Configuration.ts` is used to specify parameters unique to the task such as timing and keymappings. It also allows features to be enabled or disabled.

## Getting Started

To get started with development, run `yarn dev`. This will start a Webpack development server which can be accessed at [localhost:8080](http://localhost:8080).

To run the ESLint style-checker, run `yarn style`. Additionally, Prettier can be run using `yarn lint`.

## Source Code Structure

### /css

Any styling used for the experiment is included here.

### /img

All stimuli are stored in this directory as `.png` or `.svg` files.

### /lib

The files inside `/lib` contain grouped exports and core runtime code, grouped by their purpose and the functionality they contribute towards.

- `API.ts` exports various API classes that are used to link into Gorilla.
- `Assets.ts` exports classes used to manage assets such as images and videos used throughout the experiment.
- `Functions.ts` contains a number of exported utility functions including scaling and trial management.
- `Main.ts` configures the jsPsych timeline and starts the experiment.
- `Runtime.ts` exports a number of runtime classes used in the experiment such as the `Runner`, `State`, and `Stimuli` classes.

#### /lib/classes

The `classes` sub-directory contains a file for each class specified and exported by a class contained in `lib`.

#### /lib/trials

Contains various scripts used to generate the trials prior to running the experiment. The script output `trials.json` is imported and used by `Main.ts` prior to running the trials in the browser.
