/**
 * @summary Unit tests for Keramati et al. model-based model-free
 * decision-making task.
 *
 * @link   https://github.com/henry-burgess/ccddm2020/blob/master/tasks/keramati_2016_model_based_model_free/test/unit.test.js
 * @author Henry Burgess <s4481993@student.uq.edu.au>
 */
import { beforeEach, test, expect } from "@jest/globals";
import seedrandom from "seedrandom";
import { Experiment } from "../../src/lib/API";
import { State, Stimuli } from "../../src/lib/Runtime";
import { Configuration } from "../../src/Configuration";

let state: State;
let stimuli: Stimuli;

beforeEach(() => {
  // Create an Experiment instance and place it in the window
  window["Experiment"] = new Experiment();

  window.Math.random = seedrandom(Configuration.seed);
  const mappings = {
    "0": {
      left: {
        common: "1,0",
        rare: "1,1",
      },
      right: {
        common: "1,1",
        rare: "1,0",
      },
    },
    "1,0": {
      left: {
        common: "2,0",
        rare: "2,2",
      },
      right: {
        common: "2,1",
        rare: "2,3",
      },
    },
    "1,1": {
      left: {
        common: "2,2",
        rare: "2,0",
      },
      right: {
        common: "2,3",
        rare: "2,1",
      },
    },
  };
  state = new State("0", mappings);
  const stimuliData = {
    name: "testStimuli",
    stage: "test_stage",
    description: "Test stimuli",
    stimuli: ["left", "focus", "right"],
    isInteractive: true,
    selected: false,
    response: undefined,
    bindings: {},
    target: null,
    timing: {
      pre: 0,
      run: 2000,
      post: 400,
    },
    onFinish: null,
  };
  stimuli = new Stimuli(stimuliData, state);
});

test("check that stimuli can be set", () => {
  stimuli.setStimuli(["left", "right"]);
  expect(stimuli.getStimuli().length).toBe(2);
  expect(stimuli.getStimuli()[0]).toBe("left");
  expect(stimuli.getStimuli()[1]).toBe("right");
});

test("check the ID", () => {
  expect(state.getID()).toBe("0");
});

test("check that board depth is 0", () => {
  expect(state.getDepth()).toBe(0);
});

test("check that board column is 1", () => {
  expect(state.getColumn()).toBe(1);
});

test("set the reward location", () => {
  state.setRewardStimulus(0);
  expect(state.isRewardStimulus(0)).toBe(true);
});

test("check reward location", () => {
  expect(state.isRewardStimulus(-1)).toBe(true);
});
