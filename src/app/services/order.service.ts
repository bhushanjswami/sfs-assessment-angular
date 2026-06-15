import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private configService: ConfigService, private http: HttpClient) { }

  // Method to fetch data from order API
  getOrder(orderId: string) {
    const endpoint = this.configService.getEndpoint('order');

    const url = `${environment.apiBaseUrl}${endpoint.replace('{orderId}', orderId)}`;

    return this.http.get(url);
  }

}