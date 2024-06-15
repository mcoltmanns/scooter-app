import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { ResponseMessageCheckout, ResponseMessageReservation } from '../models/response-message';
import { CheckoutObject, ReservationObject } from '../models/booking';
import { Reservation } from '../models/reservation';

interface ReservationResponse {
  code: number;
  reservation: Reservation;
}

const reservePath = '/api/reserve';

@Injectable({
  providedIn: 'root',
  deps: [HttpClient],
})

export class BookingService {
  
  constructor(private http: HttpClient) {}


  public postCheckout(data: CheckoutObject): Observable<ResponseMessageCheckout> {
    return this.http.post<ResponseMessageCheckout>('/api/checkout', data).pipe(shareReplay());
  }

  // try to make a reservation
  public makeReservation(data: ReservationObject): Observable<ResponseMessageReservation> {
    return this.http.post<ResponseMessageReservation>(reservePath, data).pipe(shareReplay());
  }

  // get the reservation info associated with this session
  public getUserReservation(): Observable<ReservationResponse> {
    return this.http.get<ReservationResponse>(reservePath).pipe(shareReplay());
  }

  // end this user's active reservation
  public endReservation(): Observable<void> {
    return this.http.delete<void>(reservePath).pipe(shareReplay());
  }
}
