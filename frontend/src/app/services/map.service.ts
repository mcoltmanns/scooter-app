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

  /*  Method to the backend that retrieves information for a single scooter */
  public getSingleScooterInfo(scooterId: number): Observable<Scooter> {
    return this.http.get<Scooter>(`/api/singleScooter/${scooterId}`);
  }

  /*  Method to the backend that retrieves all product information */
  public getProductInfo(): Observable<Product []> {
    return this.http.get<Product []>('/api/product');
  }

  /* Method to get the information of a specific product by scooter ID */
  public getSingleProductInfo(scooterId: number): Observable<Product> {
    return this.http.get<Product>(`/api/productInfo/${scooterId}`);
  }
}
