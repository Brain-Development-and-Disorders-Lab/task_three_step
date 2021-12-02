// Imports
import { Configuration } from "../../Configuration";
import { Experiment } from "../API";
import { PLATFORMS } from "../Constants";

// Logging library
import consola from "consola";

/**
 * Utility class to load images and setup any API calls if required
 */
export class StimuliCollection {
  private _collection: { [x: string]: any };
  private _isLoaded: boolean;

  /**
   * Default constructor
   */
  constructor() {
    this._collection = {};
    this._isLoaded = false;
  }

  /**
   * Loader method for the ImageCollection
   */
  public load(): void {
    // Get the Experiment object to determine the platform
    if (
      (window["Experiment"] as Experiment).getPlatform() === PLATFORMS.GORILLA
    ) {
      // Populate the image collection for Gorilla
      // Grab the Gorilla API from the browser
      const _gorilla: any = window["gorilla"];

      // For each of the images from the desktop build, we
      // want to create a new API call to retrieve each from
      // the Gorilla platform
      Object.keys(Configuration.stimuli).forEach((_image) => {
        // Generate the new API call
        Configuration.stimuli[_image] = _gorilla.stimuliURL(_image);
      });

      // Re-assign the images to the Configurationuration object
      this._collection = Configuration.stimuli;
      this._isLoaded = true;
    } else {
      // Populate the image collection for desktop
      this._collection = Configuration.stimuli;
      this._isLoaded = true;
    }
  }

  /**
   * Get the image collection
   * @return {any}
   */
  public getCollection(): { [x: string]: any } {
    if (this._isLoaded) {
      // Return the collection if loaded images
      return this._collection;
    }

    // Raise error and return empty if not loaded yet
    consola.error(
      `Image collection not loaded before accessing! ` +
        `Ensure 'load()' has been called.`
    );
    return {};
  }
}
