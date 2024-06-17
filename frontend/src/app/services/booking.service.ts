import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { ResponseMessageCheckout, ResponseMessageReservation } from '../models/response-message';
import { CheckoutObject, ReservationObject } from '../models/booking';
import { Reservation } from '../models/reservation';
import { ReplaySubject } from 'rxjs';

interface ReservationResponse {
  code: number;
  reservation: Reservation;
}

interface ShowReservation {
  imagePath: string;
  redirectPath: string;
  scooterName: string;
  reservationEnd: string;
}

const reservePath = '/api/reserve';

@Injectable({
  providedIn: 'root',
  deps: [HttpClient],
})

export class BookingService {
  // public scooterReserved = new EventEmitter<ShowReservation>();
  // public scooterUnreserved = new EventEmitter();
  public scooterReserved = new ReplaySubject<ShowReservation>(1);
  public scooterUnreserved = new ReplaySubject<void>(1);
  
  constructor(private http: HttpClient) {}


  public postCheckout(data: CheckoutObject): Observable<ResponseMessageCheckout> {
    return this.http.post<ResponseMessageCheckout>('/api/checkout', data).pipe(shareReplay());
  }

  public showReservationIsland(reservation: ShowReservation): void {
    this.scooterReserved.next(reservation);
  }

  public destroyReservationIsland(): void {
    this.scooterUnreserved.next();
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

  // Restore the reservation island if the user has an active reservation (e.g. after a page reload)
  public restoreReservationIsland(): void {
    this.getUserReservation().subscribe({
      next: (value) => {
        const reservation = value.reservation;

        const showReservationObj = {
          imagePath: `http://localhost:8000/img/products/${reservation.scooterImage}`,
          redirectPath: `search/scooter/${reservation.scooter_id}`,
          scooterName: reservation.scooterName,
          reservationEnd: reservation.endsAt
        };

        this.showReservationIsland(showReservationObj);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
}
