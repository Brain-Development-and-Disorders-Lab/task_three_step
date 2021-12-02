# This file will be used for generating trials for the
# three-step task. Output format is JSON.


# ------------ IMPORTS ------------
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.ticker import PercentFormatter
import hashlib
import json
import datetime
import time

# ------------ PARAMETERS FILE ------------
"""
The parameters file is a JSON file that includes information for different trials that need
to be generated. This allows trials to be grouped and generated on a per-group basis.
File structure (parameters.json)::

    {
        "trials": [
            {
                "name": "trial_name",
                "number": n
            },
            ...
        ]
    }

The file consists of list, "trials" (line 2) that contains objects representing each of the
trial types to be generated. A trial type consists of a unique "name" string (line 4) and
the required number of trials to be generated, represented as a positive integer (line 5).
"""
PARAMETERS_PATH = "./parameters.json"

# ------------ SEEDs ------------
# A list of potential seeds. The last entry will
# always be random.
SEEDS = [
    3691,
    85447,
    30471,
    12847,
    np.random.randint(1, 100000)
]


# ------------ CONSTANTS ------------
TRANSITION_COMMON = "C"  # Placeholder
TRANSITION_RARE = "R"  # Placeholder
COLORS = [
    "tab:blue",
    "tab:orange",
    "tab:green",
    "tab:red",
    "tab:purple"
]  # Colours for the histograms
REWARD_COLUMNS = 4  # Number of reward columns
THRESHOLD = 0.01  # Threshold for checking alignment with distribution
NORMAL_MEAN = 5.0  # Mean of normal distribution
NORMAL_VAR = 2.0  # Variance of normal distribution
NORMAL_STD = round(np.math.sqrt(NORMAL_VAR), 4)  # Compute the standard deviation of normal distribution
SEED = SEEDS[3]  # Select the seed used for random generation
FIXED = False  # Whether or not to use fixed generation
PLOT = True  # Whether to draw plots or not
QUICK = True  # One or conditional iterations
DEBUG = False  # Show / hide debug print() messages, slows down execution SIGNIFICANTLY


# ------------ UTILITY FUNCTIONS ------------
def load_parameters():
    """
    Load a set of trial configurations from the specified parameters JSON file.

    :return: Object representing the contents of the parameters file
    """
    with open(PARAMETERS_PATH, "r", encoding="utf-8") as f:
        _trial_configuration = json.load(f)

    return _trial_configuration


def save_file(path: str, trial_data: dict):
    """
    Dump the data values to a JSON file

    :param path: path to the JSON file, includes ".json" extension
    :param trial_data: data (as dictionary) to encode into the file
    :return: None
    """

    # Save a timestamp
    trial_data["timestamp"] = str(datetime.datetime.now())

    with open(path, "w", encoding="utf-8") as f:
        json.dump(trial_data, f, ensure_ascii=False, indent=4)

    print("Saved file \"{}\". Generating SHA-256 checksum...".format(path))

    # Generate an MD5 hash of the JSON file
    # Read in the contents
    trials_data = None
    with open(path, "rb") as trials_file:
        trials_data = trials_file.read()

        # Create a new checksum text file and generate the hash
        trials_hash = ""
        with open("checksum.txt", "w+") as checksum_file:
            trials_hash = hashlib.sha256(trials_data).hexdigest()
            checksum_file.write(trials_hash)

        print("Saved file \"{}\" containing hash \"{}\".".format("checksum.txt", trials_hash))


def check_constraints(actual_val: float, desired_val: float, threshold: float) -> bool:
    """
    Utility function to check how close two floats are to each other

    :param actual_val: actual value
    :param desired_val: expected value
    :param threshold: threshold percentage
    :return: True if within threshold
    """
    diff = np.abs((actual_val - desired_val) / desired_val)
    return diff < threshold


