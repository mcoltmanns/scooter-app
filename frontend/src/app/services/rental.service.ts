import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable} from 'rxjs';
import { Rental, ProductWithScooterId } from '../models/rental';

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

    /* request to the backend to generate an invoice for one specific scooter  */
    generateInvoicePdf(rentalId: number, createdAt : string, endedAt: string, scooterName: string, total: string, duration: string, pricePerHour: number, selectedCurrency: string): Observable<Blob> {
        const apiUrl = '/api/bookings/generateInvoice';
        return this.http.post<Blob>(apiUrl, { rentalId, createdAt, endedAt, scooterName, total, duration, pricePerHour, selectedCurrency}, {
          responseType: 'blob' as 'json',
        });
    }
}