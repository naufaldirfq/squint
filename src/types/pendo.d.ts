interface Window {
  pendo?: {
    track: (event: string, properties?: Record<string, any>) => void;
    [key: string]: any;
  };
}

declare var pendo: {
  track: (event: string, properties?: Record<string, any>) => void;
  [key: string]: any;
};
