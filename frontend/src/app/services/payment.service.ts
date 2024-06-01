import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { PaymentOptions } from 'src/app/models/payment';
import { ResponseMessage } from '../models/response-message';
import { BachelorcardObj, HcipalObj, SwpsafeObj } from '../models/payment';

@Injectable({
  providedIn: 'root',
  deps: [HttpClient],
})

export class PaymentService {
  
  constructor(private http: HttpClient) {}

  public getAllPaymentMethods(): Observable<PaymentOptions[]> {
    return this.http.get<PaymentOptions[]>('/api/payment'); 
  }

  public postBachelorCard(data: BachelorcardObj): Observable<ResponseMessage> {
    return this.http.post<ResponseMessage>('/api/payment/bachelorcard', data).pipe(shareReplay());
  }

  public postHcipal(data: HcipalObj): Observable<ResponseMessage> {
    return this.http.post<ResponseMessage>('/api/payment/hcipal', data).pipe(shareReplay());
  }

  public postSwpsafe(data: SwpsafeObj): Observable<ResponseMessage> {
    return this.http.post<ResponseMessage>('/api/payment/swpsafe', data).pipe(shareReplay());
  }

  public deletePaymentMethod(id: number | null): Observable<ResponseMessage> {
    return this.http.delete<ResponseMessage>(`/api/payment/${id}`).pipe(shareReplay());
  }
}
