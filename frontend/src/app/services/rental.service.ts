import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rental } from '../models/rental';

interface RentalsResponse {
  code: number;
  rentals: Rental[];
}

@Injectable({
    providedIn: 'root',
    deps: [HttpClient],
})

export class RentalService{
    constructor(private http: HttpClient) {}

    /* get booking Information for a user*/
    public getRentalInfo(): Observable<RentalsResponse> {
        return this.http.get<RentalsResponse>('/api/bookScooterHistory');
    }
}