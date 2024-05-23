import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentOptions } from 'src/app/models/paymentOptions';


@Injectable({
  providedIn: 'root',
  deps: [HttpClient],
})

export class PaymentOptionService {
  
  constructor(private http: HttpClient) {}

  public getAllPaymentMethods(): Observable<PaymentOptions[]> {
    return this.http.get<PaymentOptions[]>('/api/payment'); 
  }

}