# ------------ GENERATING FUNCTIONS ------------
def generate_trial_mappings(trial_number: int, common_probability: float):
    """
    Generate trial mappings. Mappings are based on the stimulus number (1...10).
    The overall mapping is assembled from three separate ``steps``.
    The first step assembles the mappings of the first stimuli, ``[1, 2]``.
    The second step assembles the mappings of the first stimuli, ``[1, 2]``, to the second
    sets of stimuli, ``[3, 4]`` and ``[5, 6]``.

    Finally, the third step assembles the mappings of the second sets of stimuli, ``[3, 4]``
    and [5, 6], to the final reward stimuli, ``[7]``, ``[8]``, ``[9]``, and ``[10]``.
    Mapping objects are created for each step, and with the exception of step one, contain
    the following information::

        step_x = {
            origin_stimulus: {
                 "stimuli": [destination_stimulus_left, destination_stimulus_right]
            }
        }

    ``origin_stimulus`` is the number of the stimulus that was selected to reach the following
    destination stimuli at this specific stage. For example, when the participant is to be shown ``[3, 4]``
    after making an initial decision, a mapping for this (assuming a common transition after
    selecting stimulus 1 initially) is as follows::

       step_two = {
           1: {
               "stimuli": [3, 4]
           }
       }

    Pairs in the ``stimuli`` list are randomly swapped, due to counter-balancing.

    The entire mapping is assembled into an object by extracting the mappings for each
    numbered stimulus. The final mapping object generated is of the following structure::

        mapping = {
            "start": step_one,
            1: step_two[1],
            2: step_two[2],
            3: step_three[3],
            4: step_three[4],
            5: step_three[5],
            6: step_three[6]
        }

    :param trial_number: The trial number currently being generated.
    :param common_probability: Probability of a common transition.
    :return:
    """

    if DEBUG:
        print("\t---- [Trial {}] ----".format(trial_number))

    # All common transitions
    mapping = {
        # [S0-L, S0-R]
        "start": {
            "stimuli": [1, 2],
        },
        # S0-L -> [S1-L, S1-R]
        1: {
            "stimuli": [3, 4],
        },
        # S0-R -> [S2-L, S2-R]
        2: {
            "stimuli": [5, 6],
        },
        3: {
            # S1-L -> [S1]
            "stimuli": [7],  # Common transition
        },
        4: {
            # S1-R -> [S2]
            "stimuli": [8],  # Common transition
        },
        5: {
            # S2-L -> [S3]
            "stimuli": [9],  # Common transition
        },
        6: {
            # S2-R -> [S4]
            "stimuli": [10],  # Common transition
        },
    }

    # Counter-balance first state
    if np.random.rand() > 0.5:
        mapping["start"]["stimuli"] = [2, 1]

    # Counter-balance second state
    if np.random.rand() > 0.5:
        # S1-L, S1-R becomes S1-R, S1-L
        mapping[1]["stimuli"] = [4, 3]
    if np.random.rand() > 0.5:
        # S2-L, S2-R becomes S2-R, S2-L
        mapping[2]["stimuli"] = [6, 5]

    # Sample the transition types
    transitions = np.random.choice(a=[TRANSITION_COMMON, TRANSITION_RARE],
                                   size=[2],
                                   replace=True,
                                   p=[common_probability, 1 - common_probability])

    # First state to second state transition
    if transitions[0] == TRANSITION_RARE:
        # Swap the mappings of stimulus 1 and stimulus 2
        mapping[1], mapping[2] = mapping[2], mapping[1]

    # Second state to third state transition
    if transitions[1] == TRANSITION_RARE:
        # Updated to resolve issue #22
        # Stimulus 3 -> Stimulus 9 (S1-L -> S3)
        # Stimulus 5 -> Stimulus 7 (S2-L -> S1)
        mapping[3], mapping[5] = mapping[5], mapping[3]

        # Stimulus 4 -> Stimulus 10 (S1-R -> S4)
        # Stimulus 6 -> Stimulus 8 (S2-R -> S2)
        mapping[4], mapping[6] = mapping[6], mapping[4]

    # Return a tuple consisting of the mappings and the transitions
    return mapping, transitions


