// Logging library
import consola from "consola";

/**
 * State abstraction
 */
export class State {
  private id: string;
  private depth: number;
  private column: number;
  private hadRare: boolean;
  private rareDepths: number[];
  private mappings: any;
  private rewardStimulus: number;
  private currentLocation: string;
  private positionalMappings: string[];

  /**
   * Default constructor
   * @param {string} id identifier for the state
   * @param {any} mappings description of paths
   */
  constructor(id: string, mappings: any) {
    this.id = id;
    this.mappings = mappings;
    this.currentLocation = "start";
    this.positionalMappings = this.mappings[this.currentLocation];
    this.depth = 0;
    this.column = 1;
    this.hadRare = false;
    this.rareDepths = [];
    this.rewardStimulus = -1;
  }

  /**
   * Get the identifier of this state
   * @return {string}
   */
  public getID(): string {
    return this.id;
  }

  /**
   * Get the current depth of the state
   * @return {number}
   */
  public getDepth(): number {
    return this.depth;
  }

  /**
   * Get the current column of the state
   * @return {number}
   */
  public getColumn(): number {
    return this.column;
  }

  /**
   * Get whether or not a rare path was hit
   * @return {boolean}
   */
  public getHadRare(): boolean {
    return this.hadRare;
  }

  /**
   * Get the depth from which a rare was hit
   * @return {number[]}
   */
  public getRareDepths(): number[] {
    return this.rareDepths;
  }

  /**
   * Set the stimulus of the reward
   * @param {number} stimulus the reward stimulus
   */
  public setRewardStimulus(stimulus: number): void {
    this.rewardStimulus = stimulus;
  }

  /**
   * Check the stimulus id of the reward
   * @param {number} stimulus the stimulus of interest
   * @return {boolean}
   */
  public isRewardStimulus(stimulus: number): boolean {
    return stimulus === this.rewardStimulus;
  }

  /**
   * Retrieve the current stimuli being displayed
   * @return {string[]}
   */
  public getPositionalMappings(): string[] {
    return this.positionalMappings["stimuli"];
  }

  /**
   * Get the current location or stimulus
   * @return {string}
   */
  public getCurrentLocation(): string {
    return this.currentLocation;
  }

  /**
   * Get the set of mappings for the particular state
   * @return {any}
   */
  public getMappings(): any {
    return this.mappings;
  }

  /**
   * Move to the next stimulus
   * @param {string} selection selection made
   */
  public next(selection: string): void {
    // Check if selection made.
    if (selection === "none") {
      // Select 'left' by default
      consola.warn(`Selected 'left' by default.`);
      selection = "left";
    } else {
      // Increase the depth if a valid selection was made
      // Participant will be reset in the case of a timeout
      this.depth += 1;
    }

    // Assign the selection to the mapping index
    // 'left' selection was the stimulus at index 0,
    // 'right' selection was the stimulus at index 1
    let _index = 0;
    if (selection.startsWith("right")) {
      _index = 1;
    }

    // Get the possible destinations based on the selected stimulus
    const _selectedStimulus =
      this.mappings[this.currentLocation]["stimuli"][_index];

    // Get the corresponding destination mapping for the selected stimulus
    const _destinationMappings = this.mappings[`${_selectedStimulus}`];

    // Update the current stimuli
    this.positionalMappings = _destinationMappings;

    // Update the current location to the selected stimulus
    this.currentLocation = `${_selectedStimulus}`;
  }
}
