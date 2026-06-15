import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppConfig } from 'src/models/config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private config!: AppConfig;

  constructor(private http: HttpClient) { }

  // Method to load configuration from the API
  loadConfig() {
    return this.http.get<AppConfig>(
      `${environment.apiBaseUrl}/config`
    );
  }

  // Method to set the loaded configuration
  setConfig(config: AppConfig) {
    this.config = config;
  }

  // Method to get the loaded configuration
  getConfig(): AppConfig {
    return this.config;
  }

  // Method to get a specific endpoint from the configuration
  getEndpoint(key: keyof AppConfig['endpoints']) {
    return this.config.endpoints[key];
  }
}
