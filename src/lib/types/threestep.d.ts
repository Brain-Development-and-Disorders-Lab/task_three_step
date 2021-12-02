export type StimuliData = {
  name: string;
  stage: string;
  description: string;
  stimuli: string[];
  isInteractive: boolean;
  response: any;
  bindings: {
    [x: number]: {
      choice: string;
      handler: (event: any) => void;
    };
  };
  target: HTMLElement;
  timing: {
    pre: number;
    run: number;
    post: number;
  };
  onFinish: () => void;
};
