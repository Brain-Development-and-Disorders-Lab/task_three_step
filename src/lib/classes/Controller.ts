/**
 * Handle operation and controls for each task
 */
export class Controller {
  private keybindings: {
    [x: number]: {
      choice: string;
      handler: (e: KeyboardEvent) => void;
    };
  };

  /**
   * Default constructor
   * @param {any} keybindings object containing the keybindings
   */
  constructor(keybindings: {
    [x: number]: {
      choice: string;
      handler: (e: KeyboardEvent) => void;
    };
  }) {
    this.keybindings = keybindings;
  }

  /**
   * Setup and bind the keys to their functions
   */
  public bind(): void {
    // Iterate over all keybindings
    for (const keycode in this.keybindings) {
      if (Object.prototype.hasOwnProperty.call(this.keybindings, keycode)) {
        // Create event listener for the keydown action
        document.addEventListener(
          "keyup",
          this.keybindings[keycode]["handler"]
        );
      }
    }
  }

  /**
   * Remove key bindings
   */
  public unbind(): void {
    // Iterate over all keybindings
    for (const keycode in this.keybindings) {
      if (Object.prototype.hasOwnProperty.call(this.keybindings, keycode)) {
        // Create event listener for the keydown action
        document.removeEventListener(
          "keyup",
          this.keybindings[keycode]["handler"]
        );
      }
    }
  }
}
