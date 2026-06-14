import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
configService: any;
connect(deviceId: string): Observable<any> {

    return new Observable(observer => {
      //const endpoint = this.configService.getEndpoint('events');
     // console.log('Connecting to event source with endpoint:', endpoint, 'and deviceId:', deviceId);
      const source = new EventSource(
        `https://mock-api.assessment.sfsdm.org/events/${deviceId}`
      );
      console.log('Connecting to event source at:', `https://mock-api.assessment.sfsdm.org/events/${deviceId}`);
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