def generate_stay_times(total_trials: int) -> pd.DataFrame:
    """
    Generate the reward stay times
    This is very similar to the subset-sum problem, see: https://en.wikipedia.org/wiki/Subset_sum_problem

    :param total_trials:
    :param min_length: minimum consecutive trials
    :param max_length: maximum consecutive trials
    :return: a sequence of chunks that sum to num_trials
    """
    # Setup the DataFrame with column headings
    df = pd.DataFrame(columns=["reward_stay_time", "reward_stimulus"])

    while df["reward_stay_time"].sum() != total_trials:
        # Iterate until the number of trials has approximately been reached
        stay_time = 0
        while df["reward_stay_time"].sum() + stay_time <= total_trials:
            # Sample a value from the normal distribution
            stay_time = int(np.round(np.random.normal(NORMAL_MEAN, NORMAL_STD, 1), 0))

            # Re-sample it until it is inside the desired range [min_val, max_val]
            while stay_time < 1:
                stay_time = int(np.round(np.random.normal(NORMAL_MEAN, NORMAL_STD, 1), 0))

            # Append the values to the DataFrame, appending a placeholder value of 0 for the reward stimulus
            df = df.append({
                "reward_stay_time": stay_time,
                "reward_stimulus": 0,
            }, ignore_index=True)

        # Calculate the discrepancy between the number of chunked trials and the number of desired trials
        if df["reward_stay_time"].sum() != total_trials:
            # Clear the DataFrame, leading to the DataFrame being regenerated
            df = pd.DataFrame(columns=["reward_stay_time", "reward_stimulus"])

    return df


def generate(name: str, total_trials: int) -> pd.DataFrame:
    """
    Using the ``generate_stay_times`` function, assign mappings and a reward stimulus to each trial.
    A list is generated containing one object for each trial. The objects are the following
    structure::

        {
            "trial_count": i,
            "mappings": {},
            "reward_stimulus": s,
            "transitions": "AB"
        }

    ``trial_count`` is simply a counter, starting at 0 and terminating at ``n-1``, where ``n`` is the number
    of trials generated.
    ``mappings`` is the mappings object for the trial, discussed earlier.
    ``reward_stimulus`` is the stimulus number that contains the reward, 7...10.
    ``transitions`` is a string describing the transition types in each trial, possibly ``CC``, ``CR``,
    ``RC``, or ``RR``.

    The list is returned, ready to be exported to JSON format. If the plotting flag is enabled,
    a histogram is shown depicting the stay times across all the trials.

    :param name: The name of the trials being generated.
    :param total_trials: The number of trials to be generated.
    :return: A list of trial objects defining the behaviour of each trial.
    """

    if FIXED:
        # To-Do: Implement the fixed proportional strategy
        pass
    else:
        print("\tStarting iterations...")
        start_time = time.time()

        stay_times = generate_stay_times(total_trials)
        iteration_count = 1

        if not QUICK:
            # Repeat generation of trial reward stimulus chunks until thresholds exactly satisfied
            while not check_constraints(NORMAL_MEAN, stay_times["reward_stay_time"].mean(), THRESHOLD) \
                    or not check_constraints(NORMAL_STD, stay_times["reward_stay_time"].std(), THRESHOLD):
                stay_times = generate_stay_times(total_trials)
                iteration_count += 1

        print("\t{} iteration/s completed after {} seconds".format(iteration_count, np.round(time.time() - start_time, 4)))

        # Generate a plot
        if PLOT:
            plt.title("Reward Stay Time \"{}\"\nn = {}, mean = {}, var = {}".format(
                name,
                stay_times["reward_stay_time"].sum(),
                round(stay_times["reward_stay_time"].mean(), 4),
                round(stay_times["reward_stay_time"].var(), 4)
            ))
            plt.xlabel("Stay Time (Trials)")
            plt.ylabel("Frequency")
            plt.hist(stay_times["reward_stay_time"], rwidth=1.0, edgecolor='white')
            plt.show()

    # A list to store each of the trials ready to be put into JSON format
    trial_collection = pd.DataFrame(columns=["trial_count", "mappings", "reward_stimulus", "high_rewarding", "transitions"])
    previous_stimulus = -1
    trial_count = 0
    for _row_number, _row in stay_times.iterrows():
        # Generate a new stimulus to represent the reward state
        _stimulus = int(np.random.randint(7, 11, size=1))

        # Re-generate it if it was the same as the previous reward (IMPORTANT)
        while _stimulus == previous_stimulus:
            _stimulus = int(np.random.randint(7, 11, size=1))

        # Update previous stimulus
        previous_stimulus = _stimulus

        # Update reward stimulus in the DataFrame
        _row["reward_stimulus"] = _stimulus

        # Append all trial information to the to-be-JSON collection
        for _ in range(_row["reward_stay_time"]):
            # Generate a trial flow
            _mappings, _transitions = generate_trial_mappings(trial_count, 0.7)

            # Calculate the highest rewarding stimulus
            _frequent_reward = _row["reward_stimulus"]
            if trial_collection["reward_stimulus"].count() > 0:
                _frequent_reward = trial_collection["reward_stimulus"].value_counts().idxmax()

            # Append a new trial for each trial inside a chunk
            trial_collection = trial_collection.append({
                "trial_count": trial_count,
                "mappings": _mappings,
                "reward_stimulus": _row["reward_stimulus"],
                "high_rewarding": _frequent_reward,
                "transitions": _transitions[0] + _transitions[1]
            }, ignore_index=True)
            trial_count += 1

    return trial_collection


