# This file will be used for simulating trials using the
# generated JSON file.

import numpy as np
import json

TRIALS_PATH = '../generate/trials.json'


# ------------ UTILITY FUNCTIONS ------------
def load_trials():
    """
    Load a set of trial configurations from the specified parameters JSON file.

    :return: Object representing the contents of the parameters file
    """
    with open(TRIALS_PATH, "r", encoding="utf-8") as f:
        _trial_collection = json.load(f)

    return _trial_collection['trials']


def simulate():
    trials = load_trials()
    main_three = trials['main_three']

    rewards = 0

    for trial in main_three:
        count = trial['trial_count']
        mappings = trial['mappings']

        # First state
        start = mappings['start']['stimuli']

        first_action = np.random.randint(0, 2)
        first_stimulus = start[first_action]

        # Second state
        second_state = mappings['{}'.format(first_stimulus)]['stimuli']

        second_action = np.random.randint(0, 2)
        second_stimulus = second_state[second_action]

        # Third state
        third_state = mappings['{}'.format(second_stimulus)]['stimuli']
        third_stimulus = third_state[0]

        # Reward
        reward_stimulus = trial['reward_stimulus']
        if third_stimulus == reward_stimulus:
            rewards += 1

    reward_proportion = rewards / len(main_three)
    print('Rewarded {} time/s ({}%)'.format(rewards, reward_proportion * 100))


if __name__ == '__main__':
    simulate()
