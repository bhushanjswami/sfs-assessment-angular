import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  constructor(private configService:ConfigService){}
connect(deviceId: string): Observable<any> {

    return new Observable(observer => {
     const endpoint = this.configService.getEndpoint('events'); // Returns: "/order/{orderId}"
  
  // Replace the placeholder {orderId} with the actual ID
  const url = `${environment.apiBaseUrl}${endpoint.replace('{deviceId}', deviceId)}`;

      const source = new EventSource(url);
      source.onmessage = event => {

        observer.next(
          JSON.parse(event.data)
        );
      };

      source.onerror = error => {
        observer.error(error);
        source.close();
      };

      return () => source.close();
    });
  }

}