# ------------ MAIN ------------
if __name__ == '__main__':
    # Update the seed
    np.random.seed(SEED)
    print(' -------- Start -------- ')
    print('Seed: {}'.format(SEED))

    # ``trials`` holds the DataFrames, this is used for generating the plots and
    # running any analysis.
    trials = {}
    # ``trials_json`` contains effectively the same information as ``trials``, however
    # it contains the DataFrames in an alternate format before being serialised to JSON.
    trials_json = {}

    # Load the file that outlines the trials to generate
    # Extract the layout and number of trials to generate
    parameters = load_parameters()["trials"]

    for trial_type in parameters:
        print("Generating {} trials of stage '{}'".format(trial_type["number"], trial_type["name"]))
        # Run the generate function
        _generated = generate(trial_type["name"], trial_type["number"])
        trials[trial_type["name"]] = _generated
        trials_json[trial_type["name"]] = _generated.to_dict(orient="records")
        print("Finished generating trial type '{}'\n".format(trial_type["name"]))

    # Generate some statistics on the trials
    trial_stage = "main_three"  # We're only interested in the "main" trials
    df = pd.DataFrame(trials[trial_stage])

    # Create a plot for the most frequent reward stimulus
    if PLOT:
        plt.title("Reward Stimulus Frequencies")
        _, bins, patches = plt.hist(df["reward_stimulus"], edgecolor='white', bins=[7, 8, 9, 10, 11], rwidth=1.0)
        plt.xlabel("Reward Stimulus")
        plt.ylabel("Frequency")
        for i in range(len(bins) - 1):
            patches[i].set_facecolor(COLORS[i])
        plt.show()

    # Create a plot for the trial transition types
    if PLOT:
        plt.title("Trial Transition Types")
        plt.hist(df["transitions"], edgecolor='white', weights=np.ones(len(df["transitions"])) / len(df["transitions"]))
        plt.gca().yaxis.set_major_formatter(PercentFormatter(1))
        plt.show()

    # Save the generated data
    save_file("./trials.json", {
        "trials": trials_json
    })
