import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { ResponseMessageCheckout } from '../models/response-message';
import { CheckoutObject } from '../models/booking';

@Injectable({
  providedIn: 'root',
  deps: [HttpClient],
})

export class BookingService {
  
  constructor(private http: HttpClient) {}

  public postCheckout(data: CheckoutObject): Observable<ResponseMessageCheckout> {
    return this.http.post<ResponseMessageCheckout>('/api/checkout', data).pipe(shareReplay());
  }
}
