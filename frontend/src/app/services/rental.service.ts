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

    private apiUrl = '/api/bookings/generateInvoice';


    /* Somewhere here is a problem -> PDFs are retrieved over static backend folder at the moment */
    generateInvoicePdf(rentalId: number): Observable<Blob> {
        return this.http.post<Blob>(this.apiUrl, { rentalId }, {
          responseType: 'blob' as 'json',
        });
    }
}