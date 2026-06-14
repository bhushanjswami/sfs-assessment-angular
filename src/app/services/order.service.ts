import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Order} from '../../models/order'
@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private configService: ConfigService,private http: HttpClient) { }

getOrder(orderId: string) {
  const endpoint = this.configService.getEndpoint('order'); // Returns: "/order/{orderId}"
  
  // Replace the placeholder {orderId} with the actual ID
  const url = `${environment.apiBaseUrl}${endpoint.replace('{orderId}', orderId)}`;

  console.log('Fetching order details from:', url);
  return this.http.get(url);
}

}