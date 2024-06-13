import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Rental, ProductWithScooterId } from '../models/rental';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
    deps: [HttpClient],
})

export class RentalService{
    constructor(private http: HttpClient) {}

    /* get booking Information for a user*/
    public getRentalInfo(): Observable<Rental[]> {
        return this.http.get<Rental[]>('/api/bookScooterHistory');
    }

    /* get all products for booked scooters */
    public getRentalProduct(): Observable<ProductWithScooterId[]> {
        return this.http.get<ProductWithScooterId[]>('/api/bookScooterProducts');
    }

    public generateInvoicePdf(rentalId: number): Observable<Blob> {
        const url = 'api/bookings/generateInvoice';
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
        });
        const options = {
          headers,
          responseType: 'blob' as 'json', // responseType as blob to receive binary data
        };
        return this.http.post<Blob>(url, { rentalId }, options).pipe(
          catchError(this.handleError)
        );
      }

    /**
    * Handle HTTP errors
    * @param error Error object
    */
    private handleError(error: unknown): Observable<never> {
        console.error('An error occurred:', error);
        return throwError('Something went wrong; please try again later.');
    }
}