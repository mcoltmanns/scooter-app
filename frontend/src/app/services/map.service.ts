import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Scooter } from '../models/scooter';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root',
  deps: [HttpClient],
})
export class MapService {

  constructor(private http: HttpClient) {}

  /* Method to get the the information from all avialable scooters. */
  public getScooterInfo(): Observable<Scooter[]> {
    return this.http.get<Scooter[]>('/api/map');
  }

  /*  Method to the backend that retrieves all product information */
  public getProductInfo(): Observable<Product []> {
    return this.http.get<Product []>('/api/product');
  }

  /* Method to get the information of a specific product by scooter ID */
  public getSingleProductInfo(scooterId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`/api/productInfo/${scooterId}`);
  }

  // DUMMY ROUTE (hier fehlt noch das Argument -> wie lange der Scooter gebucht werden soll)
  bookScooter(scooterId: string): Observable<unknown> {
    return this.http.post('/api/bookScooter', { scooterId });
  }
}
