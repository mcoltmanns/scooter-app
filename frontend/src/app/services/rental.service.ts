import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable} from 'rxjs';
import { ActiveRental, PastRental, ProductWithScooterId } from '../models/rental';
import { ResponseObjEndRental } from '../models/response-message';

interface RentalsResponse {
  code: number;
  activeRentals: ActiveRental[];
  pastRentals: PastRental[];
}

@Injectable({
    providedIn: 'root',
    deps: [HttpClient],
})

export class RentalService{
    constructor(private http: HttpClient) {}

    /* get booking Information for a user*/
    /*
    public getRentalInfo(): Observable<Rental[]> {
        return this.http.get<Rental[]>('/api/bookScooterHistory');
    }
    */

    /* get booking Information for a user*/
    public getRentalInfo(): Observable<RentalsResponse> {
        return this.http.get<RentalsResponse>('/api/bookScooterHistory');
    }

    /* get all products for booked scooters */
    public getRentalProduct(): Observable<ProductWithScooterId[]> {
        return this.http.get<ProductWithScooterId[]>('/api/bookScooterProducts');
    }

    /* Request to end an active dynamic rental */
    public postEndRental(data: { rentalId: number, userLocation: { latitude: number, longitude: number } | null }): Observable<ResponseObjEndRental> {
      let reqObj;
      if (!data.userLocation) {
        reqObj = {
          rentalId: data.rentalId,
        };
      } else {
        reqObj = {
          rentalId: data.rentalId,
          latitude: data.userLocation.latitude,
          longitude: data.userLocation.longitude
        };
      }
      console.log(reqObj);
      return this.http.post<ResponseObjEndRental>('api/rental/end', reqObj);
    }

    /* request to the backend to generate an invoice for one specific scooter  */
    generateInvoicePdf(rentalId: number, selectedCurrency: string): Observable<Blob> {
        const apiUrl = '/api/bookings/generateInvoice';
        return this.http.post<Blob>(apiUrl, { rentalId, selectedCurrency }, {
          responseType: 'blob' as 'json',
        });
    }
}