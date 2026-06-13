//Interface for application configuration
export interface AppConfig {
  availableLanguages: string[];
  environment: string;
  environmentColour: string;
  environmentName: string;
  endpoints: {
    config: string;
    devices: string;
    events: string;
    order: string;
  };
}