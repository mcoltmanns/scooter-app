import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { PaymentOptions } from 'src/app/models/paymentOptions';
import { ResponseMessage } from '../models/response-message';

interface Bachelorcard {
  name: string,
  cardNumber: string,
  securityCode?: string,
  expirationDate?: string
}

@Injectable({
  providedIn: 'root',
  deps: [HttpClient],
})

export class PaymentService {
  
  constructor(private http: HttpClient) {}

  public getAllPaymentMethods(): Observable<PaymentOptions[]> {
    return this.http.get<PaymentOptions[]>('/api/payment'); 
  }

  public postBachelorCard(data: Bachelorcard): Observable<ResponseMessage> {
    return this.http.post<ResponseMessage>('/api/payment/bachelorcard', data).pipe(shareReplay());
  }
}
