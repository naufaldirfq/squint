interface Window {
  pendo?: {
    track: (event: string, properties?: Record<string, unknown>) => void;
  };
}

declare let pendo: {
  initialize: (config: Record<string, unknown>) => void;
  track: (event: string, properties?: Record<string, unknown>) => void;
};
