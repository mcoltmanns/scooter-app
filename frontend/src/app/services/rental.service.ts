import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rental, RentalWithScooterId } from '../models/rental';

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
    public getRentalProduct(): Observable<RentalWithScooterId[]> {
        return this.http.get<RentalWithScooterId[]>('/api/bookScooterProducts');
    }
}