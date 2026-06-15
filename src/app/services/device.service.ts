import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  // Method to fetch devices from the API
  getDevices() {

    const endpoint =
      this.configService.getEndpoint('devices');
    return this.http.get(
      `${environment.apiBaseUrl}${endpoint}`
    );
  }
}
